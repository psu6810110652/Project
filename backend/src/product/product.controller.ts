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


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }


  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string, @Query('limit') limit: string) {
    return this.productService.findAllByCategory(+categoryId, +limit || 10);
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


  @Get('seed/real-sold-counts')
  async updateRealSoldCounts() {
    console.log('🔄 Calculating real sold counts from actual orders...');
    try {
      // Get all products (unpaginated for seeding)
      const { items: products } = await this.productService.findAll(1, 1000) as any;
      
      for (const product of products) {
        // Calculate real sold count from completed orders
        const realSoldCount = await this.calculateRealSoldCount(product.id);
        
        // Update product with real sold count
        await this.productService.update(product.id, {
          soldCount: realSoldCount,
        });
        
        console.log(`✅ Updated ${product.name}: Real Sold Count=${realSoldCount}`);
      }
      
      console.log('✅ Real sold counts updated successfully!');
      return { message: 'Real sold counts updated successfully!' };
    } catch (error) {
      console.error('❌ Error updating real sold counts:', error);
      throw new Error(`Failed to update real sold counts: ${error.message}`);
    }
  }

  private async calculateRealSoldCount(productId: string): Promise<number> {
    try {
      // Get all completed orders for this product
      const completedOrders = await this.ordersService.findByStatus('completed');
      let totalSold = 0;
      
      for (const order of completedOrders) {
        // Check if this order contains the product
        const productInOrder = order.products.find((p: any) => 
          (p.productId === productId || p.id === productId)
        );
        
        if (productInOrder) {
          totalSold += Number(productInOrder.quantity || 0);
        }
      }
      
      return totalSold;
    } catch (error) {
      console.error(`Error calculating sold count for product ${productId}:`, error);
      return 0;
    }
  }

  @Get('seed/real-stats')
  async updateRealStats() {
    console.log('🔄 Updating with REAL Supabase data only...');
    try {
      // Get all products
      const { items: products } = await this.productService.findAll(1, 1000) as any;
      
      for (const product of products) {
        // Calculate real sold count from completed orders
        const soldCount = await this.calculateRealSoldCount(product.id);
        const favoriteCount = await this.favoritesService.getFavoriteCount(product.id);
        const rating = product.rating || 0;
        const reviewCount = product.reviewCount || 0;
        
        // Update product with real stats only
        await this.productService.update(product.id, {
          soldCount,
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

  @Get('seed/add-favorite-count-column')
  async addFavoriteCountColumn() {
    console.log('🔄 Adding favorite_count column to products table...');
    try {
      // Execute raw SQL to add the column
      await this.productService.query(
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0`
      );
      
      console.log('✅ favorite_count column added successfully!');
      return { message: 'favorite_count column added successfully!' };
    } catch (error) {
      console.error('❌ Error adding favorite_count column:', error);
      throw new Error(`Failed to add favorite_count column: ${error.message}`);
    }
  }

  @Get('seed/reset-sold-counts')
  async resetSoldCounts() {
    console.log('🔄 Resetting all sold counts to 0...');
    try {
      // Get all products
      const { items: products } = await this.productService.findAll(1, 1000) as any;
      
      for (const product of products) {
        // Reset sold count to 0
        await this.productService.update(product.id, {
          soldCount: 0,
        });
        
        console.log(`✅ Reset ${product.name}: Sold Count=0`);
      }
      
      console.log('✅ All sold counts reset to 0 successfully!');
      return { message: 'All sold counts reset to 0 successfully!', updated: products.length };
    } catch (error) {
      console.error('❌ Error resetting sold counts:', error);
      throw new Error(`Failed to reset sold counts: ${error.message}`);
    }
  }

  @Get('seed/update-stats')
  async seedProductStats() {
    console.log('🔄 Updating product statistics...');
    try {
      // Get all products
      const { items: products } = await this.productService.findAll(1, 1000) as any;
      
      for (const product of products) {
        // ใช้ข้อมูลจริงจาก Supabase ถ้าไม่มีให้เป็น 0
        // ถ้ายังไม่มีข้อมูล ให้ใช้ค่า 0 (ไม่สุ่ม)
        const soldCount = product.soldCount || 0;
        const favoriteCount = await this.favoritesService.getFavoriteCount(product.id);
        const rating = product.rating || 0;
        const reviewCount = product.reviewCount || 0;
        
        // Update product with new stats
        await this.productService.update(product.id, {
          soldCount,
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
