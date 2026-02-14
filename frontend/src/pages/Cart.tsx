import React, { useState } from 'react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'เมล็ดแตงโม', price: 150, quantity: 2, image: 'https://placehold.co/100x100' },
    { id: 2, name: 'ปุ๋ยยูเรีย', price: 200, quantity: 1, image: 'https://placehold.co/100x100' },
    { id: 3, name: 'จอบ', price: 250, quantity: 1, image: 'https://placehold.co/100x100' },
  ]);

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleQuantityInput = (id: number, value: string) => {
    if (value === '') {
      // อนุญาตให้ช่องว่างชั่วคราว
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: 0 } : item
      ));
    } else {
      const numValue = parseInt(value) || 0;
      if (numValue > 0) {
        setCartItems(cartItems.map(item =>
          item.id === id ? { ...item, quantity: numValue } : item
        ));
      }
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt'] text-[#256D45] py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-5xl font-bold mb-12 text-left text-[#256D45]">รถเข็น</h1>

        {cartItems.length === 0 ? (
          <div className="bg-[#FFFEF2] rounded-xl shadow-lg p-8 text-center">
            <p className="text-3xl text-[#256D45]">รถเข็นว่างเปล่า</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-3">
              <div className="bg-[#FFFEF2] rounded-2xl shadow-lg overflow-hidden p-6">
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-6 pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-300" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-[#256D45]">{item.name}</h3>
                        <p className="text-lg text-[#256D45]">ราคา: ฿{item.price}</p>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="text-[#256D45] hover:text-gray-700 text-xl w-6 h-6 flex items-center justify-center"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => handleQuantityInput(item.id, e.target.value)}
                          className="text-lg font-semibold w-10 text-center text-[#256D45] bg-gray-100 border-none outline-none"
                          min="0"
                          placeholder="0"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="text-[#256D45] hover:text-[#1a4d2e] text-xl w-6 h-6 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-2xl font-bold text-[#256D45] min-w-[80px] text-right">
                        ฿{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#FFFEF2] rounded-2xl shadow-lg p-8 h-fit">
              <h2 className="text-2xl font-bold mb-6 pb-4 border-b-2 border-[#256D45] text-[#256D45]">สรุปคำสั่งสินค้า</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-lg">
                  <span className="text-[#256D45]">รวมสินค้า:</span>
                  <span className="font-semibold text-[#256D45]">฿{totalPrice}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-[#256D45]">ค่าส่งสินค้า:</span>
                  <span className="font-semibold text-[#256D45]">฿0</span>
                </div>
                <div className="flex justify-between text-lg border-t-2 border-[#256D45] pt-4">
                  <span className="font-bold text-[#256D45]">รวมทั้งสิ้น:</span>
                  <span className="font-bold text-xl text-[#256D45]">฿{totalPrice}</span>
                </div>
              </div>

              <button className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold py-3 rounded-lg text-lg transition-colors">
                สั่งซื้อ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
