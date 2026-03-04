import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entities';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(data: any) {
    // Normalize relations: TypeORM expects relation objects for many-to-one
    const payload: any = { ...data };

    if (data.productId) {
      payload.product = { id: data.productId };
      delete payload.productId;
    }

    if (data.userId) {
      payload.user = { id: data.userId };
      delete payload.userId;
    }

    if (data.orderDate) {
      payload.orderDate = new Date(data.orderDate);
    }

    const newReview = this.reviewRepository.create(payload);
    return await this.reviewRepository.save(newReview);
  }

  async findByProduct(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user'],
      order: { orderDate: 'DESC' }, // ให้รีวิวล่าสุดขึ้นก่อน
    });

    // Ensure frontend-friendly shape including `userId` and `productId`
    return reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      reviewContent: r.reviewContent,
      userName: r.userName,
      orderDate: r.orderDate,
      userId: r.user ? r.user.id : (r as any).userId,
      productId: (r as any).productId || (r.product ? r.product.id : undefined),
    }));
  }

  async update(reviewId: string, updateDto: any) {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } , relations: ['user','product']});
    if (!review) throw new NotFoundException('Review not found');

    if (updateDto.rating !== undefined) review.rating = updateDto.rating;
    if (updateDto.reviewContent !== undefined) review.reviewContent = updateDto.reviewContent;
    if (updateDto.userName !== undefined) review.userName = updateDto.userName;
    if (updateDto.orderDate !== undefined) review.orderDate = new Date(updateDto.orderDate);

    // allow changing associations via ids
    if (updateDto.productId) review.product = { id: updateDto.productId } as any;
    if (updateDto.userId) review.user = { id: updateDto.userId } as any;

    return this.reviewRepository.save(review);
  }
}