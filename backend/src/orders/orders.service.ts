import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
        // 1. ตัดสต็อกสินค้า
        for (const item of createOrderDto.products) {
            const pId = item.productId || item.id;
            const product = await this.productRepository.findOne({ where: { id: pId } });

            if (!product) {
                throw new NotFoundException(`ไม่พบสินค้าที่มีรหัส ${pId}`);
            }

            const stockQty = Number(product.stockQuantity || 0);
            const orderQty = Number(item.quantity || 0);

            if (stockQty < orderQty) {
                throw new BadRequestException(`สินค้า ${product.name} มีสต็อกไม่เพียงพอ (คงเหลือ ${stockQty})`);
            }

            product.stockQuantity = stockQty - orderQty;
            await this.productRepository.save(product);
        }

        // 3. สร้างเลขออเดอร์ (ORD + YYMMDD + HHMMSS + Random3)
        const now = new Date();
        const thTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));

        const yearBE = (thTime.getFullYear() + 543).toString().slice(-2);
        const month = (thTime.getMonth() + 1).toString().padStart(2, '0');
        const day = thTime.getDate().toString().padStart(2, '0');
        const hours = thTime.getHours().toString().padStart(2, '0');
        const minutes = thTime.getMinutes().toString().padStart(2, '0');
        const seconds = thTime.getSeconds().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        const orderNumber = `ORD${yearBE}${month}${day}${hours}${minutes}${seconds}${random}`;

        try {
            const newOrder = this.ordersRepository.create({
                ...createOrderDto,
                orderNumber,
                status: createOrderDto.status || 'pending_confirm',
            });
            return await this.ordersRepository.save(newOrder);
        } catch (error: any) {
            console.error('Error saving order:', error);
            if (error.code === '23505') {
                throw new BadRequestException('เลขออเดอร์ซ้ำซ้อน กรุณาลองใหม่');
            }
            throw new InternalServerErrorException(`ไม่สามารถบันทึกออเดอร์ได้: ${error.message}`);
        }
    }

    findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            select: [
                'id',
                'orderNumber',
                'customerName',
                'products',
                'totalAmount',
                'status',
                'address',
                'phone',
                'createdAt',
                'updatedAt',
                'trackingNumber',
                'customerId',
                'cancelReason',
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
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException(`ไม่พบออเดอร์รหัส ${id}`);
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

        // อัปเดต soldCount เมื่อออเดอร์สำเร็จ
        if (status === 'completed' && previousStatus !== 'completed') {
            for (const item of order.products) {
                const pId = item.productId || item.id;
                const product = await this.productRepository.findOne({ where: { id: pId } });
                if (product) {
                    product.soldCount = Number(product.soldCount || 0) + Number(item.quantity || 0);
                    await this.productRepository.save(product);
                }
            }
        }

        // คืนสต็อกสินค้าหากออเดอร์ถูกยกเลิก
        if (status === 'cancelled' && previousStatus !== 'cancelled') {
            for (const item of order.products) {
                const pId = item.productId || item.id;
                const product = await this.productRepository.findOne({ where: { id: pId } });
                if (product) {
                    product.stockQuantity = Number(product.stockQuantity || 0) + Number(item.quantity || 0);
                    await this.productRepository.save(product);
                }
            }
        }

        return await this.ordersRepository.save(order);
    }

    findByCustomerId(customerId: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }
}
