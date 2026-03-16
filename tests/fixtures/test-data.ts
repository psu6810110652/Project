export interface TestProduct {
  name: string;
  price: number;
  promotionPrice?: number;
  isPromotion: boolean;
  isFeatured: boolean;
  stockQuantity: number;
  description: string;
  type: string;
  specifications: Record<string, string>;
  howToUse: string;
  imageUrls?: string[];
  thumbnailUrls?: string[];
}

export interface TestCategory {
  id: number;
  name: string;
  description?: string;
}

export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'Admin' | 'User';
}

export const TEST_USERS = {
  ADMIN: {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Test Admin',
    role: 'Admin' as const
  },
  USER: {
    email: 'user@test.com',
    password: 'user123',
    name: 'Test User',
    role: 'User' as const
  }
} as const;

export const TEST_CATEGORIES: TestCategory[] = [
  {
    id: 1,
    name: 'อาหารเสริม',
    description: 'วิตามินและอาหารเสริมต่างๆ'
  },
  {
    id: 2,
    name: 'ผลิตภัณฑ์ดูแลผิว',
    description: 'ครีมและผลิตภัณฑ์ดูแลผิวหน้า'
  },
  {
    id: 3,
    name: 'เวชสำอาง',
    description: 'ผลิตภัณฑ์เวชสำอางคุณภาพสูง'
  }
];

export const TEST_PRODUCTS: TestProduct[] = [
  {
    name: 'วิตามินซี 1000mg',
    price: 299,
    promotionPrice: 199,
    isPromotion: true,
    isFeatured: false,
    stockQuantity: 50,
    description: 'วิตามินซีบริสุทธิ์ 1000mg ช่วยเสริมสร้างภูมิคุ้มกัน',
    type: 'วิตามิน',
    specifications: {
      'ส่วนผสมหลัก': 'วิตามินซี 1000mg',
      'จำนวน': '60 เม็ด',
      'รูปแบบ': 'เม็ด',
      'บรรจุ': '1 ขวด'
    },
    howToUse: 'รับประทานวันละ 1 เม็ด หลังอาหาร'
  },
  {
    name: 'ครีมหน้าใส ไวท์เทนนิ่ง',
    price: 590,
    promotionPrice: 0,
    isPromotion: false,
    isFeatured: true,
    stockQuantity: 25,
    description: 'ครีมหน้าใส ช่วยลดริ้วรอย กระชับรูขุมขน',
    type: 'ครีม',
    specifications: {
      'น้ำหนัก': '30g',
      'ส่วนผสมพิเศษ': 'นิอาซินาไมด์, วิตามินซี',
      'ประเภทผิว': 'ทุกสภาพผิว',
      'การรับรอง': 'FDA'
    },
    howToUse: 'ทาเช้า-เย็น หลังล้างหน้าเช็ดแห้ง'
  },
  {
    name: 'เซรั่มบำรุงผม',
    price: 450,
    promotionPrice: 350,
    isPromotion: true,
    isFeatured: true,
    stockQuantity: 8,
    description: 'เซรั่มบำรุงเส้นผม ช่วยลดผมร่วง ให้ผมแข็งแรง',
    type: 'เซรั่ม',
    specifications: {
      'ปริมาณ': '100ml',
      'ส่วนผสมหลัก': 'Biotin, Keratin',
      'ประเภทผม': 'ทุกประเภทผม',
      'กลิ่น': 'หอมอ่อนๆ'
    },
    howToUse: 'หยดบนเส้นผมและเส้นผม นวดเบาๆ ไม่ต้องล้างออก'
  }
];

export const generateRandomProduct = (categoryId: number): TestProduct => {
  const types = ['วิตามิน', 'ครีม', 'เซรั่ม', 'แมสก์', 'โลชั่น'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomPrice = Math.floor(Math.random() * 1000) + 100;
  const isPromotion = Math.random() > 0.7;
  const isFeatured = Math.random() > 0.8;
  
  return {
    name: `ทดสอบสินค้า ${randomType} ${Date.now()}`,
    price: randomPrice,
    promotionPrice: isPromotion ? Math.floor(randomPrice * 0.7) : 0,
    isPromotion,
    isFeatured,
    stockQuantity: Math.floor(Math.random() * 100) + 1,
    description: `รายละเอียดทดสอบสำหรับ ${randomType}`,
    type: randomType,
    specifications: {
      'ประเภท': randomType,
      'น้ำหนัก': `${Math.floor(Math.random() * 200) + 50}g`,
      'การรับรอง': 'FDA'
    },
    howToUse: 'วิธีใช้งานทดสอบ'
  };
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PRODUCTS: '/product',
  CATEGORIES: '/category',
  UPLOAD: '/upload'
} as const;
