export interface ProductCard {
    id?: number;
    productImage?: string;
    title: string;
    price: number;
    stock: number;
}

export interface Product{
    id: number;
    title: string;      
    code?: string;     
    price: number;   
    promotionPrice?: number;
    stock: number;         
    volumeDiscount?: string;
    Category?: string;      
    Type?: string;         
    description?: string; 
    
    productImage: string;
    gallery?: string[];    
    
    isRecommend: boolean;
    isPromotion: boolean;
}

export interface Category {
    id: number;
    name: string;
}