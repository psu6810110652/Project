import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { AdminSearchContext } from '../../context/AdminSearchContext';
import { type Category, type Product } from '../../types';
import { Table, Space, Tooltip, ConfigProvider, Popconfirm, message } from 'antd';
import { type ColumnsType } from 'antd/es/table';

const ViewProducts: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const { categoryId } = useParams<{ categoryId: string }>();
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { searchTerm } = useContext(AdminSearchContext);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/product/${id}`);
            messageApi.success('ลบสินค้าเรียบร้อยแล้ว');
            setProducts(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error(error);
            messageApi.error('ลบสินค้าไม่สำเร็จ');
        }
    };

    const columns: ColumnsType<Product> = [
        {
            title: 'รหัสสินค้า',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            sorter: (a, b) => a.id.localeCompare(b.id),
            defaultSortOrder: 'ascend',
            render: (text) => <span className="text-xl font-bold text-[#256D45]">#{text}</span>,
        },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            render: (text) => <span className="text-xl font-bold text-[#256D45]">{text}</span>,
        },
        {
            title: 'ราคา',
            key: 'price',
            align: 'center',
            sorter: (a, b) => (a.promotionPrice || a.price) - (b.promotionPrice || b.price),
            render: (_, record) => {
                const price = record.promotionPrice || record.price;
                return <span className="text-xl font-bold text-[#256D45]">{price.toLocaleString()}</span>;
            }
        },
        {
            title: 'จำนวน',
            key: 'stock',
            align: 'center',
            sorter: (a, b) => (a.stock || a.stockQuantity || 0) - (b.stock || b.stockQuantity || 0),
            render: (_, record) => (
                <span className={`text-xl font-bold ${(record.stock || record.stockQuantity || 0) <= 10 ? 'text-red-500' : 'text-[#256D45]'}`}>
                    {(record.stock || record.stockQuantity || 0).toLocaleString()}
                </span>
            ),
        },
        {
            title: 'สถานะ',
            key: 'status',
            align: 'center',
            render: (_, record) => {
                const stock = record.stock || record.stockQuantity || 0;
                return (
                    <div className="flex justify-center">
                        <div
                            className={`w-4 h-4 rounded-full shadow-sm ${stock > 10 ? 'bg-[#00FF85]' : 'bg-red-500'}`}
                            title={stock > 10 ? 'ปกติ' : 'สินค้าใกล้หมด'}
                        />
                    </div>
                );
            },
        },
        {
            title: 'จัดการ',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space size="middle">
                    <button
                        className="w-10 h-8 px-2 py-1 mr-3 text-[#256D45] hover:bg-[#256D45] rounded-[20px] hover:text-[#FFFEF2] font-bold"
                        onClick={() => navigate(`/admin/products/${categoryId}/${record.id}`)}
                    >
                        แก้ไข
                    </button>
                    <Tooltip title="ดูรีวิวสินค้า">
                        <button className="mr-3 border-[#256D45] text-[#256D45] hover:bg-[#256D45] hover:text-white flex items-center gap-1 font-bold">
                            <span>⭐</span> รีวิว
                        </button>
                    </Tooltip>
                    <Popconfirm
                        title="ลบสินค้า"
                        description="คุณแน่ใจหรือไม่ที่จะลบสินค้านี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
                        onConfirm={() => handleDelete(record.id)}
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                    >
                        <button className="text-red-500 font-bold hover:text-red-700">ลบ</button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [catResponse, prodResponse] = await Promise.all([
                    api.get(`/category/${categoryId}`),
                    api.get(`/product/category/${categoryId}?limit=1000`)
                ]);
                setCategory(catResponse.data);
                setProducts(prodResponse.data);
            } catch (error) {
                console.error("Fetch Error:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        if (categoryId) fetchData();
    }, [categoryId]);

    if (loading) return <div className="text-center mt-20 font-['Prompt'] text-2xl text-[#256D45]">กำลังโหลดข้อมูล...</div>;

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#256D45'
                },
                components: {
                    Table: {
                        headerBg: '#FFFEF2',
                        headerColor: '#256D45',
                        headerBorderRadius: 0,
                        borderColor: '#256D45', // สีเส้นตาราง
                        cellPaddingBlock: 16,
                    },
                },
            }}
        >
            <div className="min-h-screen bg-[#DCEDC1] p-6 lg:p-10 w-full">
                {contextHolder}
                {/* Header */}
                <div className="flex flex-col w-full mx-auto mb-4 md:mb-6">
                    <div className="flex items-center justify-between w-full flex-wrap gap-4">
                        <h1 className="text-3xl md:text-5xl font-black text-[#256D45] drop-shadow-sm tracking-tight">
                            {category?.name || "จัดการสินค้า"}
                        </h1>

                        <button
                            className="w-auto px-4 md:w-50 h-10 bg-[#FFFEF2] rounded-[20px] shadow-2xl hover:border-2 border-[#256D45] transition-colors whitespace-nowrap shrink-0"
                            onClick={() => { navigate(`/admin/products/${categoryId}/new`) }}
                        >
                            <span className="text-[#256D45] text-base md:text-xl font-bold">+ เพิ่มสินค้า</span>
                        </button>
                    </div>

                    <div className="mt-4 h-1 w-full bg-[#256D45] rounded-full shadow-sm"></div>
                </div>

                {/* ตารางสินค้า */}
                <div className="bg-[#FFFEF2] rounded-[20px] md:rounded-[40px] shadow-2xl overflow-hidden -mt-1 w-full max-w-[calc(100vw-32px)] md:max-w-full">
                    <Table
                        columns={columns}
                        dataSource={products.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))}
                        rowKey="id"
                        bordered // เปิดเส้นตารางแนวตั้ง
                        loading={loading}
                        scroll={{ x: 800 }} // เพิ่มตัวนี้เพื่อให้ไถตารางแนวนอนได้ในจอมือถือ
                        pagination={{
                            pageSize: 10,
                            placement: ['bottomCenter'],
                            align: 'center',
                            className: "py-6"
                        }}
                        className="custom-admin-table"
                    />
                </div>
            </div>

            {/* Custom CSS สำหรับเก็บรายละเอียดเส้นตารางให้เป๊ะตามแบบ */}
            <style>{`
                .custom-admin-table.ant-table-wrapper .ant-table {
                    border: none !important;
                }
                .custom-admin-table .ant-table-container {
                    border: none !important;
                }

                .custom-admin-table .ant-table-bordered > .ant-table-container {
                    border: none !important;
                }

                /* --- ส่วนเดิมของคุณ --- */
                .custom-admin-table .ant-table-thead > tr > th {
                    border-bottom: 4px solid #256D45 !important;
                    font-size: 1.25rem;
                    font-weight: 900;
                    text-align: center !important;
                }
                .custom-admin-table .ant-table-tbody > tr > td {
                    padding: 12px 16px !important;
                    /* ถ้าต้องการให้เหลือแค่เส้นนอน ไม่เอาเส้นตั้ง ให้ใส่ border-right: none */
                    border-right: none !important; 
                }
            `}</style>
        </ConfigProvider>
    );
};

export default ViewProducts;