import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

// Prefix is /api/admin/orders to match the frontend expectations
@Controller('api/admin/orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
        console.log('--- ข้อมูลที่มาถึงหลังบ้าน ---');
        console.log('ชื่อลูกค้า:', createOrderDto.customerName);
        console.log('มีสลิปไหม?:', createOrderDto.paymentSlip ? '✅ มีสลิปส่งมา!' : '❌ ไม่มีสลิป (undefined)');

        return this.ordersService.create(createOrderDto);
    }

    @Get('all-pending')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: string,
        @Body('trackingNumber') trackingNumber?: string
    ) {
        return this.ordersService.updateStatus(id, status, trackingNumber);
    }
}
