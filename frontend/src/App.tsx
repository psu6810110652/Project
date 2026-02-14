// import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Category from './pages/Category';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Profile from './pages/Profile';

function App() {
  return (
    <>
      <Router>
        <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:categoryName" element={<Category />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        <Footer />
      </Router>
    </>
  )
}

export default App;
