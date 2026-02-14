// import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Category from './pages/Category';
import PendingConfirm from './pages/PendingConfirm';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Profile from './pages/Profile';

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
          <Route path="/pending-confirm" element={<PendingConfirm />} />
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
