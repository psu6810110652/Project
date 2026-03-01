import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartsController {
  constructor(private readonly cartsService: CartsService) { }

  @Post('add')
  addItem(@Request() req, @Body() body: { productId: number; quantity: number }) {
    return this.cartsService.create(req.user.sub, { product_id: body.productId, quantity: body.quantity });
  }

  @Get()
  getMyCart(@Request() req) {
    return this.cartsService.findAllByUserId(req.user.sub);
  }

  @Delete(':cartItemId')
  removeItem(@Request() req, @Param('cartItemId') cartItemId: string) {
    return this.cartsService.remove(req.user.sub, +cartItemId);
  }
}
