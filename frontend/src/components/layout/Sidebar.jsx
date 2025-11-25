// src/components/layout/Sidebar.jsx
import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

export default function Sidebar({ open = false, setOpen = () => {} }) {
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.role === "admin";
  const location = useLocation();

  // اغلاق الـ drawer على الموبايل لما المسار يتغير (بعد التنقل)
  useEffect(() => {
    if (open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // اغلاق بالـ Escape للـ drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-primary-500 shadow-lg shadow-primary-500/25 "
        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
    }`;

  // المحتوى المشترك بين الـ mobile drawer والـ desktop sidebar
  const SidebarContent = ({ collapsed = false }) => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="font-bold text-lg">R</span>
        </div>

        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <div className="text-xl font-bold text-neutral-900 truncate">Ramatan</div>
            <div className="text-xs text-neutral-500">
              {isAdmin ? "مدير النظام" : "مندوب مبيعات"}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Dashboard - للادمن فقط */}
        {isAdmin && (
          <NavLink to="/" className={linkClass} end>
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            {!collapsed && <span>لوحة التحكم</span>}
          </NavLink>
        )}

        {/* Projects */}
        <NavLink to="/projects" className={linkClass}>
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          {!collapsed && <span>المشاريع</span>}
        </NavLink>

        {/* Units */}
        <NavLink to="/units" className={linkClass}>
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          {!collapsed && <span>الوحدات</span>}
        </NavLink>

        {/* Operations */}
        <NavLink to="/operations" className={linkClass}>
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          {!collapsed && <span>العمليات</span>}
        </NavLink>

        {/* Users - للادمن فقط */}
        {isAdmin && (
          <NavLink to="/users" className={linkClass}>
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            {!collapsed && <span>المستخدمين</span>}
          </NavLink>
        )}
      </nav>

      {/* Footer / Account */}
      <div className="p-4 border-t border-neutral-200">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-50 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center font-semibold text-sm">
            {user?.full_name?.[0] || user?.username?.[0] || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-neutral-900 truncate">{user?.full_name || user?.username}</div>
              <div className="text-xs text-neutral-500 capitalize">{isAdmin ? "مدير النظام" : "مندوب مبيعات"}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile: overlay drawer */}
      <div className={`fixed inset-0 z-40 md:hidden ${open ? "block" : "pointer-events-none"}`} aria-hidden={!open}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />

        {/* Drawer panel */}
        <aside
          className={`relative z-50 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
          role="dialog"
          aria-modal="true"
        >
          <SidebarContent collapsed={false} />
        </aside>
      </div>

      {/* Desktop: collapsible sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-neutral-200 shadow-card transition-all duration-300 ${open ? "w-72" : "w-20"}`}>
        <div className="flex-1 flex flex-col min-h-0">
          <SidebarContent collapsed={!open} />
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};
