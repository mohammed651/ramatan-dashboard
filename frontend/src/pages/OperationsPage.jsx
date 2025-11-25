import React, { useEffect, useState } from "react";
import api from "../api/api";
import DataTable from "../components/ui/DataTable";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

export default function OperationsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);
  const [deletingOperation, setDeletingOperation] = useState(null);
  const [form, setForm] = useState({
    unit_id: "",
    customer_name: "",
    customer_phone: "",
    operation_type: "حجز",
    amount: "",
    payment_method: "كاش",
    contract_number: "",
    notes: "",
    operation_date: new Date().toISOString().split('T')[0]
  });
  const [editForm, setEditForm] = useState({
    unit_id: "",
    customer_name: "",
    customer_phone: "",
    operation_type: "حجز",
    amount: "",
    payment_method: "كاش",
    contract_number: "",
    notes: "",
    operation_date: new Date().toISOString().split('T')[0]
  });

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/operations/index.php");
      const payload = res.data?.data ?? res.data;
      setList(Array.isArray(payload) ? payload : payload.operations ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((s) => ({ ...s, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/operations/add.php", form);
      setShowAdd(false);
      setForm({
        unit_id: "",
        customer_name: "",
        customer_phone: "",
        operation_type: "حجز",
        amount: "",
        payment_method: "كاش",
        contract_number: "",
        notes: "",
        operation_date: new Date().toISOString().split('T')[0]
      });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/operations/update.php?id=${editingOperation.id}`, editForm);
      setShowEdit(false);
      setEditingOperation(null);
      setEditForm({
        unit_id: "",
        customer_name: "",
        customer_phone: "",
        operation_type: "حجز",
        amount: "",
        payment_method: "كاش",
        contract_number: "",
        notes: "",
        operation_date: new Date().toISOString().split('T')[0]
      });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleEditClick = (operation) => {
    setEditingOperation(operation);
    setEditForm({
      unit_id: operation.unit_id || "",
      customer_name: operation.customer_name || "",
      customer_phone: operation.customer_phone || "",
      operation_type: operation.operation_type || "حجز",
      amount: operation.amount || "",
      payment_method: operation.payment_method || "كاش",
      contract_number: operation.contract_number || "",
      notes: operation.notes || "",
      operation_date: operation.operation_date || new Date().toISOString().split('T')[0]
    });
    setShowEdit(true);
  };

  const handleDeleteClick = (operation) => {
    setDeletingOperation(operation);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOperation) return;

    try {
      await api.delete(`/operations/delete.php?id=${deletingOperation.id}`);
      setShowDelete(false);
      setDeletingOperation(null);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const getOperationTypeColor = (type) => {
    switch (type) {
      case "بيع": return "bg-green-100 text-green-800";
      case "حجز": return "bg-blue-100 text-blue-800";
      default: return "bg-neutral-100 text-neutral-600";
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case "كاش": return "bg-green-100 text-green-800";
      case "تمويل": return "bg-blue-100 text-blue-800";
      case "بطاقة": return "bg-purple-100 text-purple-800";
      default: return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">العمليات</h2>
          <p className="text-neutral-500 mt-1">حجوزات ومبيعات الوحدات</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAdd(true)} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة عملية
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
              <p className="text-sm text-neutral-500">إجمالي العمليات</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{list.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">عمليات البيع</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {list.filter(op => op.operation_type === "بيع").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">عمليات الحجز</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {list.filter(op => op.operation_type === "حجز").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {new Intl.NumberFormat().format(
                  list.reduce((sum, op) => sum + (parseFloat(op.amount) || 0), 0)
                )} ج.م
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="text-neutral-500 mt-2">جارٍ تحميل العمليات...</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { 
                key: "unit", 
                label: "الوحدة", 
                render: (r) => r.unit_number ?? r.unit?.unit_number ?? r.unit_id ?? "-" 
              },
              { key: "customer_name", label: "العميل" },
              { 
                key: "operation_type", 
                label: "نوع العملية",
                render: (r) => (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getOperationTypeColor(r.operation_type)}`}>
                    {r.operation_type}
                  </span>
                )
              },
              { 
                key: "amount", 
                label: "المبلغ", 
                render: (r) => new Intl.NumberFormat().format(r.amount) + " ج.م" 
              },
              { 
                key: "payment_method", 
                label: "طريقة الدفع",
                render: (r) => (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(r.payment_method)}`}>
                    {r.payment_method}
                  </span>
                )
              },
              { 
                key: "operation_date", 
                label: "التاريخ",
                render: (r) => new Date(r.operation_date).toLocaleDateString('ar-EG')
              },
              {
                key: "actions", 
                label: "إجراءات", 
                render: (r) => (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleEditClick(r)}
                    >
                      تعديل
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDeleteClick(r)}
                    >
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

      {/* Add Operation Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} width="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">إضافة عملية جديدة</h3>
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
                label="رقم الوحدة" 
                name="unit_id" 
                value={form.unit_id} 
                onChange={handleChange}
                required
              />
              <Input 
                label="اسم العميل" 
                name="customer_name" 
                value={form.customer_name} 
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="هاتف العميل" 
                name="customer_phone" 
                value={form.customer_phone} 
                onChange={handleChange}
              />
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">نوع العملية</div>
                <select 
                  name="operation_type" 
                  value={form.operation_type} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="حجز">حجز</option>
                  <option value="بيع">بيع</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="المبلغ (ج.م)" 
                name="amount" 
                value={form.amount} 
                onChange={handleChange}
                type="number"
                required
              />
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">طريقة الدفع</div>
                <select 
                  name="payment_method" 
                  value={form.payment_method} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="كاش">كاش</option>
                  <option value="تمويل">تمويل</option>
                  <option value="بطاقة">بطاقة ائتمان</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="رقم العقد" 
                name="contract_number" 
                value={form.contract_number} 
                onChange={handleChange}
                placeholder="اختياري"
              />
              <Input 
                label="تاريخ العملية" 
                name="operation_date" 
                type="date"
                value={form.operation_date} 
                onChange={handleChange}
              />
            </div>

            <label className="block">
              <div className="text-sm font-medium text-neutral-700 mb-2">ملاحظات</div>
              <textarea 
                name="notes" 
                value={form.notes} 
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="ملاحظات إضافية حول العملية..."
              />
            </label>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="secondary" 
                onClick={() => setShowAdd(false)} 
                type="button"
              >
                إلغاء
              </Button>
              <Button type="submit">
                حفظ العملية
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Operation Modal */}
      {showEdit && editingOperation && (
        <Modal onClose={() => setShowEdit(false)} width="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">تعديل العملية #{editingOperation.id}</h3>
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
                label="رقم الوحدة" 
                name="unit_id" 
                value={editForm.unit_id} 
                onChange={handleEditChange}
                required
              />
              <Input 
                label="اسم العميل" 
                name="customer_name" 
                value={editForm.customer_name} 
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="هاتف العميل" 
                name="customer_phone" 
                value={editForm.customer_phone} 
                onChange={handleEditChange}
              />
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">نوع العملية</div>
                <select 
                  name="operation_type" 
                  value={editForm.operation_type} 
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="حجز">حجز</option>
                  <option value="بيع">بيع</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="المبلغ (ج.م)" 
                name="amount" 
                value={editForm.amount} 
                onChange={handleEditChange}
                type="number"
                required
              />
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">طريقة الدفع</div>
                <select 
                  name="payment_method" 
                  value={editForm.payment_method} 
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="كاش">كاش</option>
                  <option value="تمويل">تمويل</option>
                  <option value="بطاقة">بطاقة ائتمان</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="رقم العقد" 
                name="contract_number" 
                value={editForm.contract_number} 
                onChange={handleEditChange}
                placeholder="اختياري"
              />
              <Input 
                label="تاريخ العملية" 
                name="operation_date" 
                type="date"
                value={editForm.operation_date} 
                onChange={handleEditChange}
              />
            </div>

            <label className="block">
              <div className="text-sm font-medium text-neutral-700 mb-2">ملاحظات</div>
              <textarea 
                name="notes" 
                value={editForm.notes} 
                onChange={handleEditChange}
                rows="3"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="ملاحظات إضافية حول العملية..."
              />
            </label>

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
      {showDelete && deletingOperation && (
        <Modal onClose={() => setShowDelete(false)} width="max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-2">حذف العملية</h3>
            <p className="text-neutral-600 mb-6">
              هل أنت متأكد من أنك تريد حذف العملية الخاصة بالعميل <strong>{deletingOperation.customer_name}</strong>؟ 
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
                onClick={handleDeleteConfirm}
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