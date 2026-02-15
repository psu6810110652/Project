// import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Category from './pages/Category';
import PendingConfirm from './pages/PendingConfirm';
import PendingDelivery from './pages/PendingDelivery';
import PendingReceived from './pages/PendingReceived';
import Failed from './pages/Failed';
import Success from './pages/Success';
import Favorites from './pages/Favorites';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

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
