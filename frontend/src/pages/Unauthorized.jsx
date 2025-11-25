// src/pages/Unauthorized.jsx
import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card border border-neutral-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">غير مصرح بالوصول</h1>
        <p className="text-neutral-600 mb-6">
          ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.
          هذه الصفحة متاحة فقط لمشرفي النظام.
        </p>
        
        <div className="space-y-3">
          <Link to="/" className="block">
            <Button className="w-full">
              العودة للرئيسية
            </Button>
          </Link>
          <Link to="/projects" className="block">
            <Button variant="secondary" className="w-full">
              الذهاب للمشاريع
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}