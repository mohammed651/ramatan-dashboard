// Topbar.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Topbar({ open, setOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const getRoleText = (role) => {
    const roles = {
      'admin': 'مدير النظام',
      'sales': 'مندوب مبيعات'
    };
    return roles[role] || role;
  };

  return (
    <header className="h-16 bg-white shadow-card border-b border-neutral-200 flex items-center justify-between px-4 md:px-6">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200"
      >
        <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-neutral-900">
            {user?.full_name || user?.username}
          </div>
          <div className="text-xs text-neutral-500">
            {getRoleText(user?.role)}
          </div>
        </div>

        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center font-semibold shadow-lg">
          {user?.full_name?.[0] || user?.username?.[0] || "U"}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
