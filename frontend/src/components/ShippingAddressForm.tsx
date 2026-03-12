import { useEffect, useState } from 'react';
import { Select, ConfigProvider } from 'antd';
import { Pencil, Trash2, Star, CheckCircle2, ChevronUp, Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import { type ShippingAddressFormProps, type AddressFormState, type Address } from '../types';


const emptyForm = (): AddressFormState => ({
    houseNumber: '',
    streetSoi: '',
    province: '',
    district: '',
    subDistrict: '',
    postalCode: '',
});

function getDistricts(addressData: any[], prov: string): string[] {
    if (!prov) return [];
    return Array.from(new Set(addressData.filter(i => i.province === prov).map(i => i.amphoe))).sort() as string[];
}

function getSubDistricts(addressData: any[], prov: string, dist: string): string[] {
    if (!prov || !dist) return [];
    return Array.from(new Set(addressData.filter(i => i.province === prov && i.amphoe === dist).map(i => i.district))).sort() as string[];
}

function getPostalCode(addressData: any[], prov: string, dist: string, sub: string): string {
    const matched = addressData.find(i => i.province === prov && i.amphoe === dist && i.district === sub);
    return matched ? String(matched.zipcode) : '';
}

function buildFullAddress(f: AddressFormState): string {
    return [f.houseNumber, f.streetSoi, f.subDistrict, f.district, f.province, f.postalCode].filter(Boolean).join(' ');
}

// ─── AddressFields (outside main component to prevent re-mount) ───────────────

interface AddressFieldsProps {
    form: AddressFormState;
    addressData: any[];
    onChange: (field: keyof AddressFormState, val: string) => void;
    errors?: { [key: string]: string };
}

const AddressFields = ({ form, addressData, onChange, errors = {} }: AddressFieldsProps) => {
    const provinces = Array.from(new Set(addressData.map(i => i.province))).sort() as string[];
    const dists = getDistricts(addressData, form.province);
    const subs = getSubDistricts(addressData, form.province, form.district);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#256D45] mb-1 text-left">บ้านเลขที่/หอพัก/ห้อง</label>
                <input
                    type="text"
                    value={form.houseNumber}
                    onChange={e => onChange('houseNumber', e.target.value)}
                    className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.houseNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-[#256D45] text-base text-left`}
                    placeholder="เลขที่บ้าน, หอพัก, ห้อง"
                />
                {errors.houseNumber && <p className="text-red-500 text-sm mt-1">{errors.houseNumber}</p>}
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#256D45] mb-1 text-left">ถนน/ซอย</label>
                <input
                    type="text"
                    value={form.streetSoi}
                    onChange={e => onChange('streetSoi', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-[#256D45] text-base text-left"
                    placeholder="ถนน, ซอย"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-[#256D45] mb-1 text-left">จังหวัด</label>
                <div className={errors.province ? 'border border-red-500 rounded-lg p-[1px]' : ''}>
                    <ConfigProvider theme={{ token: { fontFamily: 'Prompt', fontSize: 15, controlHeight: 44 } }}>
                        <Select
                            showSearch
                            value={form.province || undefined}
                            onChange={val => onChange('province', val)}
                            className="w-full"
                            style={{ textAlign: 'left' }}
                            placeholder="เลือก/ค้นหาจังหวัด"
                            options={provinces.map(p => ({ value: p, label: p }))}
                            filterOption={(input, option) => String(option?.label ?? '').includes(input)}
                        />
                    </ConfigProvider>
                </div>
                {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-[#256D45] mb-1 text-left">อำเภอ/เขต</label>
                <div className={errors.district ? 'border border-red-500 rounded-lg p-[1px]' : ''}>
                    <ConfigProvider theme={{ token: { fontFamily: 'Prompt', fontSize: 15, controlHeight: 44 } }}>
                        <Select
                            showSearch
                            value={form.district || undefined}
                            onChange={val => onChange('district', val)}
                            className="w-full"
                            style={{ textAlign: 'left' }}
                            placeholder={form.province ? 'เลือกอำเภอ' : 'เลือกจังหวัดก่อน'}
                            disabled={!form.province}
                            options={dists.map(d => ({ value: d, label: d }))}
                            filterOption={(input, option) => String(option?.label ?? '').includes(input)}
                        />
                    </ConfigProvider>
                </div>
                {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-[#256D45] mb-1 text-left">ตำบล/แขวง</label>
                <div className={errors.subDistrict ? 'border border-red-500 rounded-lg p-[1px]' : ''}>
                    <ConfigProvider theme={{ token: { fontFamily: 'Prompt', fontSize: 15, controlHeight: 44 } }}>
                        <Select
                            showSearch
                            value={form.subDistrict || undefined}
                            onChange={val => onChange('subDistrict', val)}
                            className="w-full"
                            style={{ textAlign: 'left' }}
                            placeholder={form.district ? 'เลือกตำบล' : 'เลือกอำเภอก่อน'}
                            disabled={!form.district}
                            options={subs.map(s => ({ value: s, label: s }))}
                            filterOption={(input, option) => String(option?.label ?? '').includes(input)}
                        />
                    </ConfigProvider>
                </div>
                {errors.subDistrict && <p className="text-red-500 text-sm mt-1">{errors.subDistrict}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-[#256D45] mb-1 text-left">รหัสไปรษณีย์</label>
                <input
                    type="text"
                    value={form.postalCode}
                    readOnly
                    disabled
                    className={`w-full px-4 py-2.5 bg-gray-200 border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-500 cursor-not-allowed text-base text-left`}
                />
                {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ShippingAddressForm = ({ onFormChange, errors = {} }: ShippingAddressFormProps) => {
    const [addressData, setAddressData] = useState<any[]>([]);
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

    // ฟอร์มเพิ่มที่อยู่ใหม่
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState<AddressFormState>(emptyForm());
    const [addLoading, setAddLoading] = useState(false);

    // state ของการแก้ไข: map id → เปิด/ปิด
    const [editOpenId, setEditOpenId] = useState<number | null>(null);
    // ข้อมูลที่กำลังแก้ไขในแต่ละ card
    const [editForms, setEditForms] = useState<Record<number, AddressFormState>>({});
    const [editLoading, setEditLoading] = useState<number | null>(null);
    const [defaultLoading, setDefaultLoading] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

    // Confirm modal
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    // Toast notification
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // โหลดฐานข้อมูลที่อยู่ไทย
    useEffect(() => {
        const cachedData = localStorage.getItem('thailand_address_db');
        if (cachedData) {
            try {
                setAddressData(JSON.parse(cachedData));
            } catch (e) {
                console.error('Error parsing cached address data:', e);
                fetchAddressData();
            }
        } else {
            fetchAddressData();
        }
        loadAddresses();
    }, []);

    const fetchAddressData = () => {
        fetch('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json')
            .then(res => res.json())
            .then(data => {
                setAddressData(data);
                localStorage.setItem('thailand_address_db', JSON.stringify(data));
            })
            .catch(err => console.error('โหลดฐานข้อมูลที่อยู่ไม่ได้:', err));
    };

    const loadAddresses = async () => {
        try {
            const res = await api.get('/addresses');
            const addrs: Address[] = res.data || [];
            setSavedAddresses(addrs);
            // sync default address กลับไป parent
            const def = addrs.find(a => a.isDefault) || addrs[0];
            if (def) syncToParent(def);
        } catch (err) {
            console.error('โหลดที่อยู่ไม่ได้:', err);
        }
    };

    const syncToParent = (addr: Address) => {
        onFormChange('houseNumber', addr.houseNumber || '');
        onFormChange('streetSoi', addr.streetSoi || '');
        onFormChange('province', addr.province || '');
        onFormChange('district', addr.district || '');
        onFormChange('subDistrict', addr.subDistrict || '');
        onFormChange('postalCode', addr.postalCode || '');
    };

    // ---- ฟอร์มเพิ่มที่อยู่ใหม่ ----
    const handleAddFieldChange = (field: keyof AddressFormState, val: string) => {
        setAddForm(prev => {
            const next = { ...prev, [field]: val };
            if (field === 'province') { next.district = ''; next.subDistrict = ''; next.postalCode = ''; }
            if (field === 'district') { next.subDistrict = ''; next.postalCode = ''; }
            if (field === 'subDistrict') { next.postalCode = getPostalCode(addressData, next.province, next.district, val); }
            return next;
        });
    };

    const handleAddSubmit = async () => {
        if (!addForm.houseNumber.trim()) {
            showToast('error', 'กรุณากรอกบ้านเลขที่');
            return;
        }
        if (!addForm.province) {
            showToast('error', 'กรุณาเลือกจังหวัด');
            return;
        }
        if (!addForm.district) {
            showToast('error', 'กรุณาเลือกอำเภอ/เขต');
            return;
        }
        if (!addForm.subDistrict) {
            showToast('error', 'กรุณาเลือกตำบล/แขวง');
            return;
        }
        setAddLoading(true);
        try {
            const payload = {
                ...addForm,
                fullAddress: buildFullAddress(addForm),
                isDefault: savedAddresses.length === 0,
            };
            await api.post('/addresses', payload);
            setAddForm(emptyForm());
            setShowAddForm(false);
            await loadAddresses();
            showToast('success', 'เพิ่มที่อยู่เรียบร้อยแล้ว');
        } catch (err) {
            console.error('เพิ่มที่อยู่ไม่ได้:', err);
            showToast('error', 'ไม่สามารถเพิ่มที่อยู่ได้');
        }
        setAddLoading(false);
    };

    // ---- ฟอร์มแก้ไข ----
    const toggleEdit = (addr: Address) => {
        if (editOpenId === addr.id) {
            setEditOpenId(null);
            return;
        }
        setEditOpenId(addr.id);
        setEditForms(prev => ({
            ...prev,
            [addr.id]: {
                houseNumber: addr.houseNumber || '',
                streetSoi: addr.streetSoi || '',
                province: addr.province || '',
                district: addr.district || '',
                subDistrict: addr.subDistrict || '',
                postalCode: addr.postalCode || '',
            },
        }));
    };

    const handleEditFieldChange = (id: number, field: keyof AddressFormState, val: string) => {
        setEditForms(prev => {
            const cur = { ...(prev[id] || emptyForm()), [field]: val };
            if (field === 'province') { cur.district = ''; cur.subDistrict = ''; cur.postalCode = ''; }
            if (field === 'district') { cur.subDistrict = ''; cur.postalCode = ''; }
            if (field === 'subDistrict') { cur.postalCode = getPostalCode(addressData, cur.province, cur.district, val); }
            return { ...prev, [id]: cur };
        });
    };

    const handleEditSubmit = async (id: number) => {
        const f = editForms[id];
        if (!f) return;

        // ✅ เพิ่มเช็คก่อน submit
        if (!f.houseNumber.trim() || !f.province || !f.district || !f.subDistrict) {
            showToast('error', 'กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน');
            return;
        }

        setEditLoading(id);
        try {
            await api.patch(`/addresses/${id}`, {
                ...f,
                fullAddress: buildFullAddress(f),
            });
            setEditOpenId(null);
            await loadAddresses();
            showToast('success', 'บันทึกการแก้ไขเรียบร้อยแล้ว');
        } catch (err) {
            console.error('แก้ไขที่อยู่ไม่ได้:', err);
            showToast('error', 'ไม่สามารถบันทึกการแก้ไขได้');
        }
        setEditLoading(null);
    };

    const handleSetDefault = async (id: number) => {
        setDefaultLoading(id);
        try {
            await api.patch(`/addresses/${id}/set-default`);
            await loadAddresses();
            showToast('success', 'เลือกที่อยู่หลักเรียบร้อยแล้ว');
        } catch (err) {
            console.error('ตั้ง default ไม่ได้:', err);
            showToast('error', 'ไม่สามารถเลือกที่อยู่หลักได้');
        }
        setDefaultLoading(null);
    };

    const handleDelete = (id: number) => {
        // เปิด confirm modal แทน window.confirm
        setDeleteTargetId(id);
    };

    const confirmDelete = async () => {
        if (deleteTargetId === null) return;
        const id = deleteTargetId;
        setDeleteTargetId(null);
        setDeleteLoading(id);
        try {
            await api.delete(`/addresses/${id}`);
            await loadAddresses();
            showToast('success', 'ลบที่อยู่เรียบร้อยแล้ว');
        } catch (err) {
            console.error('ลบที่อยู่ไม่ได้:', err);
            showToast('error', 'ไม่สามารถลบที่อยู่ได้ กรุณาลองใหม่อีกครั้ง');
        }
        setDeleteLoading(null);
    };

    return (
        <>
            {/* ── Toast Notification ─────────────────────────────────── */}
            {toast && (
                <div className={`fixed top-6 right-6 z-9999 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold ${toast.type === 'success' ? 'bg-[#256D45]' : 'bg-red-500'
                    }`}>
                    {toast.type === 'success'
                        ? <CheckCircle size={20} className="shrink-0" />
                        : <XCircle size={20} className="shrink-0" />}
                    {toast.message}
                </div>
            )}

            {/* ── Delete Confirm Modal ────────────────────────────── */}
            {deleteTargetId !== null && (
                <div className="fixed inset-0 z-9998 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteTargetId(null)}
                    />
                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-sm flex flex-col items-center gap-4 z-10">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 text-center">ยืนยันการลบที่อยู่</h3>
                        <p className="text-sm text-gray-500 text-center leading-relaxed">
                            คุณต้องการลบที่อยู่นี้ออกจากระบบ?<br />
                            <span className="text-red-400 font-medium">การลบไม่สามารถกู้คืนได้</span>
                        </p>
                        <div className="flex gap-3 w-full mt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTargetId(null)}
                                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all shadow-md"
                            >
                                ลบที่อยู่
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#FFFEF2] rounded-xl shadow-lg p-8 text-left">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-[#256D45]">
                    <h2 className="text-xl font-bold text-[#256D45] text-left">ที่อยู่ในการจัดส่ง</h2>
                    <button
                        type="button"
                        onClick={() => { setShowAddForm(v => !v); setAddForm(emptyForm()); }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#256D45] text-white rounded-full text-sm font-semibold shadow hover:bg-[#1a5434] transition-all"
                    >
                        <Plus size={16} />
                        เพิ่มที่อยู่
                    </button>
                </div>

                {/* ✅ เพิ่ม — แสดง error เมื่อยังไม่มีที่อยู่ หรือที่อยู่ไม่ครบ */}
                {(errors.houseNumber || errors.province || errors.district || errors.subDistrict || errors.postalCode) && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-red-500 w-5 h-5 shrink-0" />
                        <p className="text-red-500 text-sm font-medium text-left">
                            กรุณาเพิ่มที่อยู่จัดส่งและกรอกข้อมูลให้ครบถ้วน
                        </p>
                    </div>
                )}

                {/* ฟอร์มเพิ่มที่อยู่ใหม่ */}
                {showAddForm && (
                    <div className="mb-6 p-5 border-2 border-dashed border-[#256D45]/40 rounded-xl bg-green-50/30">
                        <h3 className="font-semibold text-[#256D45] mb-1 flex items-center gap-2 text-left">
                            <Plus size={16} /> เพิ่มที่อยู่ใหม่
                        </h3>
                        <AddressFields
                            form={addForm}
                            addressData={addressData}
                            onChange={handleAddFieldChange}
                            errors={errors}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => { setShowAddForm(false); setAddForm(emptyForm()); }}
                                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all text-sm"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={handleAddSubmit}
                                disabled={addLoading}
                                className="px-5 py-2 rounded-lg bg-[#256D45] text-white font-semibold hover:bg-[#1a5434] transition-all text-sm disabled:opacity-60"
                            >
                                {addLoading ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}
                            </button>
                        </div>
                    </div>
                )}

                {/* รายการที่อยู่ */}
                {savedAddresses.length === 0 ? (
                    <p className="text-gray-400 text-center py-8 italic">ยังไม่มีที่อยู่ที่บันทึกไว้ กด "+ เพิ่มที่อยู่" เพื่อเริ่มต้น</p>
                ) : (
                    <div className="space-y-4">
                        {savedAddresses.map(addr => {
                            const isEditOpen = editOpenId === addr.id;
                            const ef = editForms[addr.id] || emptyForm();

                            return (
                                <div
                                    key={addr.id}
                                    className={`rounded-xl border-2 transition-all ${addr.isDefault
                                        ? 'border-[#256D45] bg-green-50/40 shadow-md'
                                        : 'border-gray-200 bg-white shadow-sm'
                                        }`}
                                >
                                    {/* Card Header */}
                                    <div className="flex items-center gap-3 p-4">
                                        {/* Checkbox/tick */}
                                        <div className="shrink-0">
                                            {addr.isDefault ? (
                                                <CheckCircle2 size={22} className="text-[#256D45]" />
                                            ) : (
                                                <div className="w-5.5 h-5.5 rounded-full border-2 border-gray-300" />
                                            )}
                                        </div>

                                        {/* ข้อมูลที่อยู่ — ชิดซ้าย */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-[#256D45] font-semibold text-base leading-snug text-left">
                                                {[addr.houseNumber, addr.streetSoi].filter(Boolean).join(' ') || addr.fullAddress}
                                            </p>
                                            {(addr.subDistrict || addr.district || addr.province) && (
                                                <p className="text-gray-500 text-sm mt-0.5 text-left">
                                                    {[addr.subDistrict, addr.district, addr.province, addr.postalCode].filter(Boolean).join(' ')}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {/* เลือกที่อยู่ */}
                                            <button
                                                type="button"
                                                onClick={() => !addr.isDefault && handleSetDefault(addr.id)}
                                                disabled={addr.isDefault || defaultLoading === addr.id}
                                                title={addr.isDefault ? 'ที่อยู่หลักอยู่แล้ว' : 'เลือกเป็นที่อยู่หลัก'}
                                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all border-2 ${addr.isDefault
                                                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border-[#256D45] text-[#256D45] hover:bg-[#256D45] hover:text-white cursor-pointer shadow-sm'
                                                    }`}
                                            >
                                                <Star size={14} fill={addr.isDefault ? '#9ca3af' : 'none'} />
                                                {defaultLoading === addr.id ? '...' : 'เลือกที่อยู่นี้'}
                                            </button>

                                            {/* Edit toggle */}
                                            <button
                                                type="button"
                                                onClick={() => toggleEdit(addr)}
                                                title="แก้ไขที่อยู่"
                                                className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all ${isEditOpen
                                                    ? 'bg-[#256D45] border-[#256D45] text-white'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:border-[#256D45] hover:text-[#256D45]'
                                                    }`}
                                            >
                                                {isEditOpen ? <ChevronUp size={15} /> : <Pencil size={14} />}
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(addr.id)}
                                                disabled={deleteLoading === addr.id}
                                                title="ลบที่อยู่"
                                                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-white text-red-400 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                                            >
                                                {deleteLoading === addr.id ? (
                                                    <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Edit Form Dropdown */}
                                    {isEditOpen && (
                                        <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                                            <AddressFields
                                                form={ef}
                                                addressData={addressData}
                                                onChange={(field, val) => handleEditFieldChange(addr.id, field, val)}
                                                errors={errors}
                                            />
                                            <div className="flex justify-end gap-3 mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditOpenId(null)}
                                                    className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all text-sm"
                                                >
                                                    ยกเลิก
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditSubmit(addr.id)}
                                                    disabled={editLoading === addr.id}
                                                    className="px-5 py-2 rounded-lg bg-[#256D45] text-white font-semibold hover:bg-[#1a5434] transition-all text-sm disabled:opacity-60"
                                                >
                                                    {editLoading === addr.id ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default ShippingAddressForm;
