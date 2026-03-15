import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductDetail } from './entities/product-detail.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  private readonly PRODUCT_SUMMARY_SELECT: (keyof Product)[] = [
    'id',
    'name',
    'price',
    'promotionPrice',
    'thumbnailUrls',
    'stockQuantity',
    'soldCount',
    'rating',
    'reviewCount',
    'isPromotion',
    'isFeatured',
    'createdAt'
  ];

  // ฟังก์ชันใหม่สำหรับดึงสินค้าตามหมวดหมู่
  async findAllByCategory(categoryId: number, limit: number = 10) {
    const products = await this.productRepository.find({
      select: this.PRODUCT_SUMMARY_SELECT,
      where: {
        category: { id: categoryId }
      },
      order: { id: 'DESC' },
      take: limit,
    });

    return products;
  }

  async findPromotions(limit: number = 10) {
    return await this.productRepository.find({
      select: this.PRODUCT_SUMMARY_SELECT,
      where: { isPromotion: true },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  async findFeatured(limit: number = 10) {
    return await this.productRepository.find({
      select: this.PRODUCT_SUMMARY_SELECT,
      where: { isFeatured: true },
      order: { createdAt: 'DESC' },
      take: limit
    });
  }

  // ปรับปรุง findAll เดิมให้ดึงจาก DB จริง
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.productRepository.findAndCount({
      select: this.PRODUCT_SUMMARY_SELECT,
      relations: ['category'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit)
    };
  }

  // Function to find a product by its ID (product code) string
  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'detail']
    });
    if (!product) throw new NotFoundException(`ไม่พบสินค้าที่มีรหัส ${id}`);

    // Flatten detail for frontend compatibility if detail exists
    if (product.detail) {
      const { description, imageUrls, type, specifications, howToUse } = product.detail;
      return {
        ...product,
        description,
        imageUrls,
        type,
        specifications,
        howToUse
      };
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['detail']
    });
    if (!product) throw new NotFoundException(`ไม่พบสินค้าที่มีรหัส ${id}`);

    const { id: _, description, imageUrls, type, specifications, howToUse, ...updateData } = updateProductDto as any;

    // Update main product fields
    Object.assign(product, updateData);

    // Update or create detail
    if (!product.detail) {
      product.detail = new ProductDetail();
    }

    if (description !== undefined) product.detail.description = description;
    if (imageUrls !== undefined) product.detail.imageUrls = imageUrls;
    if (type !== undefined) product.detail.type = type;
    if (specifications !== undefined) product.detail.specifications = specifications;
    if (howToUse !== undefined) product.detail.howToUse = howToUse;

    const savedProduct = await this.productRepository.save(product);

    // Return flattened
    return {
      ...savedProduct,
      description: savedProduct.detail?.description,
      imageUrls: savedProduct.detail?.imageUrls,
      type: savedProduct.detail?.type,
      specifications: savedProduct.detail?.specifications,
      howToUse: savedProduct.detail?.howToUse
    };
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }

  async create(createProductDto: CreateProductDto) {
    const { description, imageUrls, type, specifications, howToUse, ...productData } = createProductDto as any;

    const newProduct = this.productRepository.create({
      ...productData,
      promotionPrice: productData.promotionPrice ?? undefined,
      detail: {
        description,
        imageUrls,
        type,
        specifications,
        howToUse
      }
    });

    const savedProduct = await this.productRepository.save(newProduct);

    // Return flattened same as findOne
    return {
      ...savedProduct,
      description,
      imageUrls,
      type,
      specifications,
      howToUse
    };
  }

  // Method to execute raw SQL queries
  async query(query: string, parameters?: any[]) {
    return await this.productRepository.query(query, parameters);
  }
}
