import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./pages/Login";
import { DashboardLayout } from "./pages/DashboardLayout";
import { Students } from "./pages/Students";
import { Grades } from "./pages/Grades";
import { Settings } from "./pages/Settings";

/**
 * UVM Gestión Académica - Routing Configuration
 * 
 * Routes:
 * - /login - Authentication page
 * - /dashboard - Main student management interface
 * - /students - Student list (same as dashboard)
 * - /grades - Grades management (placeholder)
 * - /settings - System settings (placeholder)
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: Students,
      },
      {
        path: "students",
        Component: Students,
      },
      {
        path: "grades",
        Component: Grades,
      },
      {
        path: "settings",
        Component: Settings,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);