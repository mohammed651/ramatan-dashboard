import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjects,
  deleteProject,
} from "./projectsSlice";
import AddProjectModal from "./AddProjectModal";
import UpdateProjectForm from "./UpdateProjectForm";

export default function ProjectsList() {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((s) => s.projects || { list: [], status: "idle", error: null });
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null); // project object being edited
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "idle") dispatch(fetchProjects());
  }, [status, dispatch]);

  const handleDelete = async (id) => {
    if (!confirm(`هل أنت متأكد من حذف المشروع (id: ${id})؟`)) return;
    try {
      setDeleting(true);
      await dispatch(deleteProject(id)).unwrap();
      setConfirmDeleteId(null);
    } catch (err) {
      alert("فشل حذف المشروع: " + (err || ""));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">المشاريع</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1 bg-blue-600  rounded"
          >
            إضافة مشروع
          </button>
        </div>
      </div>

      {status === "loading" && <div>جارٍ تحميل المشاريع...</div>}
      {status === "failed" && <div className="text-red-600">خطأ: {error}</div>}

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">الاسم</th>
              <th className="p-3 text-left">الموقع</th>
              <th className="p-3 text-left">الحالة</th>
              <th className="p-3 text-left">الوحدات الكلية</th>
              <th className="p-3 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list && list.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  لا توجد مشاريع
                </td>
              </tr>
            )}
            {list && list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.location ?? "-"}</td>
                <td className="p-3">{p.status ?? "-"}</td>
                <td className="p-3">{p.total_units ?? "-"}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(p)}
                      className="px-2 py-1 bg-yellow-400  rounded"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-2 py-1 bg-red-500  rounded"
                      disabled={deleting}
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} />}
      {editing && (
        <UpdateProjectForm project={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
