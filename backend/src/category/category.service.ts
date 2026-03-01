import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) { }

  // --- 1. ระบบ Seeding ข้อมูลเริ่มต้น (ทำงานตอน Start Server) ---
  async onModuleInit() {
    const count = await this.categoryRepo.count();
    if (count === 0) {
      console.log('🌱 Seeding Agricultural Categories...');
      await this.categoryRepo.save([
        { id: 1, name: 'ปุ๋ย', description: 'fertilizers' },
        { id: 2, name: 'อุปกรณ์', description: 'tools' },
        { id: 3, name: 'เมล็ดพันธุ์', description: 'seeds' },
        { id: 4, name: 'สารเคมี', description: 'chemicals' },
        { id: 5, name: 'อื่นๆ', description: 'others' },
      ]);
      console.log('✅ Seeding complete.');
    }
  }

  async getCategoryStats() {
    try {
      const categories = await this.categoryRepo.find({
        relations: ['products'],
        order: { id: 'ASC' }
      });

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        productCount: cat.products ? cat.products.length : 0
      }));
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  }


  // --- 3. ดึงหมวดหมู่ทั้งหมด ---
  async findAll() {
    // ดึงข้อมูลทั้งหมด และสามารถใส่ relations: ['products'] ได้ถ้าต้องการดูสินค้าในหมวดนั้นด้วย
    return await this.categoryRepo.find({
      order: { id: 'ASC' } // เรียงลำดับตาม ID
    });
  }

  // --- 4. ดึงหมวดหมู่ตาม ID ---
  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['products'] // ดึงข้อมูลสินค้าที่อยู่ในหมวดหมู่นี้ออกมาด้วย
    });

    if (!category) {
      throw new NotFoundException(`ไม่พบหมวดหมู่ ID #${id}`);
    }
    return category;
  }

  // --- 5. อัปเดตหมวดหมู่ ---
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id); // ตรวจสอบก่อนว่ามีไหม
    const updated = Object.assign(category, updateCategoryDto);
    return await this.categoryRepo.save(updated);
  }

  // --- 6. สร้างหมวดหมู่ (Admin) ---
  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepo.create(createCategoryDto);
    return await this.categoryRepo.save(category);
  }

  // --- 7. ลบหมวดหมู่ (Admin) ---
  async remove(id: number) {
    const category = await this.findOne(id);
    return await this.categoryRepo.remove(category);
  }
}