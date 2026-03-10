import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) { }

  private isUuid(id: any): boolean {
    if (typeof id !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  async create(data: any) {
    try {
      // 1. Safe check for existing review
      const query = this.reviewRepository.createQueryBuilder('review')
        .where('review.productId = :productId', { productId: data.productId })
        .andWhere('review.userId = :userId', { userId: data.userId });

      // Only add orderID filter if it's present
      if (data.orderID) {
        query.andWhere('review.orderID = :orderID', { orderID: data.orderID });
      }

      const existing = await query.getOne();

      if (existing) {
        console.log(`[ReviewService] Updating existing review: ${existing.id}`);
        return this.update(existing.id, data);
      }

      // 2. Normalize relations for new record
      const payload: any = { ...data };

      if (data.productId) {
        payload.product = { id: data.productId };
        delete payload.productId;
      }

      if (data.userId && data.userId !== 'guest') {
        payload.user = { id: data.userId };
        delete payload.userId;
      } else {
        delete payload.userId; // Don't try to link to 'guest' user
      }

      // ONLY treat as relation if it's a valid UUID to avoid Postgres error 22P02
      if (data.orderID && this.isUuid(data.orderID)) {
        payload.order = { id: data.orderID };
        delete payload.orderID;
      } else if (data.orderID) {
        // Keep as raw orderID string if not UUID
        payload.orderID = data.orderID;
      }

      if (data.orderDate) {
        payload.orderDate = new Date(data.orderDate);
      }

      const newReview = this.reviewRepository.create(payload);
      const savedReview = await this.reviewRepository.save(newReview);

      const finalId = (savedReview as any).id || (Array.isArray(savedReview) ? savedReview[0].id : 'unknown');
      console.log(`[ReviewService] Created new review: ${finalId}`);
      return savedReview;
    } catch (error) {
      console.error('CRITICAL ERROR in ReviewService.create:', error);
      throw error;
    }
  }

  async findByProduct(productId: string) {
    try {
      // Attempt to find with relations, but be ready for failures if UUIDs are malformed
      let reviews: Review[];
      try {
        reviews = await this.reviewRepository.find({
          where: { product: { id: productId } },
          relations: ['user', 'order'],
          order: { createdAt: 'DESC' },
        });
      } catch (err) {
        console.warn(`[ReviewService] Relational find with 'order' failed for product ${productId}, falling back:`, err.message);
        // Fallback 1: Try without 'order'
        try {
          reviews = await this.reviewRepository.find({
            where: { product: { id: productId } },
            relations: ['user'],
            order: { createdAt: 'DESC' },
          });
        } catch (innerErr) {
          console.warn(`[ReviewService] Relational find with 'user' failed, falling back to raw:`, innerErr.message);
          // Fallback 2: Raw data only
          reviews = await this.reviewRepository.find({
            where: { product: { id: productId } },
            order: { createdAt: 'DESC' },
          });
        }
      }

      return reviews.map(r => {
        // Priority: Username -> User ID -> Fallback
        const userId = r.user ? r.user.id : (r as any).userId;
        const name = r.user ? r.user.username : (userId ? `User #${userId}` : 'ผู้ใช้ทั่วไป');

        return {
          id: r.id,
          rating: r.rating || 0,
          reviewContent: r.reviewContent || '',
          userName: name,
          customerName: name, // Add for compatibility
          orderID: r.order ? (r.order as any).orderNumber : (r as any).orderID,
          orderUuid: r.order ? r.order.id : (r as any).orderID,
          orderDate: r.orderDate,
          createdAt: r.createdAt,
          userId: userId ? userId.toString() : 'guest', // Convert to string for frontend safety
          productId: (r as any).productId || (r.product ? r.product.id : undefined),
        };
      });
    } catch (error) {
      console.error('Error in findByProduct fallback chain:', error.message);
      return [];
    }
  }

  async update(reviewId: string, updateDto: any) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['user', 'product', 'order']
    }).catch(() => this.reviewRepository.findOne({ where: { id: reviewId } }));

    if (!review) throw new NotFoundException('Review not found');

    if (updateDto.rating !== undefined) review.rating = updateDto.rating;
    if (updateDto.reviewContent !== undefined) review.reviewContent = updateDto.reviewContent;
    if (updateDto.orderDate !== undefined) review.orderDate = new Date(updateDto.orderDate);

    // allow changing associations via ids
    if (updateDto.productId) review.product = { id: updateDto.productId } as any;
    if (updateDto.userId && updateDto.userId !== 'guest') {
      review.user = { id: updateDto.userId } as any;
    }

    if (updateDto.orderID) {
      if (this.isUuid(updateDto.orderID)) {
        review.order = { id: updateDto.orderID } as any;
      } else {
        (review as any).orderID = updateDto.orderID;
      }
    }

    return this.reviewRepository.save(review);
  }

  async findByOrder(orderId: string, userId?: number) {
    try {
      const where: any = {};

      // If orderId is UUID, use relation, else use raw ID
      if (this.isUuid(orderId)) {
        where.order = { id: orderId };
      } else {
        where.orderID = orderId;
      }

      if (userId) {
        where.user = { id: userId };
      }

      const reviews = await this.reviewRepository.find({
        where,
        relations: ['user', 'order', 'product'],
        order: { createdAt: 'DESC' },
      });

      return reviews.map(r => {
        const userId = r.user ? r.user.id : (r as any).userId;
        const name = r.user ? r.user.username : (userId ? `User #${userId}` : 'ผู้ใช้ทั่วไป');

        return {
          id: r.id,
          rating: r.rating || 0,
          reviewContent: r.reviewContent || '',
          userName: name,
          customerName: name,
          orderID: r.order ? (r.order as any).orderNumber : (r as any).orderID,
          orderUuid: r.order ? r.order.id : (r as any).orderID,
          orderDate: r.orderDate,
          createdAt: r.createdAt,
          userId: userId ? userId.toString() : 'guest',
          productId: (r as any).productId || (r.product ? r.product.id : undefined),
          productName: r.product ? r.product.name : undefined,
        };
      });
    } catch (error) {
      console.error('Error in findByOrder:', error.message);
      return [];
    }
  }
}