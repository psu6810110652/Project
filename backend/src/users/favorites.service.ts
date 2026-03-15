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
    async addToFavorites(userId: number, productId: string): Promise<Favorite> {
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

        return await this.favoritesRepository.save(favorite);
    }

    // ลบสินค้าจากรายการโปรด
    async removeFromFavorites(userId: number, productId: string): Promise<void> {
        const favorite = await this.favoritesRepository.findOne({
            where: { userId, productId }
        });

        if (!favorite) {
            throw new NotFoundException('ไม่พบสินค้านี้ในรายการโปรด');
        }

        await this.favoritesRepository.remove(favorite);
    }

    // ดึงรายการโปรดทั้งหมดของผู้ใช้
    async getUserFavorites(userId: number): Promise<Favorite[]> {
        return await this.favoritesRepository.find({
            where: { userId },
            relations: ['product'],
            order: { createdAt: 'DESC' }
        });
    }

    // ตรวจสอบว่าสินค้าอยู่ในรายการโปรดของผู้ใช้หรือไม่
    async isFavorite(userId: number, productId: string): Promise<boolean> {
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

    // ดึงสินค้าที่มีคนชื่นชอบมากที่สุด
    async getMostFavoritedProducts(limit: number = 10): Promise<any[]> {
        const result = await this.favoritesRepository
            .createQueryBuilder('f')
            .select([
                'f.productId as productId',
                'p.name as productName',
                'p.thumbnailUrls as productImages',
                'p.price as price',
                'COUNT(f.id) as favoriteCount'
            ])
            .leftJoin('product', 'p', 'p.id = f.productId')
            .groupBy('f.productId, p.name, p.thumbnailUrls, p.price')
            .orderBy('favoriteCount', 'DESC')
            .limit(limit)
            .getRawMany();

        return result;
    }

    // สำหรับ frontend - ดึงข้อมูลสินค้าในรายการโปรดพร้อมข้อมูลเต็ม
    async getFavoriteProducts(userId: number): Promise<any[]> {
        const favorites = await this.favoritesRepository.find({
            where: { userId },
            relations: ['product', 'product.category', 'product.detail']
        });

        return favorites.map(fav => ({
            id: fav.id,
            productId: fav.productId,
            productName: fav.product.name,
            price: fav.product.price,
            imageUrls: fav.product.detail?.imageUrls || [],
            thumbnailUrls: fav.product.thumbnailUrls,
            category: fav.product.category,
            addedAt: fav.createdAt,
            isFavorite: true
        }));
    }
}
