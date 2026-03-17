import { createContext, useState, useEffect, type ReactNode } from 'react';

// ✅ เพิ่ม interface จริงแทน any
interface AuthUser {
  id: string | number;
  name: string;
  username?: string;
  email?: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // ✅ เพิ่ม try/catch กัน localStorage เสียหาย
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      // ✅ เช็คว่ามีทั้ง user และ token
      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser);

        // ✅ เช็คว่า user มี id จริงไหม
        if (parsed?.id) {
          setUser(parsed);
        } else {
          // ข้อมูลไม่ครบ ล้างออก
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    } catch {
      // localStorage เสียหาย ล้างออกทั้งหมด
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const login = (userData: AuthUser) => {
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