import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateUnit, fetchUnits } from "./unitsSlice";

export default function UpdateUnitForm({ unit, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    id: unit.id,
    project_id: unit.project_id,
    unit_number: unit.unit_number,
    area: unit.area,
    price: unit.price,
    status: unit.status,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await dispatch(updateUnit(form)).unwrap();
      dispatch(fetchUnits());
      onClose();
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded shadow w-full max-w-lg p-6 z-10"
      >
        <h3 className="text-lg font-semibold mb-4">تعديل الوحدة</h3>

        <label className="block mb-3">
          <div className="text-sm">ID المشروع</div>
          <input
            name="project_id"
            className="border p-2 rounded w-full"
            value={form.project_id}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block mb-3">
          <div className="text-sm">رقم الوحدة</div>
          <input
            name="unit_number"
            className="border p-2 rounded w-full"
            value={form.unit_number}
            onChange={handleChange}
          />
        </label>

        <label className="block mb-3">
          <div className="text-sm">المساحة</div>
          <input
            name="area"
            className="border p-2 rounded w-full"
            value={form.area}
            onChange={handleChange}
          />
        </label>

        <label className="block mb-3">
          <div className="text-sm">السعر</div>
          <input
            name="price"
            className="border p-2 rounded w-full"
            value={form.price}
            onChange={handleChange}
          />
        </label>

        <label className="block mb-4">
          <div className="text-sm">الحالة</div>
          <select
            name="status"
            className="border p-2 rounded w-full"
            value={form.status}
            onChange={handleChange}
          >
            <option value="available">متاحة</option>
            <option value="sold">مباعة</option>
            <option value="reserved">محجوزة</option>
          </select>
        </label>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
            إلغاء
          </button>
          <button
            type="submit"
            className="px-4 py-1 bg-yellow-400  rounded"
            disabled={loading}
          >
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
