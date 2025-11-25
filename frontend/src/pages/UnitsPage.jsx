import React, { useEffect, useState } from "react";
import api from "../api/api";
import DataTable from "../components/ui/DataTable";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

export default function UnitsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [form, setForm] = useState({
    project_id: "",
    unit_number: "",
    unit_type: "شقة",
    area: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    floor: "",
    features: "",
    status: "متاحة"
  });

  // أنواع الوحدات المتاحة
  const unitTypes = ["شقة", "فيلا", "دوبلكس", "تاون هاوس", "محل تجاري"];

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/units/index.php");
      const payload = res.data?.data ?? res.data;
      setList(Array.isArray(payload) ? payload : payload.units ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/units/add.php", form);
      setShowAdd(false);
      resetForm();
      await load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/units/update.php?id=${selectedUnit.id}`, form);
      setShowEdit(false);
      resetForm();
      await load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/units/delete.php?id=${selectedUnit.id}`);
      setShowDelete(false);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const resetForm = () => {
    setForm({
      project_id: "",
      unit_number: "",
      unit_type: "شقة",
      area: "",
      price: "",
      bedrooms: "",
      bathrooms: "",
      floor: "",
      features: "",
      status: "متاحة"
    });
  };

  const openViewModal = (unit) => {
    setSelectedUnit(unit);
    setShowView(true);
  };

  const openEditModal = (unit) => {
    setSelectedUnit(unit);
    setForm({
      project_id: unit.project_id || "",
      unit_number: unit.unit_number || "",
      unit_type: unit.unit_type || "شقة",
      area: unit.area || "",
      price: unit.price || "",
      bedrooms: unit.bedrooms || "",
      bathrooms: unit.bathrooms || "",
      floor: unit.floor || "",
      features: unit.features || "",
      status: unit.status || "متاحة"
    });
    setShowEdit(true);
  };

  const openDeleteModal = (unit) => {
    setSelectedUnit(unit);
    setShowDelete(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "متاحة": return "bg-green-100 text-success";
      case "محجوزة": return "bg-yellow-100 text-warning";
      case "مباعة": return "bg-red-100 text-danger";
      default: return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">الوحدات</h2>
          <p className="text-neutral-500 mt-1">قائمة كل الوحدات وإدارتها</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAdd(true)} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة وحدة
          </Button>
          <Button variant="secondary" onClick={load} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">إجمالي الوحدات</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{list.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">الوحدات المتاحة</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {list.filter(u => u.status === "متاحة").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">الوحدات المباعة</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {list.filter(u => u.status === "مباعة").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">إجمالي القيمة</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {new Intl.NumberFormat().format(
                  list.reduce((sum, unit) => sum + (parseFloat(unit.price) || 0), 0)
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-card border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-neutral-500 mt-2">جارٍ تحميل الوحدات...</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "project_name", label: "المشروع" },
              { key: "unit_number", label: "رقم الوحدة" },
              { 
                key: "unit_type", 
                label: "النوع",
                render: (r) => (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {r.unit_type}
                  </span>
                )
              },
              { key: "area", label: "المساحة", render: (r) => `${r.area} م²` },
              { 
                key: "price", 
                label: "السعر", 
                render: (r) => new Intl.NumberFormat().format(r.price) + " ج.م" 
              },
              { 
                key: "status", 
                label: "الحالة",
                render: (r) => (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                    {r.status}
                  </span>
                )
              },
              {
                key: "actions", 
                label: "إجراءات", 
                render: (r) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openViewModal(r)}>
                      عرض
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => openEditModal(r)}>
                      تعديل
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => openDeleteModal(r)}>
                      حذف
                    </Button>
                  </div>
                )
              }
            ]}
            data={list}
          />
        )}
      </div>

      {/* Add Unit Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} width="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">إضافة وحدة جديدة</h3>
            <button
              onClick={() => setShowAdd(false)}
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="ID المشروع" 
                name="project_id" 
                value={form.project_id} 
                onChange={handleChange}
                required
              />
              <Input 
                label="رقم الوحدة" 
                name="unit_number" 
                value={form.unit_number} 
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">نوع الوحدة</div>
                <select 
                  name="unit_type" 
                  value={form.unit_type} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {unitTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <Input 
                label="المساحة (م²)" 
                name="area" 
                value={form.area} 
                onChange={handleChange}
                type="number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="السعر (ج.م)" 
                name="price" 
                value={form.price} 
                onChange={handleChange}
                type="number"
              />
              <Input 
                label="الدور" 
                name="floor" 
                value={form.floor} 
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="عدد الغرف" 
                name="bedrooms" 
                value={form.bedrooms} 
                onChange={handleChange}
                type="number"
              />
              <Input 
                label="عدد الحمامات" 
                name="bathrooms" 
                value={form.bathrooms} 
                onChange={handleChange}
                type="number"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">الحالة</div>
                <select 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="متاحة">متاحة</option>
                  <option value="محجوزة">محجوزة</option>
                  <option value="مباعة">مباعة</option>
                </select>
              </label>
            </div>

            <Input 
              label="المميزات" 
              name="features" 
              value={form.features} 
              onChange={handleChange}
              placeholder="مكيف، مدفأة، مطبخ مجهز"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="secondary" 
                onClick={() => setShowAdd(false)} 
                type="button"
              >
                إلغاء
              </Button>
              <Button type="submit">
                إضافة الوحدة
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Unit Modal */}
      {showView && selectedUnit && (
        <Modal onClose={() => setShowView(false)} width="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">تفاصيل الوحدة</h3>
            <button
              onClick={() => setShowView(false)}
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-500">المشروع</label>
                  <p className="text-lg text-neutral-900 mt-1">{selectedUnit.project_name || "غير محدد"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500">رقم الوحدة</label>
                  <p className="text-lg text-neutral-900 mt-1">{selectedUnit.unit_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500">نوع الوحدة</label>
                  <p className="text-lg text-neutral-900 mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {selectedUnit.unit_type}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500">المساحة</label>
                  <p className="text-lg text-neutral-900 mt-1">{selectedUnit.area} م²</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-500">السعر</label>
                  <p className="text-lg text-neutral-900 mt-1">
                    {new Intl.NumberFormat().format(selectedUnit.price)} ج.م
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500">الدور</label>
                  <p className="text-lg text-neutral-900 mt-1">{selectedUnit.floor || "غير محدد"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500">الغرف / الحمامات</label>
                  <p className="text-lg text-neutral-900 mt-1">
                    {selectedUnit.bedrooms || 0} غرف / {selectedUnit.bathrooms || 0} حمام
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500">الحالة</label>
                  <p className="text-lg text-neutral-900 mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUnit.status)}`}>
                      {selectedUnit.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {selectedUnit.features && (
              <div>
                <label className="text-sm font-medium text-neutral-500">المميزات</label>
                <p className="text-lg text-neutral-900 mt-1">{selectedUnit.features}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="secondary" 
                onClick={() => setShowView(false)}
              >
                إغلاق
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Unit Modal */}
      {showEdit && selectedUnit && (
        <Modal onClose={() => setShowEdit(false)} width="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">تعديل الوحدة</h3>
            <button
              onClick={() => setShowEdit(false)}
              className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="ID المشروع" 
                name="project_id" 
                value={form.project_id} 
                onChange={handleChange}
                required
              />
              <Input 
                label="رقم الوحدة" 
                name="unit_number" 
                value={form.unit_number} 
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">نوع الوحدة</div>
                <select 
                  name="unit_type" 
                  value={form.unit_type} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  {unitTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <Input 
                label="المساحة (م²)" 
                name="area" 
                value={form.area} 
                onChange={handleChange}
                type="number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="السعر (ج.م)" 
                name="price" 
                value={form.price} 
                onChange={handleChange}
                type="number"
              />
              <Input 
                label="الدور" 
                name="floor" 
                value={form.floor} 
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="عدد الغرف" 
                name="bedrooms" 
                value={form.bedrooms} 
                onChange={handleChange}
                type="number"
              />
              <Input 
                label="عدد الحمامات" 
                name="bathrooms" 
                value={form.bathrooms} 
                onChange={handleChange}
                type="number"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">الحالة</div>
                <select 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="متاحة">متاحة</option>
                  <option value="محجوزة">محجوزة</option>
                  <option value="مباعة">مباعة</option>
                </select>
              </label>
            </div>

            <Input 
              label="المميزات" 
              name="features" 
              value={form.features} 
              onChange={handleChange}
              placeholder="مكيف، مدفأة، مطبخ مجهز"
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="secondary" 
                onClick={() => setShowEdit(false)} 
                type="button"
              >
                إلغاء
              </Button>
              <Button type="submit">
                حفظ التعديلات
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && selectedUnit && (
        <Modal onClose={() => setShowDelete(false)} width="max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-2">حذف الوحدة</h3>
            <p className="text-neutral-600 mb-6">
              هل أنت متأكد من أنك تريد حذف الوحدة رقم <strong>{selectedUnit.unit_number}</strong>؟ 
              <br />هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className="flex justify-center gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowDelete(false)}
              >
                إلغاء
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete}
              >
                نعم، احذف
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}