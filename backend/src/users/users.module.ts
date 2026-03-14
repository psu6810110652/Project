import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Favorite } from './entities/favorite.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Favorite, Product])],
  controllers: [UsersController, FavoritesController],
  providers: [UsersService, FavoritesService],
  exports: [UsersService, FavoritesService],
})
export class UsersModule {}
