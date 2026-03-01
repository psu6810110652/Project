import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity'; // ตรวจสอบ path entity ของคุณ
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  // ฟังก์ชันใหม่สำหรับดึงสินค้าตามหมวดหมู่
  async findAllByCategory(categoryId: number) {
    const products = await this.productRepository.find({
      where: {
        category: { id: categoryId }
      },
      order: { id: 'DESC' }
    });

    return products;
  }

  async findPromotions() {
    return await this.productRepository.find({
      where: { isPromotion: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findFeatured() {
    return await this.productRepository.find({
      where: { isFeatured: true },
      order: { createdAt: 'DESC' }
    });
  }

  // ปรับปรุง findAll เดิมให้ดึงจาก DB จริง
  async findAll() {
    return await this.productRepository.find({
      relations: ['category']
    });
  }

  // Function to find a product by its ID (product code) string
  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category']
    });
    if (!product) throw new NotFoundException(`ไม่พบสินค้าที่มีรหัส ${id}`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // If updateProductDto contains an id, ensure it matches or handle rename (usually PK update is tricky, assume no PK update)
    const product = await this.findOne(id);
    const { id: newId, ...updateData } = updateProductDto as any; // Prevent accidental PK update if passed
    Object.assign(product, updateData);
    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }

  async create(createProductDto: CreateProductDto) {
    const newProduct = this.productRepository.create(createProductDto);
    return await this.productRepository.save(newProduct);
  }
}
