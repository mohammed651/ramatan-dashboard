import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateProject, fetchProjects } from "./projectsSlice";

export default function UpdateProjectForm({ project, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    id: project.id,
    name: project.name || "",
    location: project.location || "",
    description: project.description || "",
    amenities: project.amenities || "",
    status: project.status || "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("اسم المشروع مطلوب");
    try {
      setLoading(true);
      // updateProject expects an object — API expects PUT body; adjust if API wants form-data
      await dispatch(updateProject(form)).unwrap();
      // refresh
      dispatch(fetchProjects());
      onClose?.();
    } catch (err) {
      setError(err || "فشل تحديث المشروع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <form className="relative bg-white rounded shadow w-full max-w-lg p-6 z-10" onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-4">تعديل المشروع</h3>

        <label className="block mb-2">
          <div className="text-sm">الاسم</div>
          <input name="name" value={form.name} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <label className="block mb-2">
          <div className="text-sm">الموقع</div>
          <input name="location" value={form.location} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <label className="block mb-2">
          <div className="text-sm">الوصف</div>
          <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        <label className="block mb-4">
          <div className="text-sm">المميزات (comma separated)</div>
          <input name="amenities" value={form.amenities} onChange={handleChange} className="border p-2 w-full rounded" />
        </label>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 rounded border">إلغاء</button>
          <button type="submit" disabled={loading} className="px-4 py-1 bg-yellow-400  rounded">
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
