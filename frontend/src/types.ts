export interface ProductCard {
    id?: string;
    image?: string;
    name: string;
    price: number;
    stock: number;
    type?: string;

    isRecommend?: boolean;
    isPromotion?: boolean;
    rating?: number;
    favoriteCount?: number;
    reviewCount?: number;
    soldCount?: number;
    thumbnailUrls?: string[] | string;
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
    type?: string;
    category?: { id: number; name: string; description?: string };
    description?: string;
    rating?: number;
    reviewCount?: number;
    soldCount?: number;
    favoriteCount?: number;

    image?: string;
    imageUrl?: string;
    imageUrls?: string[]; // 🌟 เพิ่มตรงนี้เพื่อแก้ Error
    thumbnailUrl?: string; // Small version
    thumbnailUrls?: string[];
    gallery?: string[];

    isRecommend: boolean;
    isPromotion: boolean;
    stockQuantity?: number;
    specifications?: Record<string, any>;
    howToUse?: string;
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
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
}

export interface OrderData {
    paymentSlip: any;
    id: string;
    orderNumber: string;
    customerId?: string;
    customerName: string;
    products: OrderItem[];
    totalAmount: number;
    status: 'pending_confirm' | 'pending_delivery' | 'pending_received' | 'completed' | 'cancelled';
    createdAt: string;
    address?: string;
    phone?: string;
    trackingNumber?: string;
    courierSlug?: string;
    slipUrl?: string;
    cancelReason?: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    stockQuantity?: number;
    isPromotion?: boolean;
    promotionPrice?: number;
}

export interface ShippingAddressFormProps {
    formData: {
        houseNumber?: string;
        dormRoom?: string;
        streetSoi?: string;
        province?: string;
        district?: string;
        subDistrict?: string;
        postalCode?: string;
    };
    onFormChange: (field: string, value: string) => void;
    errors?: { [key: string]: string };
}

export interface Address {
    id: number;
    houseNumber?: string;
    streetSoi?: string;
    province?: string;
    district?: string;
    subDistrict?: string;
    postalCode?: string;
    fullAddress: string;
    isDefault: boolean;
    recipient_name?: string;
    phone_number?: string;
}

export interface AddressFormState {
    houseNumber: string;
    streetSoi: string;
    province: string;
    district: string;
    subDistrict: string;
    postalCode: string;
}


export interface ExistingReview {
    id: string;
    userName: string;
    rating: number;
    reviewContent: string;
    orderID?: string;
    orderDate?: string;
    userId: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}


export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}


export interface AuthUser {
    id: string | number;
    name: string;
    username?: string;
    email: string;
    role: string;
    token: string;
}

export interface ReviewItem {
    productId: string;
    productName: string;
    productImage?: string;
    rating: number;
    reviewContent: string;
    existingReviewId?: string | null;
}

export interface OrderInfo {
    id: string;
    orderNumber: string;
    orderDate: string;
    products: any[];
}