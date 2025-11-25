import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateOperation } from "./operationsSlice";

export default function UpdateOperationForm({ operation, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    id: operation.id,
    status: operation.status || "",
    amount: operation.amount || "",
    notes: operation.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await dispatch(updateOperation(form)).unwrap();
      onClose();
    } catch (err) {
      setError(err || "فشل التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <form className="relative bg-white rounded shadow w-full max-w-md p-6 z-10" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-3">تعديل العملية #{operation.id}</h3>

        <label className="block mb-3">
          <div className="text-sm">الحالة</div>
          <select name="status" value={form.status} onChange={handleChange} className="border p-2 w-full rounded">
            <option value="pending">معلقة</option>
            <option value="confirmed">مؤكدة</option>
            <option value="cancelled">ملغاة</option>
            <option value="completed">مكتملة</option>
          </select>
        </label>

        <label className="block mb-3">
          <div className="text-sm">المبلغ</div>
          <input name="amount" value={form.amount} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <label className="block mb-3">
          <div className="text-sm">ملاحظات</div>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">إلغاء</button>
          <button type="submit" disabled={loading} className="px-4 py-1 bg-yellow-400  rounded">{loading ? "جاري..." : "حفظ"}</button>
        </div>
      </form>
    </div>
  );
}
