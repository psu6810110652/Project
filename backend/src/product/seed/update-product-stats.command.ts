import { Injectable } from '@nestjs/common';
import { ProductService } from '../product.service';

@Injectable()
export class UpdateProductStatsCommand {
  constructor(private readonly productService: ProductService) {}

  async update() {
    console.log('🔄 Updating product statistics...');
    try {
      // Get all products
      const products = await this.productService.findAll();
      
      for (const product of products) {
        // Add random sold count (0-200)
        const soldCount = Math.floor(Math.random() * 200) + 1;
        
        // Add random favorite count (0-100)
        const favoriteCount = Math.floor(Math.random() * 100) + 1;
        
        // Add random rating (3-5)
        const rating = Number((Math.random() * 2 + 3).toFixed(1));
        
        // Add random review count (1-50)
        const reviewCount = Math.floor(Math.random() * 50) + 1;
        
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
    } catch (error) {
      console.error('❌ Error updating product statistics:', error);
    }
  }
}
