const createOrders = async () => {
    try {
        const orders = [
            // รอยืนยัน (pending_confirm)
            {
                customerName: 'คุณสมชาย ใจดี',
                products: [{ name: 'อุปกรณ์รดน้ำ', quantity: 1, price: 500 }],
                totalAmount: 500,
                status: 'pending_confirm',
                address: '123 หมู่ 1 ต.บางพลับ อ.ปากเกร็ด จ.นนทบุรี 11120',
                phone: '081-234-5678'
            },
            {
                customerName: 'คุณสมหญิง รักดี',
                products: [{ name: 'ปุ๋ยเคมี สูตร 15-15-15', quantity: 10, price: 100 }],
                totalAmount: 1000,
                status: 'pending_confirm',
                address: '456 ถ.มิตรภาพ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',
                phone: '089-876-5432'
            },

            // รอจัดส่ง (pending_delivery)
            {
                customerName: 'คุณวิชัย รุ่งเรือง',
                products: [{ name: 'เมล็ดพันธุ์ข้าวโพด', quantity: 5, price: 200 }],
                totalAmount: 1000,
                status: 'pending_delivery',
                address: '789 ซอย 5 ต.ช้างเผือก อ.เมือง จ.เชียงใหม่ 50300',
                phone: '085-112-2334'
            },
            {
                customerName: 'คุณอุษา งามตา',
                products: [{ name: 'ดินผสมพร้อมปลูก', quantity: 20, price: 40 }],
                totalAmount: 800,
                status: 'pending_delivery',
                address: '321 หมู่ 3 ต.คลองแห อ.หาดใหญ่ จ.สงขลา 90110',
                phone: '084-556-6778'
            },

            // จัดส่งแล้ว (pending_received)
            {
                customerName: 'คุณเอกพล แข็งแกร่ง',
                products: [{ name: 'ยาบำรุงราก', quantity: 2, price: 350 }],
                totalAmount: 700,
                status: 'pending_received',
                address: '555 ถ.สุขุมวิท 71 แขวงพระโขนงเหนือ เขตวัฒนา กรุงเทพฯ 10110',
                phone: '081-998-8776'
            },
            {
                customerName: 'คุณมาลี มีสุข',
                products: [{ name: 'สายยางรดน้ำ 20เมตร', quantity: 1, price: 300 }],
                totalAmount: 300,
                status: 'pending_received',
                address: '99/9 ถ.พหลโยธิน ต.ประชาธิปัตย์ อ.ธัญบุรี จ.ปทุมธานี 12130',
                phone: '086-555-4444'
            }
        ];

        console.log('เริ่มสร้างข้อมูลจำลอง (Mock Data) ทั้ง 3 สถานะ...\n');

        for (let i = 0; i < orders.length; i++) {
            const response = await fetch('http://localhost:3000/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orders[i])
            });

            const data = await response.json();
            if (response.ok) {
                console.log(`✅ [${orders[i].status}] สร้างออเดอร์สำเร็จ: รหัส #${data.orderNumber} (${orders[i].customerName})`);
            } else {
                console.error(`❌ สร้างออเดอร์ล้มเหลว:`, data);
            }
        }

        console.log('\nสร้างข้อมูลเสร็จสิ้นแล้ว! ลองกด Refresh ที่หน้าเว็บดูได้เลยครับ');

    } catch (err) {
        if (err.cause?.code === 'ECONNREFUSED') {
            console.error('\n❌ เกิดข้อผิดพลาด: ไม่สามารถเชื่อมต่อกับ Backend ได้ โปรดตรวจสอบว่ารัน "npm run start:dev" หรือยัง');
        } else {
            console.error(err);
        }
    }
};

createOrders();
