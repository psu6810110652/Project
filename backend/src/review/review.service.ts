import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  async create(data: any) {
    try {
      const { productId, userId, orderID, rating, reviewContent, orderDate } = data;

      const parsedRating = parseFloat(String(rating));
      const finalRating = isNaN(parsedRating) ? 5 : parsedRating;

      const reviewPayload: any = {
        rating: finalRating,
        reviewContent: String(reviewContent || ''),
        product: productId ? { id: String(productId) } : undefined,
        user: userId ? { id: String(userId) } : undefined
      };

      if (orderID && orderID !== 'null' && orderID !== 'undefined') {
        reviewPayload.order = { id: String(orderID) };
      }

      if (orderDate) {
        const d = new Date(orderDate);
        if (!isNaN(d.getTime())) {
          reviewPayload.orderDate = d;
        }
      }

      const review = this.reviewRepository.create(reviewPayload);
      return await this.reviewRepository.save(review);
    } catch (error) {
      console.error('[ReviewService] Error creating review:', error);
      if (error.code === '22P02') {
        throw new BadRequestException(`Invalid ID format: ${error.message}`);
      }
      throw new InternalServerErrorException(`Review save failed: ${error.message}`);
    }
  }

  async update(id: string, data: any) {
    try {
      const review = await this.reviewRepository.findOne({ where: { id } });
      if (!review) throw new NotFoundException('ไม่พบรีวิว');

      const { productId, userId, orderID, ...rest } = data;
      
      // Update properties
      Object.assign(review, rest);
      
      // Update relations if provided
      if (productId) review.product = { id: productId } as any;
      if (userId) review.user = { id: String(userId) } as any;
      if (orderID) review.order = { id: orderID } as any;
      if (data.orderDate) review.orderDate = new Date(data.orderDate);

      return await this.reviewRepository.save(review);
    } catch (error) {
      console.error('[ReviewService] Error updating review:', error);
      throw error;
    }
  }

  async findByProduct(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user', 'order'],
      order: { createdAt: 'DESC' }
    });

    // แมปข้อมูลให้ตรงกับที่ Frontend ต้องการ
    return reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      reviewContent: r.reviewContent,
      createdAt: r.createdAt,
      orderDate: r.orderDate || (r.order ? r.order.createdAt : null),
      orderID: r.orderID,
      userId: r.userId,
      userName: r.user?.name || r.user?.username || 'ผู้ใช้ทั่วไป'
    }));
  }

  async findByOrder(orderId: string, userId: string) {
    return await this.reviewRepository.find({
      where: {
        order: { id: orderId },
        user: { id: userId }
      },
      relations: ['product']
    });
  }

  async delete(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('ไม่พบรีวิว');

    const productId = review.productId;
    await this.reviewRepository.remove(review);


    return { message: 'ลบรีวิวเรียบร้อย' };
  }
}
