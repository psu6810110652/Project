

const PendingReceived = () => {
  return (
    <div className="min-h-screen bg-[#DCEDC1] font-['Prompt'] text-[#256D45] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">รายการรอได้รับ</h1>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
        <p className="text-lg text-[#256D45]">แสดงรายการที่ต้องรอได้รับ...</p>
      </div>
    </div>
  );
};

export default PendingReceived;
