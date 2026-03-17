import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react';
import { Menu, X, Loader2 } from 'lucide-react';
import { ConfigProvider } from 'antd';
import './App.css'


// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Cart = lazy(() => import('./pages/Cart'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const EditReviewPage = lazy(() => import('./pages/EditReviewPage'));
const Loginpage = lazy(() => import('./pages/Loginpage'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const Order = lazy(() => import('./pages/Admin/Order'));
const ManageCategories = lazy(() => import('./pages/Admin/Category'));
const ViewProducts = lazy(() => import('./pages/Admin/Product'));
const ManageProduct = lazy(() => import('./pages/Admin/ManagerProduct'));
const ManagerOrder = lazy(() => import('./pages/Admin/ManagerOrder'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Footer from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminSearchProvider } from './context/AdminSearchContext';
import BarAdmin from './components/BarAdmin';
import ScrollToTop from './components/ScrollToTop';

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#256D45]">
    <Loader2 className="animate-spin mb-4" size={48} />
    <p className="text-xl font-medium">กำลังโหลดข้อมูล...</p>
  </div>
);
function UserLayout() {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* ย้าย /:category ลงไปไว้ล่างสุด */}

              {/* เส้นทางที่ระบุชื่อชัดเจน ให้เอาไว้ด้านบนทั้งหมด */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/login" element={<Loginpage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/review/:productId" element={<ReviewPage />} />
              <Route path="/profile/review/:orderId" element={<EditReviewPage />} />

              {/* 🟢 หน้าลืมรหัสผ่านของเรา */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* 🛑 เอาหลุมดำมาไว้ล่างสุดตรงนี้ครับ! */}
              <Route path="/:category" element={<Category />} />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </CartProvider>
  );
}

function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <AdminSearchProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-[#DCEDC1]">
        {/* Navbar อยู่บนสุด */}
        <div id="admin-navbar" className="flex-none z-50">
          <Navbar />
        </div>

        {/* Mobile Sidebar Toggle Button (FAB) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#256D45] text-[#FFFEF2] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,109,69,0.5)] z-50 hover:bg-[#1E5631] transition-transform active:scale-95 border-2 border-[#FFFEF2]"
          aria-label="เมนู"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Backdrop สำหรับมือถือ */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar: fixed overlay บนมือถือ, relative ประคอง h-full บน desktop */}
          <aside
            className={`
              fixed top-0 left-0 h-full z-40
              transform transition-transform duration-300 ease-in-out
              md:relative md:translate-x-0 md:shrink-0 md:h-full md:overflow-y-auto
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <div className="md:hidden h-16" />
            <BarAdmin />
          </aside>

          <main className="flex-1 overflow-y-auto min-w-0 bg-[#DCEDC1]">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Order />} />
                <Route path="orders/:orderId" element={<ManagerOrder />} />
                <Route path="products" element={<ManageCategories />} />
                <Route path="products/:categoryId" element={<ViewProducts />} />
                <Route path="products/:categoryId/new" element={<ManageProduct />} />
                <Route path="products/:categoryId/:code" element={<ManageProduct />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </AdminSearchProvider>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Prompt",
          colorPrimary: '#256D45',
        },
      }}
    >
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<UserLayout />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRole="Admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ConfigProvider>
  )
}

export default App;