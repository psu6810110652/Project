import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        // 1. ตรวจสอบสต็อกสินค้าก่อน (Pre-check)
        for (const item of createOrderDto.products) {
            const pId = item.productId || item.id;
            const product = await this.productRepository.findOne({ where: { id: pId } });
            if (!product) {
                throw new NotFoundException(`ไม่พบสินค้าที่มีรหัส ${pId}`);
            }
            if (product.stockQuantity < item.quantity) {
                throw new Error(`สินค้า ${product.name} มีสต็อกไม่เพียงพอ (คงเหลือ ${product.stockQuantity})`);
            }
        }

        // 2. ตัดสต็อกสินค้า
        for (const item of createOrderDto.products) {
            const pId = item.productId || item.id;
            const product = await this.productRepository.findOne({ where: { id: pId } });
            if (product) {
                product.stockQuantity -= item.quantity;
                await this.productRepository.save(product);
            }
        }

        // 3. สร้างเลขออเดอร์ให้มีความเฉพาะเจาะจง
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
        const randomPart = Math.floor(1000 + Math.random() * 9000).toString();  // 4 random digits
        const orderNumber = `ORD${datePart}${randomPart}`;

        const newOrder = this.ordersRepository.create({
            ...createOrderDto,
            orderNumber,
            status: createOrderDto.status || 'pending_confirm',
        });
        return this.ordersRepository.save(newOrder);
    }

    findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            select: [
                'id', 'orderNumber', 'customerName', 'products',
                'totalAmount', 'orderDate', 'status', 'address',
                'phone', 'createdAt', 'updatedAt', 'trackingNumber', 'customerId'
            ],
            order: {
                orderDate: 'DESC',
            },
        });
    }

    findByStatus(status: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { status },
            select: [
                'id', 'orderNumber', 'customerName', 'products',
                'totalAmount', 'orderDate', 'status', 'address',
                'phone', 'createdAt', 'updatedAt', 'trackingNumber', 'customerId'
            ],
            order: {
                orderDate: 'DESC',
            },
        });
    }

    async findOne(id: string): Promise<Order> {
        // findOne should return all fields including paymentSlip
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException(`Order #${id} not found`);
        }
        return order;
    }

    async updateStatus(id: string, status: string, trackingNumber?: string): Promise<Order> {
        const order = await this.findOne(id);
        const previousStatus = order.status;
        order.status = status;

        if (trackingNumber !== undefined) {
            order.trackingNumber = trackingNumber;
        }

        // คืนสต็อกสินค้าหากออเดอร์ถูกยกเลิก (และก่อนหน้านี้ยังไม่ได้ยกเลิก)
        if (status === 'cancelled' && previousStatus !== 'cancelled') {
            for (const item of order.products) {
                const pId = item.productId || item.id;
                const product = await this.productRepository.findOne({ where: { id: pId } });
                if (product) {
                    product.stockQuantity += item.quantity;
                    await this.productRepository.save(product);
                }
            }
        }

        return this.ordersRepository.save(order);
    }

    findByCustomerId(customerId: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { customerId },
            select: [
                'id', 'orderNumber', 'customerName', 'products',
                'totalAmount', 'orderDate', 'status', 'address',
                'phone', 'createdAt', 'updatedAt', 'trackingNumber', 'customerId'
            ],
            order: { orderDate: 'DESC' },
        });
    }
}
