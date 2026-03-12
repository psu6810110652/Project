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

        // 3. สร้างเลขออเดอร์ให้มีความเฉพาะเจาะจง (ORD + ปี พ.ศ. สองหลัก + เดือน + วัน + เวลา)
        // ใช้เวลาประเทศไทย (UTC+7)
        const now = new Date();
        const thTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));

        const yearBE = (thTime.getFullYear() + 543).toString().slice(-2);
        const month = (thTime.getMonth() + 1).toString().padStart(2, '0');
        const day = thTime.getDate().toString().padStart(2, '0');
        const hours = thTime.getHours().toString().padStart(2, '0');
        const minutes = thTime.getMinutes().toString().padStart(2, '0');

        // ตัวอย่าง: ORD6903121909
        const orderNumber = `ORD${yearBE}${month}${day}${hours}${minutes}`;

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
                'totalAmount', 'status', 'address',
                'phone', 'createdAt', 'updatedAt', 'trackingNumber', 'customerId',
                'cancelReason'
            ],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    findByStatus(status: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { status },
            order: {
                createdAt: 'DESC',
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

    async updateStatus(id: string, status: string, trackingNumber?: string, cancelReason?: string): Promise<Order> {
        const order = await this.findOne(id);
        const previousStatus = order.status;
        order.status = status;

        if (trackingNumber !== undefined) {
            order.trackingNumber = trackingNumber;
        }

        if (cancelReason !== undefined) {
            order.cancelReason = cancelReason;
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
            order: { createdAt: 'DESC' },
        });
    }
}
