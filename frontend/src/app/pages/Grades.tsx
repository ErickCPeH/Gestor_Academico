import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ErrorAlert } from "../components/ErrorAlert";

export function Grades() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);

  // Ahora la "materia" es simplemente el texto de la asignatura
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string | null>(
    null,
  );
  const [parcialSeleccionado, setParcialSeleccionado] = useState<string | null>(
    null,
  );

  const parcialidades = ["1", "2", "3"];

  // Helpers de sesión (mismos que en Students)
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Solo necesitamos los estudiantes; las materias salen de ellos
  useEffect(() => {
    const fetchStudents = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch("/api/estudiantes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error cargando calificaciones:", error);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  // Lista de materias = valores distintos de asignatura (sin repetir, sin vacíos)
  const materias = Array.from(
    new Set(students.map((s) => s.asignatura).filter(Boolean)),
  );

  // Filtro por materia (asignatura exacta) y parcialidad (o todas)
  const estudiantesFiltrados =
    materiaSeleccionada && parcialSeleccionado
      ? students.filter((student) => {
          const coincideMateria = student.asignatura === materiaSeleccionada;
          const coincideParcial =
            parcialSeleccionado === "Todas"
              ? true
              : String(student.parcial) === parcialSeleccionado;
          return coincideMateria && coincideParcial;
        })
      : [];

  if (loading) {
    return (
      <div className="p-8 text-center text-[#5A5A5A]">
        Cargando calificaciones...
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Encabezado Principal */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">
          Calificaciones
        </h1>
        <p className="text-[#5A5A5A]">
          Gestión y seguimiento de evaluaciones por materia y parcialidad
        </p>
      </div>

      {/* PASO 1: Grid de Selección de Materias */}
      {!materiaSeleccionada && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.length > 0 ? (
            materias.map((asignatura) => (
              <div
                key={asignatura}
                onClick={() => setMateriaSeleccionada(asignatura)}
                className="bg-white p-6 rounded-lg border border-[#E0E0E0] shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 border-l-[#DC143C]"
              >
                <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
                  {asignatura}
                </h3>
                <p className="text-sm text-[#5A5A5A]">
                  Seleccionar materia para elegir parcialidad
                </p>
              </div>
            ))
          ) : (
            <p className="text-[#5A5A5A]">
              No hay materias registradas todavía.
            </p>
          )}
        </div>
      )}

      {/* PASO 2: Selección de Parcialidad */}
      {materiaSeleccionada && !parcialSeleccionado && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#2C2C2C]">
              Materia: <span className="text-[#DC143C]">{materiaSeleccionada}</span>
            </h2>
            <button
              onClick={() => setMateriaSeleccionada(null)}
              className="text-sm font-medium text-[#5A5A5A] hover:text-[#2C2C2C] px-4 py-2 border border-[#E0E0E0] rounded-md bg-white transition-colors"
            >
              ← Regresar a Materias
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E0E0E0] shadow-sm">
            <p className="text-base text-[#2C2C2C] font-medium mb-4">
              Selecciona la parcialidad que deseas consultar o evaluar:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {parcialidades.map((parcial) => (
                <button
                  key={parcial}
                  onClick={() => setParcialSeleccionado(parcial)}
                  className="bg-white p-6 text-center border border-[#E0E0E0] rounded-lg shadow-sm hover:border-[#DC143C] hover:bg-[#FDF2F4] text-lg font-semibold text-[#2C2C2C] transition-all"
                >
                  Parcial {parcial}
                </button>
              ))}
              {/* Botón para consultar todas las parcialidades juntas */}
              <button
                onClick={() => setParcialSeleccionado("Todas")}
                className="bg-white p-6 text-center border border-[#E0E0E0] rounded-lg shadow-sm hover:border-[#DC143C] hover:bg-[#FDF2F4] text-lg font-semibold text-[#2C2C2C] transition-all"
              >
                Consultar todas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 3: Tabla de Estudiantes Filtrada por Materia y Parcial */}
      {materiaSeleccionada && parcialSeleccionado && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#2C2C2C]">
                Materia:{" "}
                <span className="text-[#DC143C]">{materiaSeleccionada}</span>
              </h2>
              <p className="text-sm text-[#5A5A5A] mt-1">
                {parcialSeleccionado === "Todas"
                  ? "Mostrando alumnos evaluados en todos los parciales"
                  : `Mostrando alumnos evaluados en el Parcial ${parcialSeleccionado}`}
              </p>
            </div>
            <button
              onClick={() => setParcialSeleccionado(null)}
              className="text-sm font-medium text-[#5A5A5A] hover:text-[#2C2C2C] px-4 py-2 border border-[#E0E0E0] rounded-md bg-white transition-colors"
            >
              ← Regresar a Parciales
            </button>
          </div>

          <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9F9F9] hover:bg-[#F9F9F9]">
                  <TableHead className="text-[#2C2C2C] font-semibold">
                    Matrícula
                  </TableHead>
                  <TableHead className="text-[#2C2C2C] font-semibold">
                    Nombre del Estudiante
                  </TableHead>
                  <TableHead className="text-[#2C2C2C] font-semibold">
                    Faltas
                  </TableHead>
                  <TableHead className="text-[#2C2C2C] font-semibold">
                    Parcial
                  </TableHead>
                  <TableHead className="text-[#2C2C2C] font-semibold">
                    Promedio Parcial
                  </TableHead>
                  <TableHead className="text-[#2C2C2C] font-semibold">
                    Estatus
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estudiantesFiltrados.length > 0 ? (
                  estudiantesFiltrados.map((student) => (
                    <TableRow key={student.id} className="hover:bg-[#F9F9F9]">
                      <TableCell className="font-medium text-[#2C2C2C]">
                        {student.matricula}
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        {student.nombre}
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        <span
                          className={
                            student.faltas_totales > 5
                              ? "text-[#DC143C] font-semibold"
                              : ""
                          }
                        >
                          {student.faltas_totales ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        {student.parcial}
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        {student.promedio_parcial
                          ? Number(student.promedio_parcial).toFixed(1)
                          : "0.0"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            student.estatus === "Regular" ||
                            student.estatus === "regular"
                              ? "bg-[#22C55E] hover:bg-[#16A34A] text-white"
                              : "bg-[#DC143C] hover:bg-[#B01030] text-white"
                          }
                        >
                          {student.estatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-[#5A5A5A]"
                    >
                      No hay estudiantes registrados en la selección actual para
                      esta materia.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {showError && <ErrorAlert onClose={() => setShowError(false)} />}
    </div>
  );
}


