import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // --- 1. ระบบ Seeding ข้อมูลเริ่มต้น (ทำงานตอน Start Server) ---
  async onModuleInit() {
    const count = await this.categoryRepo.count();
    if (count === 0) {
      console.log('🌱 Seeding Agricultural Categories...');
      await this.categoryRepo.save([
        { name: 'ปุ๋ย', description: 'fertilizers' },
        { name: 'อุปกรณ์', description: 'tools' },
        { name: 'เมล็ดพันธุ์', description: 'seeds' },
        { name: 'สารเคมี', description: 'chemicals' },
        { name: 'อื่นๆ', description: 'others' },
      ]);
      console.log('✅ Seeding complete.');
    }
  }

  // --- 2. สร้างหมวดหมู่ใหม่ ---
  async create(createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoryRepo.create(createCategoryDto);
    return await this.categoryRepo.save(newCategory);
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

  // --- 6. ลบหมวดหมู่ ---
  async remove(id: number) {
    const category = await this.findOne(id); // ตรวจสอบก่อนว่ามีไหม
    await this.categoryRepo.remove(category);
    return { message: `ลบหมวดหมู่ #${id} เรียบร้อยแล้ว` };
  }
}