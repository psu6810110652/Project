import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

    async findAllPending(): Promise<Order[]> {
        const pendingStatuses = ['pending_confirm', 'pending_delivery', 'pending_received'];
        return this.ordersRepository.find({
            where: { status: In(pendingStatuses) }, // Use In operator for multiple statuses
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

        const confirmedStatuses = ['pending_delivery', 'pending_received', 'completed'];
        const wasConfirmed = confirmedStatuses.includes(previousStatus);
        const isNowConfirmed = confirmedStatuses.includes(status);

        // คืนสต็อกสินค้าหากออเดอร์ถูกยกเลิก (และไม่ได้ถูกยกเลิกมาก่อนหน้า)
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

    async getTodaySales(): Promise<number> {
        const confirmedStatuses = ['pending_delivery', 'pending_received', 'completed'];

        // หาจุดเริ่มต้นของวันนี้ในเวลาประเทศไทย (Asia/Bangkok)
        const now = new Date();
        const bangkokDateString = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }); // "YYYY-MM-DD"
        const startOfToday = new Date(`${bangkokDateString}T00:00:00.000+07:00`);

        const result = await this.ordersRepository
            .createQueryBuilder('order')
            .where('order.createdAt >= :startOfToday', { startOfToday })
            .andWhere('order.status IN (:...statuses)', { statuses: confirmedStatuses })
            .select('SUM(order.totalAmount)', 'sum')
            .getRawOne();
        return parseFloat(result?.sum) || 0;
    }

    async getPendingOrdersCount(): Promise<number> {
        const pendingStatuses = ['pending_confirm', 'pending_delivery', 'pending_received'];
        let total = 0;
        for (const status of pendingStatuses) {
            total += await this.ordersRepository.count({ where: { status } });
        }
        return total;
    }

    async getWeeklySales(): Promise<{ date: string; total: number }[]> {
        const confirmedStatuses = ['pending_delivery', 'pending_received', 'completed'];

        // หาวันที่ 7 วันที่แล้วแบบเริ่มต้นวัน (นับถอยหลัง 6 วันรวมวันนี้เป็น 7)
        const now = new Date();
        const bangkokDateString = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
        const startOfToday = new Date(`${bangkokDateString}T00:00:00.000+07:00`);

        const sevenDaysAgo = new Date(startOfToday);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const rows = await this.ordersRepository
            .createQueryBuilder('order')
            .where('order.createdAt >= :from', { from: sevenDaysAgo })
            .andWhere('order.status IN (:...statuses)', { statuses: confirmedStatuses })
            .select("DATE(order.createdAt AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok')", 'date')
            .addSelect('SUM(order.totalAmount)', 'total')
            .groupBy("date")
            .orderBy('date', 'ASC')
            .getRawMany();

        // เติมวันที่ขาดหายเป็น 0
        const result: { date: string; total: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(startOfToday);
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }); // "YYYY-MM-DD"

            // Postgres DATE() might return string, Date object, or something else depending on driver.
            // We check for exact match or startWith.
            const found = rows.find((r) => {
                const rDate = r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date?.toString();
                return rDate === key || rDate?.startsWith(key);
            });

            result.push({ date: key, total: found ? parseFloat(found.total) : 0 });
        }
        return result;
    }

    private async createSoldProducts(order: Order): Promise<void> {
        for (const item of order.products) {
            const pId = item.productId || item.id;
            const product = await this.productRepository.findOne({
                where: { id: pId },
                relations: ['category', 'detail']
            });

            if (product) {
                const unitPrice = Number(item.price || product.price || 0);
                const quantity = Number(item.quantity || 1);
                const totalPrice = unitPrice * quantity;
            }
        }
    }
}
