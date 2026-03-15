import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { optimizeImage } from '../utils/imageUtils';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  // Load cart data from localStorage on component mount
  useEffect(() => {
    // Cart is now managed by CartContext, so we just need to set loading to false
    setIsLoading(false);
  }, []);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleQuantityInput = (id: string, value: string) => {
    if (value === '') {
      updateQuantity(id, 0);
    } else {
      const numValue = parseInt(value) || 0;
      if (numValue > 0) {
        updateQuantity(id, numValue);
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const totalPrice = cartItems.reduce((sum: number, item: any) => {
    const itemPrice = item.isPromotion && item.promotionPrice ? item.promotionPrice : item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#DCEDC1] font-['Prompt'] text-[#256D45] py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-xl text-[#256D45]">กำลังโหลดข้อมูลรถเข็น...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DCEDC1] pt-4 pb-8 text-[#256D45]">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button inside container */}
        <div className="text-left flex justify-start mb-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#fdfcf6] text-[#2a6b3b] font-bold py-2! px-6! rounded-xl shadow-sm hover:bg-gray-50"
          >
            กลับ
          </button>
        </div>

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
                  {cartItems.map((item: any) => {
                    const itemPrice = item.isPromotion && item.promotionPrice ? item.promotionPrice : item.price;
                    return (
                      <div key={item.id} className="flex items-center gap-6 pb-4 border-b border-gray-200 last:border-b-0">
                        <div className="shrink-0">
                          {item.imageUrl ? (
                            <img src={optimizeImage(item.imageUrl, { width: 100, quality: 70 })} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-300" />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-2xl text-gray-400">📦</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-2xl font-semibold text-[#256D45]">{item.name}</h3>
                          <p className="text-lg text-[#256D45]">
                            ราคา:
                            <span className={item.isPromotion ? 'line-through text-gray-500' : ''}>
                              ฿{item.price}
                            </span>
                            {item.isPromotion && item.promotionPrice && (
                              <span className="text-red-600 font-bold ml-2">฿{item.promotionPrice}</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="text-[#256D45] hover:text-gray-700 text-xl w-6 h-6 flex items-center justify-center"
                            disabled={item.quantity <= 1}
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
                            disabled={item.stockQuantity ? item.quantity >= item.stockQuantity : false}
                          >
                            +
                          </button>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-2xl font-bold text-[#256D45] min-w-20 text-right">
                            ฿{itemPrice * item.quantity}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    );
                  })}
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

              <button
                // 🌟 แก้ไขตรงนี้: แนบ state ข้อมูลตะกร้าและราคารวมไปด้วย
                onClick={() => navigate('/payment', {
                  state: {
                    cartItems: cartItems,
                    totalPrice: totalPrice
                  }
                })}
                className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold py-3 rounded-lg text-lg transition-colors"
              >
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