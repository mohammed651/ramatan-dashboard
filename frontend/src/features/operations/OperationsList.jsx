import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOperations,
  deleteOperation,
} from "./operationsSlice";
import OperationForm from "./OperationForm";
import UpdateOperationForm from "./UpdateOperationForm";

export default function OperationsList() {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((s) => s.operations || { list: [], status: "idle", error: null });
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchOperations());
  }, [status, dispatch]);

  const handleDelete = async (id) => {
    if (!confirm(`هل أنت متأكد من حذف العملية #${id}?`)) return;
    try {
      await dispatch(deleteOperation(id)).unwrap();
    } catch (err) {
      alert("فشل حذف العملية: " + (err || ""));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">العمليات</h2>
        <button onClick={() => setShowAdd(true)} className="px-3 py-1 bg-blue-600  rounded">
          إضافة عملية
        </button>
      </div>

      {status === "loading" && <div>جارٍ تحميل العمليات...</div>}
      {status === "failed" && <div className="text-red-600">خطأ: {error}</div>}

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">الوحدة</th>
              <th className="p-3 text-left">العميل</th>
              <th className="p-3 text-left">النوع</th>
              <th className="p-3 text-left">المبلغ</th>
              <th className="p-3 text-left">الحالة</th>
              <th className="p-3 text-left">تاريخ</th>
              <th className="p-3 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list?.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">لا توجد عمليات</td>
              </tr>
            )}

            {list?.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.id}</td>
                <td className="p-3">{o.unit_id ?? o.unit?.unit_number ?? "-"}</td>
                <td className="p-3">{o.customer_name ?? o.customer}</td>
                <td className="p-3">{o.operation_type}</td>
                <td className="p-3">{o.amount}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">{o.operation_date}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(o)} className="px-2 py-1 bg-yellow-400  rounded">تعديل</button>
                    <button onClick={() => handleDelete(o.id)} className="px-2 py-1 bg-red-500  rounded">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <OperationForm onClose={() => setShowAdd(false)} />}
      {editing && <UpdateOperationForm operation={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
