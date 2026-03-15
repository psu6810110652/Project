import { Injectable, NotFoundException } from '@nestjs/common';
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

  private readonly PRODUCT_SUMMARY_SELECT: (keyof Product)[] = [
    'id',
    'name',
    'price',
    'promotionPrice',
    'thumbnailUrls',
    'stockQuantity',
    'isPromotion',
    'isFeatured',
    'createdAt'
  ];

  /**
   * Helper method to add calculated statistics to a QueryBuilder
   */
  private addStatsToQuery(query: any) {
    return query
      .addSelect('(SELECT COUNT(*) FROM reviews r WHERE r."productId" = product.id)', 'reviewCount')
      .addSelect('(SELECT COUNT(*) FROM user_favorites f WHERE f.product_id = product.id)', 'favoriteCount')
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
  private mapRawToProduct(entities: Product[], raw: any[]) {
    return entities.map((p, i) => {
      const r = raw[i];
      // Helper to find key in any casing (sqlite/postgres/etc might vary)
      const getValue = (key: string) => r[key] ?? r[key.toLowerCase()] ?? 0;

      return {
        ...p,
        reviewCount: parseInt(String(getValue('reviewCount'))),
        favoriteCount: parseInt(String(getValue('favoriteCount'))),
        rating: parseFloat(String(getValue('avgRating'))),
        soldCount: parseInt(String(getValue('soldCount'))),
        thumbnailUrl: (p.thumbnailUrls && p.thumbnailUrls.length > 0) ? p.thumbnailUrls[0] : null,
      };
    });
  }

  // ฟังก์ชันใหม่สำหรับดึงสินค้าตามหมวดหมู่
  async findAllByCategory(categoryId: number, limit: number = 20) {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('category.id = :categoryId', { categoryId });

    const products = await this.addStatsToQuery(query)
      .orderBy('product.id', 'DESC')
      .take(limit)
      .getRawAndEntities();

    return this.mapRawToProduct(products.entities, products.raw);
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

    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Get count BEFORE adding stats subqueries for performance
    const total = await query.getCount();

    this.addStatsToQuery(query)
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const products = await query.getRawAndEntities();

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

    // Return flattened with stats by calling findOne
    return this.findOne((savedProduct as any).id);
  }

  // Method to execute raw SQL queries
  async query(query: string, parameters?: any[]) {
    return await this.productRepository.query(query, parameters);
  }
}
