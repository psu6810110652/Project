import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, Query } from '@nestjs/common';
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

    @Get('today-sales')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    getTodaySales() {
        return this.ordersService.getTodaySales();
    }

    @Get('pending-count')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    getPendingCount() {
        return this.ordersService.getPendingOrdersCount();
    }

    @Get('weekly-sales')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    getWeeklySales() {
        return this.ordersService.getWeeklySales();
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
        @Body('trackingNumber') trackingNumber?: string,
        @Body('cancelReason') cancelReason?: string
    ) {
        return this.ordersService.updateStatus(id, status, trackingNumber, cancelReason);
    }

    // 👤 User ยกเลิกออเดอร์ตัวเอง ได้เฉพาะตอนที่ยังรอการยืนยัน
    @Put(':id/cancel')
    @UseGuards(AuthGuard('jwt'))
    async cancelOrder(@Param('id') id: string, @Request() req) {
        try {
            const userId = String(req.user.sub || req.user.userId);
            const order = await this.ordersService.findOne(id);

            // ตรวจสอบว่าเป็นเจ้าของออเดอร์ไหม
            if (order.customerId !== userId) {
                throw new Error('คุณไม่มีสิทธิ์ยกเลิกออเดอร์นี้');
            }

            // ตรวจสอบสถานะว่ายังยกเลิกได้ไหม (ต้องเป็น pending_confirm)
            if (order.status !== 'pending_confirm' && order.status !== '') {
                throw new Error('ไม่สามารถยกเลิกออเดอร์นี้ได้แล้วเนื่องจากร้านค้าได้ดำเนินการแล้ว');
            }

            return await this.ordersService.updateStatus(id, 'cancelled', undefined, 'ยกเลิกเอง');
        } catch (error) {
            console.error('Error in OrdersController.cancelOrder:', error);
            throw error;
        }
    }

    // 👤 User ยืนยันได้รับสินค้า (เปลี่ยนเป็น completed)
    @Put(':id/received')
    @UseGuards(AuthGuard('jwt'))
    async confirmReceived(@Param('id') id: string, @Request() req) {
        try {
            const userId = String(req.user.sub || req.user.userId);
            const order = await this.ordersService.findOne(id);

            // ตรวจสอบว่าเป็นเจ้าของออเดอร์ไหม
            if (order.customerId !== userId) {
                throw new Error('คุณไม่มีสิทธิ์จัดการออเดอร์นี้');
            }

            // ตรวจสอบสถานะ (ต้องเป็น pending_received)
            if (order.status !== 'pending_received') {
                throw new Error('สถานะออเดอร์ไม่ถูกต้องสำหรับการยืนยันการรับสินค้า');
            }

            return await this.ordersService.updateStatus(id, 'completed');
        } catch (error) {
            console.error('Error in OrdersController.confirmReceived:', error);
            throw error;
        }
    }

    // Banner endpoints - สำหรับดึงข้อมูลสินค้าที่ขายได้สำหรับแสดงใน banner
    @Get('banner/recent-sold')
    async getRecentSoldProducts(@Param('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return await this.ordersService.getRecentSoldProducts(limitNum);
    }

    @Get('banner/top-selling')
    async getTopSellingProducts(@Param('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return await this.ordersService.getTopSellingProducts(limitNum);
    }

    @Get('banner/recent-sold/:categoryId')
    async getRecentSoldProductsByCategory(
        @Param('categoryId') categoryId: string,
        @Query('limit') limit?: string
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 5;
        return await this.ordersService.getRecentSoldProductsByCategory(categoryId, limitNum);
    }
}
