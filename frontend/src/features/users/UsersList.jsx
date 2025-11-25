import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "./usersSlice";
import AddUserModal from "./AddUserModal";
import UpdateUserForm from "./UpdateUserForm";

export default function UsersList() {
  const dispatch = useDispatch();
  const { list = [], status, error } = useSelector((s) => s.users || {});
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchUsers());
  }, [status, dispatch]);

  const handleDelete = async (id) => {
    if (!confirm(`هل تريد حذف/تعطيل المستخدم #${id}؟`)) return;
    try {
      await dispatch(deleteUser(id)).unwrap();
    } catch (err) {
      alert(err || "فشل الحذف");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">المستخدمين</h2>
        <button onClick={() => setShowAdd(true)} className="px-3 py-1 bg-blue-600  rounded">
          إضافة مستخدم
        </button>
      </div>

      {status === "loading" && <div>جارٍ تحميل المستخدمين...</div>}
      {status === "failed" && <div className="text-red-600">خطأ: {error}</div>}

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">الاسم</th>
              <th className="p-3 text-left">البريد</th>
              <th className="p-3 text-left">دور</th>
              <th className="p-3 text-left">عمولة</th>
              <th className="p-3 text-left">الحالة</th>
              <th className="p-3 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">لا توجد مستخدمين</td>
              </tr>
            )}

            {list.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.full_name ?? u.name}</td>
                <td className="p-3">{u.email ?? "-"}</td>
                <td className="p-3">{u.role ?? "-"}</td>
                <td className="p-3">{u.commission_rate ?? "-"}</td>
                <td className="p-3">{u.is_active ? "نشط" : "معطل"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(u)} className="px-2 py-1 bg-yellow-400  rounded">تعديل</button>
                    <button onClick={() => handleDelete(u.id)} className="px-2 py-1 bg-red-500  rounded">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} />}
      {editing && <UpdateUserForm user={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
