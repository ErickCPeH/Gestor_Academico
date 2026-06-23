import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./pages/Login";
import { DashboardLayout } from "./pages/DashboardLayout";
import { Students } from "./pages/Students";
import { Grades } from "./pages/Grades";
import { Information } from "./pages/Information";

/**
 * UVM Gestión Académica - Routing Configuration
 *
 * Rutas:
 * - /login                  - Autenticación
 * - /dashboard              - Estudiantes (vista principal)
 * - /dashboard/students     - Estudiantes
 * - /dashboard/grades       - Materias y Calificaciones
 * - /dashboard/information  - Información de la cuenta
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
        // Antes /dashboard/students mostraba lo mismo que /dashboard.
        // Lo dejamos como redirección para no romper enlaces viejos.
        path: "students",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "grades",
        Component: Grades,
      },
      {
        path: "information",
        Component: Information,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
