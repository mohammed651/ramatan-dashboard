import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnits, deleteUnit } from "./unitsSlice";
import AddUnitModal from "./AddUnitModal";
import UpdateUnitForm from "./UpdateUnitForm";

export default function UnitsList() {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((s) => s.units || {});
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchUnits());
  }, [status, dispatch]);

  const handleDelete = async (id) => {
    if (!confirm(`هل تريد حذف الوحدة رقم ${id} ؟`)) return;
    try {
      await dispatch(deleteUnit(id)).unwrap();
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">قائمة الوحدات</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1 bg-blue-600  rounded"
        >
          إضافة وحدة
        </button>
      </div>

      {status === "loading" && <div>جارٍ تحميل الوحدات...</div>}
      {status === "failed" && <div className="text-red-600">خطأ: {error}</div>}

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">المشروع</th>
              <th className="p-3 text-left">رقم الوحدة</th>
              <th className="p-3 text-left">السعر</th>
              <th className="p-3 text-left">الحالة</th>
              <th className="p-3 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list?.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  لا توجد وحدات
                </td>
              </tr>
            )}

            {list?.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.project_id}</td>
                <td className="p-3">{u.unit_number}</td>
                <td className="p-3">{u.price}</td>
                <td className="p-3">{u.status}</td>

                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(u)}
                      className="px-2 py-1 bg-yellow-400  rounded"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-2 py-1 bg-red-500  rounded"
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

      {showAdd && <AddUnitModal onClose={() => setShowAdd(false)} />}
      {editing && <UpdateUnitForm unit={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
