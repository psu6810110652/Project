import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Category from './pages/Category';
import PendingConfirm from './pages/PendingConfirm';
import PendingDelivery from './pages/PendingDelivery';
import PendingReceived from './pages/PendingReceived';
import Failed from './components/Failed';
import Success from './components/Success';
import Favorites from './pages/Favorites';

import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import { ProductDetail } from './pages/ProductDetail';

// Login/Register
import Loginpage from './pages/Loginpage';
import Register from './pages/Register';

// Admin Pages
{/* Admin Pages */ }
import BarAdmin from './components/BarAdmin';
import Dashboard from './pages/Admin/Dashboard';
import Order from './pages/Admin/Order';
import ManageCategories from './pages/Admin/Category';
import ViewProducts from './pages/Admin/Product';
import ManageProduct from './pages/Admin/ManagerProduct';

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
          <Route path="/pending-confirm" element={<PendingConfirm />} />
          <Route path="/pending-delivery" element={<PendingDelivery />} />
          <Route path="/pending-received" element={<PendingReceived />} />
          <Route path="/failed" element={<Failed />} />
          <Route path="/success" element={<Success />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/login" element={<Loginpage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <aside className="fixed left-0 top-20 h-[calc(100vh-80px)] z-20">
          <BarAdmin />
        </aside>
        <main className="flex-1 ml-70 p-8 min-h-screen">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Order />} />
            <Route path="products" element={<ManageCategories />} />
            <Route path="products/:categoryId" element={<ViewProducts />} />
            <Route path="products/:categoryId/new" element={<ManageProduct />} />
            <Route path="products/:categoryId/:code" element={<ManageProduct />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* เอา AuthProvider มาครอบไว้ตรงนี้ */}
      <AuthProvider> 
        <Routes>
          <Route path="/*" element={<UserLayout />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}


export default App;
