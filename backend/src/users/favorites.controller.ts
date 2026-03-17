import { Controller, Get, Post, Delete, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    // เพิ่มสินค้าในรายการโปรด
    @Post(':productId')
    @HttpCode(HttpStatus.CREATED)
    async addToFavorites(
        @Param('productId') productId: string,
        @Request() req
    ) {
        const userId = req.user.userId || req.user.sub;
        return await this.favoritesService.addToFavorites(userId, productId);
    }

    // ลบสินค้าจากรายการโปรด
    @Delete(':productId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeFromFavorites(
        @Param('productId') productId: string,
        @Request() req
    ) {
        const userId = req.user.userId || req.user.sub;
        await this.favoritesService.removeFromFavorites(userId, productId);
    }

    // ดึงรายการโปรดทั้งหมดของผู้ใช้
    @Get()
    async getMyFavorites(@Request() req) {
        const userId = req.user.userId || req.user.sub;
        return await this.favoritesService.getFavoriteProducts(userId);
    }

    // ตรวจสอบว่าสินค้าอยู่ในรายการโปรดหรือไม่
    @Get(':productId/check')
    async checkFavorite(
        @Param('productId') productId: string,
        @Request() req
    ) {
        const userId = req.user.userId || req.user.sub;
        const isFavorite = await this.favoritesService.isFavorite(userId, productId);
        return { isFavorite };
    }

    // ดึงจำนวนคนที่ชื่นชอบสินค้า (สำหรับ public endpoint)
    @Get(':productId/count')
    async getFavoriteCount(@Param('productId') productId: string) {
        const count = await this.favoritesService.getFavoriteCount(productId);
        return { favoriteCount: count };
    }

    // ดึงสินค้าที่มีคนชื่นชอบมากที่สุด (สำหรับ banner)
    @Get('banner/most-favorited')
    async getMostFavoritedProducts(@Param('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return await this.favoritesService.getMostFavoritedProducts(limitNum);
    }
}
