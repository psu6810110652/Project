import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductDetail } from './entities/product-detail.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Review } from '../review/entities/review.entity';
import { Favorite } from '../users/entities/favorite.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }



  private addStatsToQuery(query: any) {
    return query
      .addSelect('(SELECT COUNT(*) FROM reviews r WHERE r."productId" = product.id)', 'reviewCount')
      .addSelect('(SELECT ROUND(AVG(r2.rating)::numeric, 1) FROM reviews r2 WHERE r2."productId" = product.id)', 'avgRating')
      .addSelect(`(
        SELECT COALESCE(SUM((item->>'quantity')::int), 0)
        FROM orders o, json_array_elements(o.products::json) item
        WHERE o.status IN ('pending_delivery', 'pending_received', 'completed')
        AND (
          item->>'productId' = product.id::text OR 
          item->>'id' = product.id::text OR
          item->>'name' = product.name
        )
      )`, 'soldCount');
  }

  /**
   * Helper method to map raw results to entities with parsed stats
   */
  private mapRawToProduct(entities: Product[], raw: any[] = []) {
    return entities.map((p, i) => {
      const r = raw[i];
      // Helper to find key in any casing
      const getValue = (key: string) => r ? (r[key] ?? r[key.toLowerCase()] ?? 0) : 0;

      return {
        ...p,
        reviewCount: parseInt(String(getValue('reviewCount'))),
        rating: parseFloat(String(getValue('avgRating'))),
        soldCount: parseInt(String(getValue('soldCount'))),
        thumbnailUrl: (p.thumbnailUrls && p.thumbnailUrls.length > 0) ? p.thumbnailUrls[0] : null,
      };
    });
  }

  // ฟังก์ชันใหม่สำหรับดึงสินค้าตามหมวดหมู่
  async findAllByCategory(categoryId: number, limit: number = 100) {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.detail', 'detail')
      .where('category.id = :categoryId', { categoryId });

    const products = await this.addStatsToQuery(query)
      .orderBy('product.id', 'DESC')
      .take(limit)
      .getRawAndEntities();

    const entities = this.mapRawToProduct(products.entities, products.raw);
    return entities.map(p => ({
      ...p,
      type: (p as any).detail?.type // Flatten type for frontend suggestions
    }));
  }

  async findPromotions(limit: number = 10) {
    const query = this.productRepository.createQueryBuilder('product')
      .select(['product.id', 'product.name', 'product.price', 'product.promotionPrice', 'product.thumbnailUrls', 'product.isPromotion'])
      .where('product.isPromotion = :isPromotion', { isPromotion: true });

    const products = await this.addStatsToQuery(query)
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .getRawAndEntities();

    return this.mapRawToProduct(products.entities, products.raw);
  }

  async findFeatured(limit: number = 10) {
    const query = this.productRepository.createQueryBuilder('product')
      .select(['product.id', 'product.name', 'product.price', 'product.promotionPrice', 'product.thumbnailUrls', 'product.isPromotion'])
      .where('product.isFeatured = :isFeatured', { isFeatured: true });

    const products = await this.addStatsToQuery(query)
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .getRawAndEntities();

    return this.mapRawToProduct(products.entities, products.raw);
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // 1. หาจำนวนทั้งหมด (ใช้ Query แยกเพื่อความชัวร์และไม่รบกวน Query หลัก)
    const totalCountQuery = this.productRepository.createQueryBuilder('product');
    const total = await totalCountQuery.getCount();

    // 2. ดึงข้อมูลสินค้าพร้อม Pagination และ Subqueries (Stats)
    const dataQuery = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    this.addStatsToQuery(dataQuery)
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const products = await dataQuery.getRawAndEntities();
    const items = this.mapRawToProduct(products.entities, products.raw);

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit)
    };
  }

  async findOne(id: string) {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.detail', 'detail')
      .where('product.id = :id', { id });

    const products = await this.addStatsToQuery(query).getRawAndEntities();

    if (products.entities.length === 0) throw new NotFoundException(`ไม่พบสินค้าที่มีรหัส ${id}`);

    const mapped = this.mapRawToProduct(products.entities, products.raw)[0];

    if (mapped.detail) {
      const { description, imageUrls, type, specifications, howToUse } = mapped.detail;
      return {
        ...mapped,
        description,
        imageUrls,
        imageUrl: (imageUrls && imageUrls.length > 0) ? imageUrls[0] : null,
        type,
        specifications,
        howToUse
      };
    }

    return {
      ...mapped,
      imageUrl: null,
    };
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
      product.detail.productId = product.id;
    }

    if (description !== undefined) product.detail.description = description;
    if (imageUrls !== undefined) product.detail.imageUrls = imageUrls;
    if (type !== undefined) product.detail.type = type;
    if (specifications !== undefined) product.detail.specifications = specifications;
    if (howToUse !== undefined) product.detail.howToUse = howToUse;

    await this.productRepository.save(product);

    // Return flattened with stats by calling findOne
    return this.findOne(id);
  }

  async remove(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`ไม่พบสินค้าที่มีรหัส ${id}`);
    return await this.productRepository.remove(product);
  }

  // ====================================================================
  // 🔢  ระบบ Generate Product ID อัตโนมัติ (เช่น 1010000)
  //     Format: [Category ID] + [Type 2 หลัก] + [Sequence 4 หลัก]
  // ====================================================================
  public async generateProductId(categoryId: number, productType?: string): Promise<string> {
    const typeStr = productType || 'ทั่วไป';
    const catPrefix = String(categoryId);
    const minLen = catPrefix.length + 6; // เช่น categoryId = 1 ความยาวจะเป็น 1 + 2 (type) + 4 (seq) = 7

    // 1. หาว่า "ประเภทย่อย" นี้เคยถูกสร้างใน "หมวดหมู่" นี้หรือยัง เพื่อหา Sequence ล่าสุด
    const latestSameType = await this.productRepository
      .createQueryBuilder('p')
      .leftJoin('p.detail', 'pd')
      .where('p.category_id = :categoryId', { categoryId })
      .andWhere("COALESCE(pd.type, 'ทั่วไป') = :type", { type: typeStr })
      .andWhere('LENGTH(p.id) = :len', { len: minLen })
      .andWhere('p.id LIKE :pattern', { pattern: `${catPrefix}%` })
      .orderBy('p.id', 'DESC')
      .getOne();

    if (latestSameType) {
      // มีประเภทนี้อยู่แล้ว เช่น 1010000 -> ถัดไปจะเป็น 1010001
      const currentIdNum = parseInt(latestSameType.id, 10);
      const nextIdNum = currentIdNum + 1;
      return String(nextIdNum);
    }

    // 2. ถ้ายังไม่เคยมี "ประเภทย่อย" (Type) นี้ใน "หมวดหมู่" ให้หา Type Code ล่าสุดที่เพิ่งรันไป
    const latestCategoryProduct = await this.productRepository
      .createQueryBuilder('p')
      .where('p.category_id = :categoryId', { categoryId })
      .andWhere('LENGTH(p.id) = :len', { len: minLen })
      .andWhere('p.id LIKE :pattern', { pattern: `${catPrefix}%` })
      .orderBy('p.id', 'DESC')
      .getOne();

    if (latestCategoryProduct) {
      // สมมติได้ 1020005 -> ตัด catPrefix (1) ออกเหลือ '020005' -> ดึง 2 ตัวแรกคือ '02' (Type Code)
      const remainingStr = latestCategoryProduct.id.substring(catPrefix.length); 
      const lastTypeCodeStr = remainingStr.substring(0, 2); 
      
      let nextTypeCodeNum = parseInt(lastTypeCodeStr, 10) + 1;
      if (nextTypeCodeNum > 99) {
         throw new InternalServerErrorException('รองรับประเภทย่อยได้สูงสุด 99 ประเภทต่อหมวดหมู่');
      }
      const nextTypeCodeFormatted = String(nextTypeCodeNum).padStart(2, '0');
      
      // Sequence เริ่มใหม่ที่ 0000
      return `${catPrefix}${nextTypeCodeFormatted}0000`; 
    }

    // 3. ถ้าไม่มีสินค้าใดๆ เลยในหมวดหมู่นี้ที่เข้าเงื่อนไข (เริ่ม Type แรกสุด '01')
    return `${catPrefix}010000`;
  }

  async create(createProductDto: CreateProductDto) {
    const { id: incomingId, description, imageUrls, type, specifications, howToUse, category, ...productData } = createProductDto as any;

    // รัน ID สินค้าอัตโนมัติตาม Category และ Type (ไม่สนใจ ID ที่ส่งมาจาก Frontend)
    const newId = await this.generateProductId(category.id, type);

    const newProduct = this.productRepository.create({
      ...productData,
      id: newId,
      category: { id: category.id },
      promotionPrice: productData.promotionPrice ?? undefined,
      detail: {
        description,
        imageUrls,
        type: type || 'ทั่วไป',
        specifications,
        howToUse
      }
    });

    const savedProduct = await this.productRepository.save(newProduct);

    // Return flattened with stats by calling findOne
    return this.findOne((savedProduct as any).id);
  }

  // Method to execute raw SQL queries
  async query(query: string, parameters?: any[]) {
    return await this.productRepository.query(query, parameters);
  }
}