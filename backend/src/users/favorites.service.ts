import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from './entities/user.entity';
import { Product } from '../product/entities/product.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private favoritesRepository: Repository<Favorite>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) {}

    // เพิ่มสินค้าในรายการโปรด
    async addToFavorites(userId: string, productId: string): Promise<Favorite> {
        // ตรวจสอบว่ามีผู้ใช้และสินค้านี้อยู่จริงหรือไม่
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('ไม่พบผู้ใช้นี้');
        }

        const product = await this.productsRepository.findOne({ where: { id: productId } });
        if (!product) {
            throw new NotFoundException('ไม่พบสินค้านี้');
        }

        // ตรวจสอบว่าเคยเพิ่มไปแล้วหรือไม่
        const existingFavorite = await this.favoritesRepository.findOne({
            where: { userId, productId }
        });

        if (existingFavorite) {
            throw new BadRequestException('สินค้านี้อยู่ในรายการโปรดแล้ว');
        }

        // สร้างรายการโปรดใหม่
        const favorite = this.favoritesRepository.create({
            userId,
            productId,
        });

        const savedFavorite = await this.favoritesRepository.save(favorite);

        // อัปเดตข้อมูล Favorites ในตาราง User (Snapshot เหมือน Order)
        const favoriteSnapshot = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.thumbnailUrls && product.thumbnailUrls.length > 0 ? product.thumbnailUrls[0] : null,
            addedAt: new Date()
        };

        const userFavorites = user.favoritesData || [];
        user.favoritesData = [...userFavorites, favoriteSnapshot];
        await this.usersRepository.save(user);

        // อัปเดตจำนวนการถูกใจที่ตัวสินค้า (Increment)
        await this.productsRepository.increment({ id: productId }, 'favoriteCount', 1);

        return savedFavorite;
    }

    // ลบสินค้าจากรายการโปรด
    async removeFromFavorites(userId: string, productId: string): Promise<void> {
        const favorite = await this.favoritesRepository.findOne({
            where: { userId, productId }
        });

        if (!favorite) {
            throw new NotFoundException('ไม่พบสินค้านี้ในรายการโปรด');
        }

        await this.favoritesRepository.remove(favorite);

        // อัปเดตข้อมูล Favorites ในตาราง User (ลบออกจาก Snapshot)
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (user && user.favoritesData) {
            user.favoritesData = user.favoritesData.filter((item: any) => item.id !== productId);
            await this.usersRepository.save(user);
        }

        // อัปเดตจำนวนการถูกใจที่ตัวสินค้า (Decrement)
        await this.productsRepository.decrement({ id: productId }, 'favoriteCount', 1);
    }

    // ดึงรายการโปรดทั้งหมดของผู้ใช้
    async getUserFavorites(userId: string): Promise<Favorite[]> {
        return await this.favoritesRepository.find({
            where: { userId },
            relations: ['product'],
            order: { createdAt: 'DESC' }
        });
    }

    // ตรวจสอบว่าสินค้าอยู่ในรายการโปรดของผู้ใช้หรือไม่
    async isFavorite(userId: string, productId: string): Promise<boolean> {
        const favorite = await this.favoritesRepository.findOne({
            where: { userId, productId }
        });
        return !!favorite;
    }

    // ดึงจำนวนคนที่ชื่นชอบสินค้านี้ (เทียบเท่ากับ favorite_count เดิม)
    async getFavoriteCount(productId: string): Promise<number> {
        return await this.favoritesRepository.count({
            where: { productId }
        });
    }

    // ดึงสินค้าที่มีคนชื่นชอบมากที่สุด (ใช้วิธีดึงจากคอลัมน์ใหม่ที่เร็วกว่า)
    async getMostFavoritedProducts(limit: number = 10): Promise<Product[]> {
        return await this.productsRepository.find({
            order: { favoriteCount: 'DESC' },
            take: limit,
            relations: ['category']
        });
    }

    // สำหรับ frontend - ดึงข้อมูลสินค้าในรายการโปรดพร้อมข้อมูลเต็ม
    async getFavoriteProducts(userId: string): Promise<any[]> {
        const favorites = await this.favoritesRepository.find({
            where: { userId },
            relations: ['product', 'product.category', 'product.detail']
        });

        // กรองเอาเฉพาะรายการที่สินค้ายังคงมีอยู่จริงในระบบ
        return favorites
            .filter(fav => fav.product)
            .map(fav => ({
                id: fav.product.id, // ใช้ ID สินค้าเป็น ID หลัก
                name: fav.product.name,
                price: fav.product.price,
                stockQuantity: fav.product.stockQuantity,
                imageUrls: fav.product.detail?.imageUrls || [],
                thumbnailUrls: fav.product.thumbnailUrls,
                favoriteCount: fav.product.favoriteCount,
                rating: 0,
                reviewCount: 0,
                soldCount: 0,
                category: fav.product.category?.name,
                type: fav.product.detail?.type,
                addedAt: fav.createdAt,
                isFavorite: true
            }));
    }
}
