export interface ProductCard {
    id?: number;
    image?: string;
    name: string;
    price: number;
    stock: number;

    isRecommend?: boolean;
    isPromotion?: boolean;
}

export interface Product{
    id: number;
    name: string;      
    code?: string;     
    price: number;   
    promotionPrice?: number;
    stock: number;         
    volumeDiscount?: string;
    Category?: string;      
    Type?: string;         
    description?: string; 
    
    image: string;
    gallery?: string[];    
    
    isRecommend: boolean;
    isPromotion: boolean;
}

export interface Category {
    id: number;
    name: string;
    description: string;
}