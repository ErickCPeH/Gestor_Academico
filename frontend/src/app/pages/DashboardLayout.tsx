import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "../components/ui/button";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

const handleLogout = () => {
    localStorage.removeItem("token"); // Borra el token de acceso por seguridad
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/dashboard/students", icon: Users, label: "Estudiantes" },
    { path: "/dashboard/grades", icon: GraduationCap, label: "Calificaciones" },
    { path: "/dashboard/settings", icon: Settings, label: "Configuración" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2C2C2C] text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#404040]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#DC143C] rounded-full flex items-center justify-center">
              <span className="font-semibold">UVM</span>
            </div>
            <div>
              <h2 className="font-semibold">UVM Académica</h2>
              <p className="text-xs text-gray-400">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-[#DC143C] text-white"
                        : "text-gray-300 hover:bg-[#404040] hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#404040]">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-[#404040] hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
