// src/features/auth/LoginPage.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./authSlice";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login(form));

    if (res.meta.requestStatus === "fulfilled") {
      const userRole = res.payload?.user?.role;
      if (userRole === "admin") {
        navigate("/"); // Dashboard للادمن
      } else {
        navigate("/projects"); // صفحة المشاريع لغير الادمن
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      {/* Card: same compact look on mobile & desktop */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-neutral-200 overflow-hidden">
        {/* Branding header */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6 text-center ">
          <h1 className="text-2xl font-bold">Ramatan</h1>
          <p className="text-sm mt-1 opacity-90">نظام إدارة المشاريع العقارية</p>
        </div>

        {/* Form area */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-neutral-900">تسجيل الدخول</h2>
            <p className="text-xs text-neutral-500 mt-1">أدخل بيانات حسابك للمتابعة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                اسم المستخدم
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="أدخل اسم المستخدم"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-150"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                aria-required="true"
                aria-invalid={!!auth.error}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="أدخل كلمة المرور"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-150 pr-12"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute inset-y-0 right-2 flex items-center px-2 rounded-md text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.5-10-8 1-3 4-6 10-6 1.3 0 2.5.2 3.6.6M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {auth.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="flex items-center gap-2 text-red-700 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>{auth.error}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-300 focus:ring-primary-500"
                />
                <span>تذكرني</span>
              </label>

              <a href="#" className="text-sm text-primary-600 hover:underline">نسيت كلمة المرور؟</a>
            </div>

            <div>
              <button
                type="submit"
                disabled={auth.status === "loading"}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700  font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                aria-busy={auth.status === "loading"}
              >
                {auth.status === "loading" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <span>تسجيل الدخول</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-neutral-500">
            © 2025 Ramatan Developments. جميع الحقوق محفوظة.
          </div>
        </div>
      </div>
    </div>
  );
}
