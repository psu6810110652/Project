import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) { }

  // 1. สร้างที่อยู่ใหม่ (ต้องรับ userId มาจาก Controller)
  async create(userId: string, createAddressDto: CreateAddressDto) {
    const newAddress = this.addressRepo.create({
      ...createAddressDto,
      user: { id: userId }, // ผูกที่อยู่นี้เข้ากับ ID ของลูกค้าที่ล็อกอินอยู่
    });
    return await this.addressRepo.save(newAddress);
  }

  // 2. ดึงที่อยู่ "เฉพาะของลูกค้าคนนั้น"
  async findAllByUserId(userId: string) {
    return await this.addressRepo.find({
      where: { user: { id: userId } },
      // เรียงลำดับเอาที่อยู่ล่าสุดขึ้นก่อน
      order: { id: 'DESC' }
    });
  }

  // 3. ดึงรายละเอียดที่อยู่ 1 รายการ (ต้องเช็คว่าเป็นของลูกค้าคนนี้จริงไหม)
  async findOne(id: number, userId: string) {
    const address = await this.addressRepo.findOne({
      where: { id: id, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException(`ไม่พบที่อยู่ ID #${id} หรือคุณไม่มีสิทธิ์เข้าถึง`);
    }
    return address;
  }

  // 4. แก้ไขที่อยู่
  async update(id: number, userId: string, updateAddressDto: UpdateAddressDto) {
    // ใช้ฟังก์ชัน findOne ด้านบนเพื่อเช็คก่อนว่ามีที่อยู่นี้จริง และเป็นของลูกค้าคนนี้จริง
    const address = await this.findOne(id, userId);

    // เอาข้อมูลใหม่มาทับข้อมูลเดิม แล้วบันทึก
    const updatedAddress = Object.assign(address, updateAddressDto);
    return await this.addressRepo.save(updatedAddress);
  }

  // 5. ลบที่อยู่
  async remove(id: number, userId: string) {
    // เช็คสิทธิ์ก่อนลบเช่นกัน
    const address = await this.findOne(id, userId);
    return await this.addressRepo.remove(address);
  }
}