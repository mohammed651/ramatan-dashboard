import React, { useEffect, useState } from "react";
import api from "../api/api";
import KPI from "../components/ui/KPI";
import DataTable from "../components/ui/DataTable";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";

const COLORS = ["#6366f1", "#a855f7", "#f59e0b", "#16a34a", "#ef4444", "#94a3b8"];

const toNum = (v) => {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US').format(value) + " ج.م";
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/dashboard/stats.php");
        const payload = res.data; // نأخذ الـ response كامل
        console.log("Dashboard Full Response:", payload);
        if (!mounted) return;
        setStats(payload);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-neutral-500 mt-4">جارٍ تحميل لوحة التحكم...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-danger" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">خطأ في تحميل البيانات</h3>
      <p className="text-neutral-600">{error}</p>
    </div>
  );
  
  if (!stats) return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-neutral-500">لا توجد بيانات متاحة</p>
    </div>
  );

  // ---------- استخراج كل البيانات من الـ API ----------
  
  // البيانات الأساسية من الـ summary (خارج data)
  const summary = stats?.summary;
  const totalProjects = summary?.total_projects ?? 0;
  const totalUnits = summary?.total_units ?? 0;
  const totalOperations = summary?.total_operations ?? 0;

  // البيانات من الـ data
  const data = stats?.data;
  const activeProjects = data?.active_projects ?? 0;
  const totalMarketValue = toNum(data?.total_market_value ?? 0);
  const totalSales = toNum(data?.total_sales ?? 0);
  const totalCustomers = data?.total_customers ?? 0;

  // إحصائيات الوحدات
  const unitsStats = data?.units_stats ?? [];
  const totalSoldUnits = unitsStats.reduce((sum, u) => u.status === "مباعة" ? sum + toNum(u.count) : sum, 0);
  const totalUnitsValue = unitsStats.reduce((sum, u) => sum + toNum(u.total_value), 0);

  // إحصائيات العمليات
  const operationsStats = data?.operations_stats ?? [];
  const totalOperationsCount = operationsStats.reduce((sum, o) => sum + toNum(o.count), 0);
  const totalOperationsAmount = operationsStats.reduce((sum, o) => sum + toNum(o.total_amount), 0);
  const totalCommission = operationsStats.reduce((sum, o) => sum + toNum(o.total_commission), 0);

  // إحصائيات المبيعات
  const salesStats = data?.sales_stats ?? [];
  const totalSalesAmount = salesStats.reduce((sum, s) => sum + toNum(s.total_sales), 0);
  const totalSalesCommission = salesStats.reduce((sum, s) => sum + toNum(s.total_commission), 0);

  // إحصائيات المشاريع
  const availableUnitsStats = data?.available_units_stats ?? [];
  const projectsWithUnits = availableUnitsStats.filter(p => toNum(p.total_units) > 0);

  // معلومات المستخدم والشركة
  const user = stats?.user;
  const company = stats?.company;

  // ---------- تجهيز البيانات للـ Charts ----------

  // بيانات حالة الوحدات للـ Pie Chart
  const unitsPieData = unitsStats.map((u) => ({
    name: u.status,
    value: toNum(u.count),
    totalValue: toNum(u.total_value)
  }));

  // بيانات العمليات للـ Bar Chart
  const operationsBarData = operationsStats.map((o) => ({
    name: o.operation_type,
    operations: toNum(o.count),
    amount: toNum(o.total_amount),
    commission: toNum(o.total_commission)
  }));

  // بيانات مندوبي المبيعات
  const salesPersonData = salesStats.map((s) => ({
    name: s.sales_person,
    operations: toNum(s.operations_count),
    sales: toNum(s.total_sales),
    commission: toNum(s.total_commission)
  }));

  // بيانات توزيع الوحدات حسب المشروع
  const projectsDistributionData = projectsWithUnits.map((p) => ({
    id: p.id,
    name: p.project_name,
    location: p.location,
    available: toNum(p.available_units),
    sold: toNum(p.sold_units),
    total: toNum(p.total_units),
    soldPercentage: toNum(p.sold_percentage)
  }));

  // بيانات القيمة الإجمالية للوحدات حسب الحالة
  const unitsValueData = unitsStats.map((u) => ({
    name: u.status,
    value: toNum(u.total_value)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">لوحة التحكم</h1>
          <p className="text-neutral-500 mt-1">
            {company || "Ramatan Developments"} - نظرة عامة شاملة على أداء المشاريع والمبيعات
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-neutral-900">
              {user?.username || "مستخدم"}
            </div>
            <div className="text-xs text-neutral-500 capitalize">
              {user?.role === "admin" ? "مدير نظام" : user?.role}
            </div>
          </div>
          <div className="text-sm text-neutral-500">
            آخر تحديث: {new Date().toLocaleDateString('ar-EG', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* الشبكة الرئيسية للإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI 
          title="المشاريع النشطة" 
          value={activeProjects}
          subtitle={`من إجمالي ${totalProjects} مشروع`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        
        <KPI 
          title="إجمالي الوحدات" 
          value={totalUnits}
          subtitle={`${totalSoldUnits} وحدة مباعة`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        
        <KPI 
          title="إجمالي العملاء" 
          value={totalCustomers}
          subtitle="عميل مسجل"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        
        <KPI 
          title="إجمالي المبيعات" 
          value={totalSales}
          format="currency"
          subtitle="جنيه مصري"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
      </div>

      {/* الشبكة الثانية للإحصائيات المالية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI 
          title="القيمة السوقية الإجمالية" 
          value={totalMarketValue}
          format="currency"
          subtitle="قيمة جميع الوحدات"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        
        <KPI 
          title="إجمالي العمليات" 
          value={totalOperations}
          subtitle={`${totalOperationsCount} عملية منفذة`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
        />
        
        <KPI 
          title="إجمالي قيمة العمليات" 
          value={totalOperationsAmount}
          format="currency"
          subtitle="قيمة جميع العمليات"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6m-6 3h6m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <KPI 
          title="إجمالي العمولات" 
          value={totalCommission}
          format="currency"
          subtitle="عمولات مندوبي المبيعات"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* حالة الوحدات */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">توزيع الوحدات حسب الحالة</h3>
            <div className="text-sm text-neutral-500">
              إجمالي: {totalUnits} وحدة
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={unitsPieData} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  labelLine={false}
                >
                  {unitsPieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? value : formatCurrency(value),
                    name === 'value' ? 'عدد الوحدات' : 'القيمة الإجمالية'
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* العمليات حسب النوع */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">العمليات حسب النوع</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span>عدد العمليات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span>القيمة</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operationsBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Intl.NumberFormat().format(value)}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'operations' ? value : formatCurrency(value),
                    name === 'operations' ? 'عدد العمليات' : name === 'amount' ? 'القيمة' : 'العمولة'
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="operations" 
                  fill="#6366f1"
                  name="عدد العمليات"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#16a34a"
                  name="القيمة الإجمالية"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* أداء مندوبي المبيعات */}
      {salesPersonData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">أداء مندوبي المبيعات</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded"></div>
                <span>المبيعات</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded"></div>
                <span>العمولة</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesPersonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#6b7280"
                  fontSize={11}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Intl.NumberFormat().format(value)}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'operations' ? value : formatCurrency(value),
                    name === 'operations' ? 'عدد العمليات' : name === 'sales' ? 'المبيعات' : 'العمولة'
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="sales" 
                  fill="#16a34a" 
                  name="إجمالي المبيعات"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="commission" 
                  fill="#f59e0b" 
                  name="إجمالي العمولة"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* توزيع الوحدات حسب المشروع */}
      {projectsDistributionData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">توزيع الوحدات حسب المشروع</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded"></div>
                <span>متاحة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-danger rounded"></div>
                <span>مباعة</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectsDistributionData} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  stroke="#6b7280"
                  fontSize={11}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'available' ? 'متاحة' : name === 'sold' ? 'مباعة' : 'إجمالي'
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="available" 
                  stackId="a" 
                  fill="#16a34a" 
                  name="متاحة"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="sold" 
                  stackId="a" 
                  fill="#ef4444" 
                  name="مباعة"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* جداول تفصيلية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* جدول إحصائيات الوحدات */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">تفاصيل حالة الوحدات</h3>
          <DataTable
            columns={[
              { key: "name", label: "الحالة" },
              { 
                key: "value", 
                label: "عدد الوحدات",
                render: (r) => <span className="font-medium">{r.value}</span>
              },
              { 
                key: "totalValue", 
                label: "القيمة الإجمالية",
                render: (r) => <span className="font-semibold text-primary-600">{formatCurrency(r.totalValue)}</span>
              }
            ]}
            data={unitsPieData}
          />
        </div>

        {/* جدول إحصائيات العمليات */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">تفاصيل العمليات</h3>
          <DataTable
            columns={[
              { key: "name", label: "نوع العملية" },
              { 
                key: "operations", 
                label: "عدد العمليات",
                render: (r) => <span className="font-medium">{r.operations}</span>
              },
              { 
                key: "amount", 
                label: "القيمة الإجمالية",
                render: (r) => <span className="font-semibold text-success">{formatCurrency(r.amount)}</span>
              },
              { 
                key: "commission", 
                label: "العمولة",
                render: (r) => <span className="font-semibold text-warning">{formatCurrency(r.commission)}</span>
              }
            ]}
            data={operationsBarData}
          />
        </div>
      </div>

      {/* جدول المشاريع المتاحة */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">تفاصيل المشاريع والوحدات</h3>
        <DataTable
          searchable={true}
          exportable={true}
          columns={[
            { key: "name", label: "اسم المشروع" },
            { key: "location", label: "الموقع" },
            { key: "total", label: "إجمالي الوحدات" },
            { 
              key: "sold", 
              label: "الوحدات المباعة",
              render: (r) => (
                <div className="text-center">
                  <div className="font-medium text-red-600">{r.sold}</div>
                  {r.soldPercentage > 0 && (
                    <div className="text-xs text-neutral-500">{r.soldPercentage.toFixed(1)}%</div>
                  )}
                </div>
              )
            },
            { 
              key: "available", 
              label: "الوحدات المتاحة",
              render: (r) => (
                <div className="text-center">
                  <div className="font-medium text-green-600">{r.available}</div>
                  {r.total > 0 && (
                    <div className="text-xs text-neutral-500">{((r.available / r.total) * 100).toFixed(1)}%</div>
                  )}
                </div>
              )
            }
          ]}
          data={projectsDistributionData}
        />
      </div>

      {/* معلومات إضافية */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">ملخص الأداء</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-primary-50 rounded-xl">
            <div className="text-2xl font-bold text-primary-600">{totalUnits}</div>
            <div className="text-sm text-primary-700">إجمالي الوحدات</div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-success">{totalSoldUnits}</div>
            <div className="text-sm text-success">وحدات مباعة</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{totalOperations}</div>
            <div className="text-sm text-blue-700">عملية منفذة</div>
          </div>
        </div>
      </div>
    </div>
  );
}