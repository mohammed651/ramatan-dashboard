import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser, fetchUsers } from "./usersSlice";

export default function AddUserModal({ onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    role: "sales", // sales | admin
    commission_rate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return setError("اسم المستخدم وكلمة المرور مطلوبان");
    try {
      setLoading(true);
      await dispatch(addUser(form)).unwrap();
      dispatch(fetchUsers());
      onClose();
    } catch (err) {
      setError(err || "فشل إضافة المستخدم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <form className="relative bg-white rounded shadow w-full max-w-lg p-6 z-10" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-4">إضافة مستخدم جديد</h3>

        <label className="block mb-2">
          <div className="text-sm">اسم المستخدم</div>
          <input name="username" value={form.username} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <label className="block mb-2">
          <div className="text-sm">كلمة المرور</div>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <label className="block mb-2">
          <div className="text-sm">الاسم الكامل</div>
          <input name="full_name" value={form.full_name} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <label>
            <div className="text-sm">البريد</div>
            <input name="email" value={form.email} onChange={handleChange} className="border p-2 w-full rounded" />
          </label>

          <label>
            <div className="text-sm">التليفون</div>
            <input name="phone" value={form.phone} onChange={handleChange} className="border p-2 w-full rounded" />
          </label>
        </div>

        <label className="block mb-2">
          <div className="text-sm">الدور</div>
          <select name="role" value={form.role} onChange={handleChange} className="border p-2 w-full rounded">
            <option value="sales">مندوب مبيعات</option>
            <option value="admin">مشرف</option>
          </select>
        </label>

        <label className="block mb-4">
          <div className="text-sm">نسبة العمولة (اختياري)</div>
          <input name="commission_rate" value={form.commission_rate} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">إلغاء</button>
          <button type="submit" disabled={loading} className="px-4 py-1 bg-blue-600  rounded">{loading ? "جاري الإضافة..." : "إضافة"}</button>
        </div>
      </form>
    </div>
  );
}
