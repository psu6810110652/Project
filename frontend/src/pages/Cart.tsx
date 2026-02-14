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

  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 font-['Prompt'] text-green-800 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-5xl font-bold mb-8 text-center text-green-800">รถเข็น</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-3xl text-gray-500">รถเข็นว่างเปล่า</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-6 p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-2">{item.name}</h3>
                      <p className="text-xl text-gray-600">ราคา: ฿{item.price}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        -
                      </button>
                      <span className="text-2xl font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-2xl font-bold text-right min-w-[100px]">
                      ฿{item.price * item.quantity}
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8 h-fit">
              <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2 border-green-300">สรุปคำสั่งซื้อ</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-xl">
                  <span>รวมสินค้า:</span>
                  <span className="font-semibold">฿{totalPrice}</span>
                </div>
                <div className="flex justify-between text-xl">
                  <span>ค่าส่งสินค้า:</span>
                  <span className="font-semibold">฿0</span>
                </div>
                <div className="flex justify-between text-xl border-t-2 border-gray-300 pt-4">
                  <span className="font-bold">รวมทั้งสิ้น:</span>
                  <span className="font-bold text-2xl text-green-600">฿{totalPrice}</span>
                </div>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-xl transition-colors mb-3">
                ดำเนินการสั่งซื้อ
              </button>
              <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg text-xl transition-colors">
                続きを買い物する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
