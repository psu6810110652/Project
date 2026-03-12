import { IsString, IsNumber, IsOptional, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// 1. สร้างคลาสเล็กๆ มารับ Object ของ category
class CategoryDto {
  @IsNumber()
  id: number;
}

export class CreateProductDto {
  @IsString()
  id: string; // Product Code

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  isPromotion?: boolean;

  @IsOptional()
  promotionPrice?: number | null;

  @IsBoolean()
  isFeatured: boolean;

  @IsNumber()
  stockQuantity: number;

  // 🌟 ตรงกับ imageUrls ใน React (รับเป็น Array)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  // 🌟 ตรงกับ thumbnailUrls ใน React (รับเป็น Array)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thumbnailUrls?: string[];

  @IsOptional()
  @IsString()
  type?: string;

  // ตรงกับ category: { id: Number } ใน React
  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @IsOptional()
  @IsNumber()
  soldCount?: number;

  @IsOptional()
  @IsNumber()
  favoriteCount?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  reviewCount?: number;
}