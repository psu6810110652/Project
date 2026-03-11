import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import './App.css'

import Home from './pages/Home'
import Category from './pages/Category';
import Favorites from './pages/Favorites';

import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import { ProductDetail } from './pages/ProductDetail';
import ReviewPage from './pages/ReviewPage';
import EditReviewPage from './pages/EditReviewPage';

// Login/Register
import Loginpage from './pages/Loginpage';
import Register from './pages/Register';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminSearchProvider } from './context/AdminSearchContext';

import BarAdmin from './components/BarAdmin';
import Dashboard from './pages/Admin/Dashboard';
import Order from './pages/Admin/Order';
import ManageCategories from './pages/Admin/Category';
import ViewProducts from './pages/Admin/Product';
import ManageProduct from './pages/Admin/ManagerProduct';
import ManagerOrder from './pages/Admin/ManagerOrder';
import PaymentPage from './pages/PaymentPage';

function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:category" element={<Category />} />
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
        </Routes>
      </div>
      <Footer />
    </div>
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
            {/* spacer ความสูง navbar สำหรับ mobile fixed sidebar */}
            <div className="md:hidden h-16" />
            <BarAdmin />
          </aside>

          <main className="flex-1 overflow-y-auto min-w-0 bg-[#DCEDC1]">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Order />} />
              <Route path="orders/:orderId" element={<ManagerOrder />} />
              <Route path="products" element={<ManageCategories />} />
              <Route path="products/:categoryId" element={<ViewProducts />} />
              <Route path="products/:categoryId/new" element={<ManageProduct />} />
              <Route path="products/:categoryId/:code" element={<ManageProduct />} />
            </Routes>
          </main>
        </div>
      </div>
    </AdminSearchProvider>
  );
}

function App() {
  return (
    <Router>
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
  )
}

export default App;