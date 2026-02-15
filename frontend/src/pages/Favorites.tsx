import BackButton from '../components/BackButton';

const Favorites = () => {
  return (
    <div className="min-h-screen bg-[#DCEDC1] flex items-center justify-center font-['Prompt'] text-[#256D45]">
      <BackButton />
      <div className="bg-white rounded-xl shadow-lg p-10 text-center">
        <h1 className="text-4xl font-bold text-[#256D45] mb-4">รายการโปรด</h1>
        <p className="text-lg mb-6">สินค้าที่คุณเพิ่มเป็นรายการโปรดจะแสดงที่นี่</p>
        {/* เพิ่มรายละเอียดหรือรายการสินค้ารายการโปรดได้ */}
      </div>
    </div>
  );
};

export default Favorites;
