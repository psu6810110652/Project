import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }


  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }


  @Get('promotions')
  findPromotions() {
    return this.productService.findPromotions();
  }

  @Get('featured')
  findFeatured() {
    return this.productService.findFeatured();
  }


  @Get()
  findAll() {
    return this.productService.findAll();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }


  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.productService.findAllByCategory(+categoryId);
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


  @Get('seed/real-stats')
  async updateRealStats() {
    console.log('🔄 Updating with REAL Supabase data only...');
    try {
      // Get all products
      const products = await this.productService.findAll();
      
      for (const product of products) {
        // ใช้เฉพาะข้อมูลจริงจาก Supabase ไม่สุ่มเลย
        const soldCount = product.soldCount || 0;
        const favoriteCount = product.favoriteCount || 0;
        const rating = product.rating || 0;
        const reviewCount = product.reviewCount || 0;
        
        // Update product with real stats only
        await this.productService.update(product.id, {
          soldCount,
          favoriteCount,
          rating,
          reviewCount,
        });
        
        console.log(`✅ Real data for ${product.name}: Sold=${soldCount}, Favorites=${favoriteCount}, Rating=${rating}, Reviews=${reviewCount}`);
      }
      
      console.log('✅ Real product statistics updated successfully!');
      return { message: 'Real product statistics updated successfully!' };
    } catch (error) {
      console.error('❌ Error updating real product statistics:', error);
      throw new Error(`Failed to update real product statistics: ${error.message}`);
    }
  }

  @Get('seed/update-stats')
  async seedProductStats() {
    console.log('🔄 Updating product statistics...');
    try {
      // Get all products
      const products = await this.productService.findAll();
      
      for (const product of products) {
        // ใช้ข้อมูลจริงจาก Supabase ถ้าไม่มีให้เป็น 0
        // ถ้ายังไม่มีข้อมูล ให้ใช้ค่า 0 (ไม่สุ่ม)
        const soldCount = product.soldCount || 0;
        const favoriteCount = product.favoriteCount || 0;
        const rating = product.rating || 0;
        const reviewCount = product.reviewCount || 0;
        
        // Update product with new stats
        await this.productService.update(product.id, {
          soldCount,
          favoriteCount,
          rating,
          reviewCount,
        });
        
        console.log(`✅ Updated ${product.name}: Sold=${soldCount}, Favorites=${favoriteCount}, Rating=${rating}, Reviews=${reviewCount}`);
      }
      
      console.log('✅ Product statistics updated successfully!');
      return { message: 'Product statistics updated successfully!', updated: products.length };
    } catch (error) {
      console.error('❌ Error updating product statistics:', error);
      return { error: 'Failed to update product statistics' };
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
