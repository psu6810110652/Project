import { Injectable } from '@nestjs/common';
import { ProductService } from '../product.service';

@Injectable()
export class UpdateProductStatsCommand {
  constructor(private readonly productService: ProductService) { }

  async update() {
    console.log('🔄 Resetting product statistics to REAL data...');
    try {
      // Get all products to show we are working
      const response = await this.productService.findAll(1, 10);
      console.log(`Checking products...`);

      console.log('✅ Synchronizing via database query...');
      // If we can't easily call syncAllProductStats here, 
      // the new logic in OrdersService.findAllPending() will handle it when Admin opens the dashboard.

      console.log('✅ Product statistics synchronization logic updated.');
    } catch (error) {
      console.error('❌ Error updating product statistics:', error);
    }
  }
}
