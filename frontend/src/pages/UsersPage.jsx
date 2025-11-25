import React, { useEffect, useState } from "react";
import api from "../api/api";
import DataTable from "../components/ui/DataTable";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

export default function UsersPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    role: "sales",
    commission_rate: ""
  });

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/users/index.php");
      const payload = res.data?.data ?? res.data;
      setList(Array.isArray(payload) ? payload : payload.users ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users/add.php", form);
      setShowAdd(false);
      setForm({ username: "", password: "", full_name: "", email: "", phone: "", role: "sales", commission_rate: "" });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-accent-600";
      case "sales": return "bg-blue-100 text-primary-600";
      default: return "bg-neutral-100 text-neutral-600";
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-success" : "bg-red-100 text-danger";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">المستخدمين</h2>
          <p className="text-neutral-500 mt-1">إدارة حسابات فريق المبيعات والمشرفين</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAdd(true)} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة مستخدم
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
              <p className="text-sm text-neutral-500">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">{list.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">المشرفين</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {list.filter(u => u.role === "admin").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">مندوبي المبيعات</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {list.filter(u => u.role === "sales").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">المستخدمين النشطين</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {list.filter(u => u.is_active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <p className="text-neutral-500 mt-2">جارٍ تحميل المستخدمين...</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { 
                key: "full_name", 
                label: "الاسم",
                render: (r) => (
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-neutral-900">{r.full_name}</div>
                      <div className="text-xs text-neutral-500">@{r.username}</div>
                    </div>
                  </div>
                )
              },
              { key: "email", label: "البريد" },
              { 
                key: "role", 
                label: "الدور",
                render: (r) => (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(r.role)}`}>
                    {r.role === 'admin' ? 'مشرف' : 'مندوب مبيعات'}
                  </span>
                )
              },
              { 
                key: "commission_rate", 
                label: "نسبة العمولة",
                render: (r) => r.commission_rate ? `${r.commission_rate}%` : '-'
              },
              { 
                key: "is_active", 
                label: "الحالة", 
                render: (r) => (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(r.is_active)}`}>
                    {r.is_active ? "نشط" : "معطل"}
                  </span>
                )
              },
              {
                key: "actions", 
                label: "إجراءات", 
                render: (r) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">
                      تعديل
                    </Button>
                    <Button 
                      size="sm" 
                      variant={r.is_active ? "danger" : "success"}
                      onClick={async () => {
                        const action = r.is_active ? "تعطيل" : "تفعيل";
                        if (!confirm(`تأكيد ${action} المستخدم؟`)) return;
                        await api.delete(`/users/delete.php?id=${r.id}`);
                        load();
                      }}
                    >
                      {r.is_active ? "تعطيل" : "تفعيل"}
                    </Button>
                  </div>
                )
              }
            ]}
            data={list}
          />
        )}
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} width="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">إضافة مستخدم جديد</h3>
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
                label="اسم المستخدم" 
                name="username" 
                value={form.username} 
                onChange={handleChange}
                required
              />
              <Input 
                label="كلمة المرور" 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange}
                required
              />
            </div>

            <Input 
              label="الاسم الكامل" 
              name="full_name" 
              value={form.full_name} 
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="البريد الإلكتروني" 
                type="email"
                name="email" 
                value={form.email} 
                onChange={handleChange}
              />
              <Input 
                label="رقم الهاتف" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">الدور</div>
                <select 
                  name="role" 
                  value={form.role} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="sales">مندوب مبيعات</option>
                  <option value="admin">مشرف</option>
                </select>
              </label>

              <Input 
                label="نسبة العمولة (%)" 
                name="commission_rate" 
                value={form.commission_rate} 
                onChange={handleChange}
                type="number"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="secondary" 
                onClick={() => setShowAdd(false)} 
                type="button"
              >
                إلغاء
              </Button>
              <Button type="submit">
                إضافة المستخدم
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}