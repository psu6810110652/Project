import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

// Prefix is /api/admin/orders to match the frontend expectations
@Controller('api/admin/orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }
@Post()
    create(@Body() createOrderDto: CreateOrderDto) {
        // 🌟 ใส่บรรทัดนี้ลงไป เพื่อเช็คว่าข้อมูลมาถึงหลังบ้านไหม!
        console.log('--- ข้อมูลที่มาถึงหลังบ้าน ---');
        console.log('ชื่อลูกค้า:', createOrderDto.customerName);
        console.log('มีสลิปไหม?:', createOrderDto.paymentSlip ? '✅ มีสลิปส่งมา!' : '❌ ไม่มีสลิป (undefined)');
        
        return this.ordersService.create(createOrderDto);
    }

    @Get('all-pending')
    findAllPending() {
        return this.ordersService.findAll(); // Could be refined to only return all types of pending
    }

    @Get('pending-confirm')
    findPendingConfirm() {
        return this.ordersService.findByStatus('pending_confirm');
    }

    @Get('pending-delivery')
    findPendingDelivery() {
        return this.ordersService.findByStatus('pending_delivery');
    }

    @Get('pending-received')
    findPendingReceived() {
        return this.ordersService.findByStatus('pending_received');
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Put(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: string,
        @Body('trackingNumber') trackingNumber?: string
    ) {
        return this.ordersService.updateStatus(id, status, trackingNumber);
    }
}
