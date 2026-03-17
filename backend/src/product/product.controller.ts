import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { OrdersService } from '../orders/orders.service';
import { FavoritesService } from '../users/favorites.service';


import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly ordersService: OrdersService,
    private readonly favoritesService: FavoritesService
  ) { }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }


  @Get('promotions')
  findPromotions(@Query('limit') limit: string) {
    return this.productService.findPromotions(+limit || 10);
  }

  @Get('featured')
  findFeatured(@Query('limit') limit: string) {
    return this.productService.findFeatured(+limit || 10);
  }


  @Get()
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.productService.findAll(+page || 1, +limit || 20);
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string, @Query('limit') limit: string) {
    return this.productService.findAllByCategory(+categoryId, +limit || 10);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }


  @Patch(':id/stats')
  async updateProductStats(@Param('id') id: string, @Body() statsData: { favoriteCount?: number; soldCount?: number }) {
    try {
      const product = await this.productService.findOne(id);

      // Only update the provided fields
      const updateData: any = {};
      if (statsData.favoriteCount !== undefined) {
        updateData.favoriteCount = statsData.favoriteCount;
      }
      if (statsData.soldCount !== undefined) {
        updateData.soldCount = statsData.soldCount;
      }

      return this.productService.update(id, updateData);
    } catch (error) {
      throw new Error(`Failed to update product stats: ${error.message}`);
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
