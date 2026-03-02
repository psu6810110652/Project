import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
    ) { }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const orderNumber = Math.floor(100000 + Math.random() * 900000).toString(); // Generate random 6 digit order number
        const newOrder = this.ordersRepository.create({
            ...createOrderDto,
            orderNumber,
            status: createOrderDto.status || 'pending_confirm',
        });
        return this.ordersRepository.save(newOrder);
    }

    findAll(): Promise<Order[]> {
        return this.ordersRepository.find({
            order: {
                orderDate: 'DESC',
            },
        });
    }

    findByStatus(status: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { status },
            order: {
                orderDate: 'DESC',
            },
        });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.ordersRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException(`Order #${id} not found`);
        }
        return order;
    }

    async updateStatus(id: string, status: string, trackingNumber?: string): Promise<Order> {
        const order = await this.findOne(id);
        order.status = status;
        if (trackingNumber !== undefined) {
            order.trackingNumber = trackingNumber;
        }
        return this.ordersRepository.save(order);
    }

    findByCustomerId(customerId: string): Promise<Order[]> {
        return this.ordersRepository.find({
            where: { customerId },
            order: { orderDate: 'DESC' },
        });
    }
}
