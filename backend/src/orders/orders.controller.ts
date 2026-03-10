import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
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
    async create(@Body() createOrderDto: CreateOrderDto) {
        console.log('--- ข้อมูลที่มาถึงหลังบ้าน ---');
        console.log('ชื่อลูกค้า:', createOrderDto.customerName);
        console.log('ที่อยู่:', createOrderDto.address);
        console.log('เบอร์โทร:', createOrderDto.phone);
        console.log('ราคารวม:', createOrderDto.totalAmount);
        console.log('จำนวนสินค้า:', createOrderDto.products?.length);
        console.log('มีสลิปไหม?:', createOrderDto.paymentSlip ? `✅ มีสลิปส่งมา! (ยาว ${createOrderDto.paymentSlip.length} ตัวอักษร)` : '❌ ไม่มีสลิป (undefined)');

        try {
            const result = await this.ordersService.create(createOrderDto);
            console.log('บันทึกออเดอร์สำเร็จ:', result.id);
            return result;
        } catch (error) {
            console.error('❌ เกิดข้อผิดพลาดใน Backend (create order):', error);
            throw error;
        }
    }

    @Get('all-pending')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    findAllPending() {
        return this.ordersService.findAll(); // Could be refined to only return all types of pending
    }

    // 👤 User ดึง orders ของตัวเอง (GET /api/admin/orders/my-orders)
    @Get('my-orders')
    @UseGuards(AuthGuard('jwt'))
    async getMyOrders(@Request() req) {
        try {
            const userId = String(req.user.sub || req.user.userId);
            return await this.ordersService.findByCustomerId(userId);
        } catch (error) {
            console.error('Error in OrdersController.getMyOrders:', error);
            throw error; // let the global handler convert to 500
        }
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
