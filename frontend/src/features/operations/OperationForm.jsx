import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addOperation } from "./operationsSlice";

export default function OperationForm({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    unit_id: "",
    customer_name: "",
    customer_phone: "",
    operation_type: "booking", // booking | sale
    amount: "",
    payment_method: "cash",
    contract_number: "",
    notes: "",
    add_payment: false,
    payment_amount: "",
    payment_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.unit_id || !form.customer_name) return setError("رقم الوحدة واسم العميل مطلوبان");

    const payload = {
      unit_id: form.unit_id,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      operation_type: form.operation_type === "sale" ? "بيع" : "حجز",
      amount: form.amount,
      payment_method: form.payment_method,
      contract_number: form.contract_number,
      notes: form.notes,
      add_payment: form.add_payment ? 1 : 0,
      payment: form.add_payment ? { amount: form.payment_amount, date: form.payment_date } : null,
    };

    try {
      setLoading(true);
      await dispatch(addOperation(payload)).unwrap();
      onClose();
    } catch (err) {
      setError(err || "فشل إضافة العملية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <form className="relative bg-white rounded shadow w-full max-w-lg p-6 z-10" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-3">إضافة عملية (حجز / بيع)</h3>

        <label className="block mb-2">
          <div className="text-sm">ID الوحدة</div>
          <input name="unit_id" value={form.unit_id} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <label className="block mb-2">
          <div className="text-sm">اسم العميل</div>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <label className="block mb-2">
          <div className="text-sm">هاتف العميل</div>
          <input name="customer_phone" value={form.customer_phone} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-2">
          <label>
            <div className="text-sm">النوع</div>
            <select name="operation_type" value={form.operation_type} onChange={handleChange} className="border p-2 w-full rounded">
              <option value="booking">حجز</option>
              <option value="sale">بيع</option>
            </select>
          </label>

          <label>
            <div className="text-sm">المبلغ</div>
            <input name="amount" value={form.amount} onChange={handleChange} className="border p-2 w-full rounded" />
          </label>
        </div>

        <label className="block mb-2">
          <div className="text-sm">طريقة الدفع</div>
          <select name="payment_method" value={form.payment_method} onChange={handleChange} className="border p-2 w-full rounded">
            <option value="cash">كاش</option>
            <option value="installment">تقسيط</option>
            <option value="bank">تحويل بنكي</option>
          </select>
        </label>

        <label className="block mb-2">
          <div className="text-sm">رقم العقد (اختياري)</div>
          <input name="contract_number" value={form.contract_number} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <label className="flex items-center gap-2 mb-2">
          <input type="checkbox" name="add_payment" checked={form.add_payment} onChange={handleChange} />
          <span className="text-sm">إضافة دفعة الآن</span>
        </label>

        {form.add_payment && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <label>
              <div className="text-sm">مبلغ الدفعة</div>
              <input name="payment_amount" value={form.payment_amount} onChange={handleChange} className="border p-2 w-full rounded" />
            </label>
            <label>
              <div className="text-sm">تاريخ الدفعة</div>
              <input type="date" name="payment_date" value={form.payment_date} onChange={handleChange} className="border p-2 w-full rounded" />
            </label>
          </div>
        )}

        <label className="block mb-3">
          <div className="text-sm">ملاحظات</div>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">إلغاء</button>
          <button type="submit" disabled={loading} className="px-4 py-1 bg-blue-600  rounded">{loading ? "جاري الحفظ..." : "حفظ"}</button>
        </div>
      </form>
    </div>
  );
}
