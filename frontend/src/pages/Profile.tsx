import React from 'react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 font-['Prompt'] text-green-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-5xl font-bold mb-8 text-center text-green-800">หน้าผู้ใช้</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 bg-gray-300 rounded-full overflow-hidden">
                <img 
                  src="https://placehold.co/200x200" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                เปลี่ยนรูปภาพ
              </button>
            </div>

            {/* Profile Information */}
            <div className="flex-1">
              <div className="mb-6">
                <label className="block text-2xl font-semibold mb-2">ชื่อ</label>
                <input 
                  type="text" 
                  placeholder="กรุณากรอกชื่อ" 
                  className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="mb-6">
                <label className="block text-2xl font-semibold mb-2">อีเมล</label>
                <input 
                  type="email" 
                  placeholder="กรุณากรอกอีเมล" 
                  className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="mb-6">
                <label className="block text-2xl font-semibold mb-2">เบอร์โทรศัพท์</label>
                <input 
                  type="tel" 
                  placeholder="กรุณากรอกเบอร์โทรศัพท์" 
                  className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600"
                />
              </div>

              <div className="mb-6">
                <label className="block text-2xl font-semibold mb-2">ที่อยู่</label>
                <textarea 
                  placeholder="กรุณากรอกที่อยู่" 
                  className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600 h-24"
                ></textarea>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-xl transition-colors">
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
