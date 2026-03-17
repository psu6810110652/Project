import { Controller, Get, Post, Patch, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewService } from './review.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @Post('reviews')
  @UseGuards(AuthGuard('jwt')) // ต้อง Login ก่อนถึงจะรีวิวได้
  createReview(@Body() createReviewDto: any, @Request() req) {
    return this.reviewService.create({
      ...createReviewDto,
      userId: req.user.sub || req.user.userId, // ดึง ID จาก Token
    });
  }

  @Patch('reviews/:reviewId')
  @UseGuards(AuthGuard('jwt'))
  updateReview(@Param('reviewId') reviewId: string, @Body() updateReviewDto: any) {
    return this.reviewService.update(reviewId, updateReviewDto);
  }

  @Get('product/:productId/reviews')
  getReviewsByProduct(@Param('productId') productId: string) {
    return this.reviewService.findByProduct(productId);
  }

  @Get('order/:orderId/my-reviews')
  @UseGuards(AuthGuard('jwt'))
  getMyReviewsByOrder(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.reviewService.findByOrder(orderId, String(userId));
  }
}