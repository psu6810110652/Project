import { createContext, useState, useEffect, type ReactNode } from 'react';

// 1. สร้าง Interface เพื่อบอก TypeScript ว่า Context ของเรามีอะไรบ้าง
interface AuthContextType {
  user: any; // ตรงนี้ใช้ any ไปก่อน แต่ถ้าคุณรู้ว่า user มีข้อมูลอะไรบ้าง (เช่น id, name) สามารถเปลี่ยนเป็น type ที่ชัดเจนได้ครับ
  login: (userData: any) => void;
  logout: () => void;
}

// 2. ใส่ค่าเริ่มต้นเป็น null และบอกว่า Context นี้ใช้ type ที่เราสร้างไว้ข้างบน
export const AuthContext = createContext<AuthContextType | null>(null);

// กำหนด type ให้กับ children ว่าเป็น ReactNode
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};