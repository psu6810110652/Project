export interface ProductCard {
    id?: number;
    productImage?: string;
    title: string;
    price: number;
    stock: number;
}

export interface BoxProps {
    allProducts: (ProductCard & {
        isRecommend: boolean, isPromotion: boolean 
    })[];
}