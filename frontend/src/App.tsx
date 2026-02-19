import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

import Loginpage from './pages/Loginpage';
import Register from './pages/Register';

function MainLayout() {
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <>
      <Router>
        <MainLayout />
      </Router>
    </>
  )
}

export default App;