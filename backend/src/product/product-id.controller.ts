import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product-id')
export class ProductIdController {
  constructor(
    private readonly productService: ProductService,
  ) { }

  @Get('generate')
  async generateId(@Query('categoryId') categoryId: string, @Query('type') type: string) {
    console.log('Generate ID endpoint called with:', { categoryId, type });
    if (!categoryId) return { id: '' };
    const id = await this.productService.generateProductId(+categoryId, type);
    console.log('Generated ID:', id);
    return { id: id.toString() };
  }
}
