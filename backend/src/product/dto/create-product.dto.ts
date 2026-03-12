export class CreateProductDto {
    id: string; // Product Code
    name: string;
    description?: string;
    price: number;
    isPromotion?: boolean;
    promotionPrice?: number;
    stockQuantity: number;
    imageUrl?: string;
    thumbnailUrl?: string;
    type?: string;
    category: { id: number };
    soldCount?: number;
    favoriteCount?: number;
    rating?: number;
    reviewCount?: number;
}
