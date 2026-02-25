export interface ProductCard {
    id?: string;
    image?: string;
    name: string;
    price: number;
    stock: number;
    type?: string;

    isRecommend?: boolean;
    isPromotion?: boolean;
}

export interface Product {
    id: string; // Product Code is used as ID
    name: string;
    price: number;
    promotionPrice?: number;
    stock: number;
    volumeDiscount?: string;
    Category?: string;
    Type?: string;
    category?: { id: number; name: string; description?: string };
    description?: string;

    image?: string;
    imageUrl?: string;
    thumbnailUrl?: string; // Small version
    gallery?: string[];

    isRecommend: boolean;
    isPromotion: boolean;
    stockQuantity?: number;
}

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface CategoryStat {
    id: number;
    name: string;
    productCount: string | number;
}

export interface SearchProps {
    onSearch?: (value: string) => void;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
}
interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderDate: string;
  status: 'pending_confirm' | 'pending_delivery' | 'pending_received';
  address?: string;
  phone?: string;
}