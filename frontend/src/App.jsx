// App.jsx (تحديث)
import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./features/auth/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import ProjectsPage from "./pages/ProjectsPage";
import UnitsPage from "./pages/UnitsPage";
import OperationsPage from "./pages/OperationsPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  // حالة السايدبار المركزية
  const [open, setOpen] = useState(false); // default false on mobile

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                {/* Sidebar receives open + setter */}
                <Sidebar open={open} setOpen={setOpen} />

                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Topbar also receives setter to toggle on mobile */}
                  <Topbar open={open} setOpen={setOpen} />

                  <main className="p-6 flex-1">
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <ProtectedRoute adminOnly={true}>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/units" element={<UnitsPage />} />
                      <Route path="/operations" element={<OperationsPage />} />
                      <Route 
                        path="/users" 
                        element={
                          <ProtectedRoute adminOnly={true}>
                            <UsersPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
