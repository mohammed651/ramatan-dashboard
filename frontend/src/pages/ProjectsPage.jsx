import React, { useEffect, useState } from "react";
import api from "../api/api";
import DataTable from "../components/ui/DataTable";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { fetchProjects } from "../features/projects/projectsSlice";
import { useDispatch } from "react-redux";

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const [list, setList] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    location: "", 
    status: "قيد الإنشاء", 
    amenities: "", 
    description: "" 
  });
  const [editForm, setEditForm] = useState({ 
    name: "", 
    location: "", 
    status: "قيد الإنشاء", 
    amenities: "", 
    description: "" 
  });
  const [error, setError] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get("/projects/index.php");
      const payload = res.data;
      
      console.log("Projects API Response:", payload);
      
      if (payload && typeof payload === 'object') {
        if (Array.isArray(payload)) {
          setList(payload);
          setStatistics(null);
        } else {
          setList(payload.data || []);
          setStatistics(payload.statistics || null);
        }
      } else {
        setList([]);
        setStatistics(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const handleEditChange = (e) => setEditForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.post("/projects/add.php", form);
      setShowAdd(false);
      setForm({ name: "", location: "", status: "قيد الإنشاء", amenities: "", description: "" });
      await load();
      dispatch(fetchProjects());
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await api.put(`/projects/update.php?id=${editingProject.id}`, editForm);
      setShowEdit(false);
      setEditingProject(null);
      setEditForm({ name: "", location: "", status: "قيد الإنشاء", amenities: "", description: "" });
      await load();
      dispatch(fetchProjects());
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setEditForm({
      name: project.name || "",
      location: project.location || "",
      status: project.status || "قيد الإنشاء",
      amenities: project.amenities || "",
      description: project.description || ""
    });
    setShowEdit(true);
  };

  const handleDeleteClick = (project) => {
    setDeletingProject(project);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;

    try {
      await api.delete(`/projects/delete.php?id=${deletingProject.id}`);
      setShowDelete(false);
      setDeletingProject(null);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const formatPercentage = (value) => {
    if (!value || value === "null") return "0%";
    return parseFloat(value).toFixed(1) + '%';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'تم التسليم':
        return 'bg-green-100 text-success';
      case 'قيد الإنشاء':
        return 'bg-yellow-100 text-warning';
      case 'قريباً':
        return 'bg-blue-100 text-primary-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'تم التسليم': 'تم التسليم',
      'قيد الإنشاء': 'قيد الإنشاء',
      'قريباً': 'قريباً',
      '': 'غير محدد'
    };
    return statusMap[status] || status || 'غير محدد';
  };

  const calculatedStats = {
    total_projects: list.length,
    total_units: list.reduce((sum, project) => sum + (parseInt(project.total_units) || 0), 0),
    total_sold_units: list.reduce((sum, project) => sum + (parseInt(project.sold_units) || 0), 0),
    total_available_units: list.reduce((sum, project) => sum + (parseInt(project.available_units) || 0), 0),
    overall_sold_percentage: list.length > 0 ? 
      (list.reduce((sum, project) => sum + (parseInt(project.sold_units) || 0), 0) / 
       list.reduce((sum, project) => sum + (parseInt(project.total_units) || 0), 1) * 100) : 0,
    overall_available_percentage: list.length > 0 ? 
      (list.reduce((sum, project) => sum + (parseInt(project.available_units) || 0), 0) / 
       list.reduce((sum, project) => sum + (parseInt(project.total_units) || 0), 1) * 100) : 0
  };

  const displayStats = statistics || calculatedStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">المشاريع</h2>
          <p className="text-neutral-500 mt-1">إدارة المشاريع وإحصاءاتها</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAdd(true)} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة مشروع
          </Button>
          <Button variant="secondary" onClick={load} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* إجمالي المشاريع */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">إجمالي المشاريع</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {displayStats.total_projects}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* إجمالي الوحدات */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">إجمالي الوحدات</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {displayStats.total_units}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* الوحدات المباعة */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">الوحدات المباعة</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {displayStats.total_sold_units}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {formatPercentage(displayStats.overall_sold_percentage)} من الإجمالي
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* الوحدات المتاحة */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">الوحدات المتاحة</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {displayStats.total_available_units}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {formatPercentage(displayStats.overall_available_percentage)} من الإجمالي
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
            <p className="text-neutral-500 mt-2">جارٍ تحميل المشاريع...</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "اسم المشروع" },
              { key: "location", label: "الموقع" },
              { 
                key: "status", 
                label: "الحالة",
                render: (r) => (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                    {getStatusText(r.status)}
                  </span>
                )
              },
              { 
                key: "total_units", 
                label: "إجمالي الوحدات",
                render: (r) => (
                  <div className="text-center font-medium">{r.total_units || 0}</div>
                )
              },
              { 
                key: "sold_units", 
                label: "الوحدات المباعة",
                render: (r) => (
                  <div className="text-center">
                    <div className="font-medium text-green-600">{r.sold_units || 0}</div>
                    <div className="text-xs text-neutral-500">{formatPercentage(r.sold_percentage)}</div>
                  </div>
                )
              },
              { 
                key: "available_units", 
                label: "الوحدات المتاحة",
                render: (r) => (
                  <div className="text-center">
                    <div className="font-medium text-blue-600">{r.available_units || 0}</div>
                    <div className="text-xs text-neutral-500">{formatPercentage(r.available_percentage)}</div>
                  </div>
                )
              },
             
              { 
                key: "created_at", 
                label: "تاريخ الإنشاء",
                render: (r) => new Date(r.created_at).toLocaleDateString('ar-EG')
              },
              {
                key: "actions",
                label: "إجراءات",
                render: (r) => (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleEditClick(r)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تعديل
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDeleteClick(r)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      حذف
                    </Button>
                  </div>
                )
              }
            ]}
            data={list}
          />
        )}
      </div>

      {/* Add Project Modal */}
      {showAdd && (
        <Modal 
          onClose={() => setShowAdd(false)} 
          width="max-w-2xl"
          title="إضافة مشروع جديد"
        >
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="اسم المشروع" 
                name="name" 
                value={form.name} 
                onChange={handleChange}
                required
              />
              <Input 
                label="الموقع" 
                name="location" 
                value={form.location} 
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">الحالة</div>
                <select 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="قيد الإنشاء">قيد الإنشاء</option>
                  <option value="تم التسليم">تم التسليم</option>
                  <option value="قريباً">قريباً</option>
                </select>
              </label>
              
              <Input 
                label="المميزات (مفصولة بفاصلة)" 
                name="amenities" 
                value={form.amenities} 
                onChange={handleChange}
                placeholder="ساونا, جيم, مسبح"
              />
            </div>

            <label className="block">
              <div className="text-sm font-medium text-neutral-700 mb-2">الوصف</div>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="وصف المشروع..."
              />
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-danger">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="secondary" 
                onClick={() => setShowAdd(false)} 
                type="button"
              >
                إلغاء
              </Button>
              <Button type="submit">
                إضافة المشروع
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Project Modal */}
      {showEdit && editingProject && (
        <Modal 
          onClose={() => {
            setShowEdit(false);
            setEditingProject(null);
          }} 
          width="max-w-2xl"
          title={`تعديل المشروع: ${editingProject.name}`}
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="اسم المشروع" 
                name="name" 
                value={editForm.name} 
                onChange={handleEditChange}
                required
              />
              <Input 
                label="الموقع" 
                name="location" 
                value={editForm.location} 
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-sm font-medium text-neutral-700 mb-2">الحالة</div>
                <select 
                  name="status" 
                  value={editForm.status} 
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="قيد الإنشاء">قيد الإنشاء</option>
                  <option value="تم التسليم">تم التسليم</option>
                  <option value="قريباً">قريباً</option>
                </select>
              </label>
              
              <Input 
                label="المميزات (مفصولة بفاصلة)" 
                name="amenities" 
                value={editForm.amenities} 
                onChange={handleEditChange}
                placeholder="ساونا, جيم, مسبح"
              />
            </div>

            <label className="block">
              <div className="text-sm font-medium text-neutral-700 mb-2">الوصف</div>
              <textarea 
                name="description" 
                value={editForm.description} 
                onChange={handleEditChange}
                rows="4"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="وصف المشروع..."
              />
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-danger">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowEdit(false);
                  setEditingProject(null);
                }} 
                type="button"
              >
                إلغاء
              </Button>
              <Button type="submit">
                حفظ التعديلات
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && deletingProject && (
        <Modal onClose={() => setShowDelete(false)} width="max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-2">حذف المشروع</h3>
            <p className="text-neutral-600 mb-6">
              هل أنت متأكد من أنك تريد حذف المشروع <strong>{deletingProject.name}</strong>؟ 
              <br />هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className="flex justify-center gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowDelete(false)}
              >
                إلغاء
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteConfirm}
              >
                نعم، احذف
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}