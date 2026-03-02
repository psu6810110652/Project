import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
  ) { }

  // 1. เพิ่มสินค้าลงตะกร้า (Add to Cart)
  async create(userId: number, createCartDto: CreateCartDto) {
    // เช็คก่อนว่าสินค้านี้ ลูกค้าคนนี้เคยหยิบใส่ตะกร้าหรือยัง?
    let cartItem = await this.cartRepo.findOne({
      where: {
        user_id: userId,
        product_id: createCartDto.product_id // ต้องแก้ DTO ให้รับค่า product_id มาด้วยนะครับ
      }
    });

    if (cartItem) {
      //ถ้ามีอยู่แล้ว -> ให้บวกจำนวนเพิ่ม
      cartItem.quantity += (createCartDto.quantity || 1);
      return await this.cartRepo.save(cartItem);
    } else {
      // ถ้ายังไม่มี -> สร้างรายการใหม่ในตะกร้า
      const newCartItem = this.cartRepo.create({
        user_id: userId,
        product_id: createCartDto.product_id,
        quantity: createCartDto.quantity || 1,
      });
      return await this.cartRepo.save(newCartItem);
    }
  }

  // 2. ดูตะกร้าสินค้าของตัวเอง (Get My Cart)
  async findAllByUserId(userId: number) {
    return await this.cartRepo.find({
      where: { user_id: userId },
      relations: ['product'],
      order: { id: 'DESC' }
    });
  }

  // 3. ดึงดูรายการเดียว 
  async findOne(id: number, userId: number) {
    const cartItem = await this.cartRepo.findOne({
      where: { id: id, user_id: userId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException(`ไม่พบสินค้านี้ในตะกร้าของคุณ`);
    }
    return cartItem;
  }

  // 4. อัปเดตจำนวนสินค้าในตะกร้า (เช่น ลูกค้ากดปุ่ม + / - ในหน้าเว็บ)
  async update(id: number, userId: number, updateCartDto: UpdateCartDto) {
    const cartItem = await this.findOne(id, userId); // เช็คว่าเป็นของตัวเองไหม

    // อัปเดตจำนวนใหม่
    if (updateCartDto.quantity !== undefined) {
      cartItem.quantity = updateCartDto.quantity;
    }
    return await this.cartRepo.save(cartItem);
  }

  // 5. ลบสินค้าออกจากตะกร้า (กดปุ่มถังขยะ)
  async remove(id: number, userId: number) {
    const cartItem = await this.findOne(id, userId); // เช็คว่าเป็นของตัวเองไหม
    return await this.cartRepo.remove(cartItem);
  }

  //ล้างตะกร้า (ใช้ตอนที่ลูกค้ากด ยืนยันการสั่งซื้อ สำเร็จแล้ว)
  async clearCart(userId: number) {
    const myCartItems = await this.cartRepo.find({ where: { user_id: userId } });
    if (myCartItems.length > 0) {
      return await this.cartRepo.remove(myCartItems);
    }
    return { message: 'ตะกร้าว่างเปล่าอยู่แล้ว' };
  }
}
