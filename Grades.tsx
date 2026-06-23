import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  const [materias, setMaterias] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string | null>(
    null,
  );
  const [parcialSeleccionado, setParcialSeleccionado] = useState<string | null>(
    null,
  );

  // Texto del input para crear una materia nueva
  const [nuevaMateria, setNuevaMateria] = useState("");

  const parcialidades = ["1", "2", "3"];

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

  // Carga inicial: materias (de la tabla) y estudiantes
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const [resMaterias, resStudents] = await Promise.all([
          fetch("/api/materias", { method: "GET", headers }),
          fetch("/api/estudiantes", { method: "GET", headers }),
        ]);

        if (resMaterias.status === 401 || resStudents.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!resMaterias.ok || !resStudents.ok) {
          throw new Error("Error en la respuesta del servidor");
        }

        setMaterias(await resMaterias.json());
        setStudents(await resStudents.json());
      } catch (error) {
        console.error("Error cargando datos:", error);
        setErrorMessage("No se pudieron cargar las materias o los estudiantes.");
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Crear una materia nueva
  const handleAgregarMateria = async () => {
    const nombre = nuevaMateria.trim();
    if (!nombre) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch("/api/materias", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Nombre_Materia: nombre }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "No se pudo crear la materia");
      }

      const creada = await response.json();
      setMaterias((prev) =>
        [...prev, creada].sort((a, b) =>
          a.Nombre_Materia.localeCompare(b.Nombre_Materia),
        ),
      );
      setNuevaMateria("");
    } catch (error: any) {
      setErrorMessage(error.message || "No se pudo crear la materia");
      setShowError(true);
    }
  };

  // Eliminar una materia
  const handleEliminarMateria = async (materia: any) => {
    const confirmar = window.confirm(
      `¿Eliminar la materia "${materia.Nombre_Materia}"?`,
    );
    if (!confirmar) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/materias/${materia.id_materia}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "No se pudo eliminar la materia");
      }

      // La quitamos del estado solo si el backend confirmó el borrado
      setMaterias((prev) =>
        prev.filter((m) => m.id_materia !== materia.id_materia),
      );
    } catch (error: any) {
      setErrorMessage(error.message || "No se pudo eliminar la materia");
      setShowError(true);
    }
  };

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
        Cargando materias y calificaciones...
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Encabezado Principal */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">
          Materias y Calificaciones
        </h1>
        <p className="text-[#5A5A5A]">
          Administra las materias y consulta evaluaciones por parcialidad
        </p>
      </div>

      {/* PASO 1: Crear materia + Grid de Selección de Materias */}
      {!materiaSeleccionada && (
        <div className="space-y-6">
          {/* Barra para agregar una materia nueva */}
          <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm flex items-center gap-3">
            <Input
              value={nuevaMateria}
              onChange={(e) => setNuevaMateria(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAgregarMateria();
                }
              }}
              placeholder="Nombre de la nueva materia"
              className="bg-[#F9F9F9] border-[#D0D0D0] max-w-md"
            />
            <Button
              onClick={handleAgregarMateria}
              className="bg-[#DC143C] hover:bg-[#B01030] text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Materia
            </Button>
          </div>

          {/* Grid de materias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materias.length > 0 ? (
              materias.map((materia) => (
                <div
                  key={materia.id_materia}
                  onClick={() => setMateriaSeleccionada(materia.Nombre_Materia)}
                  className="bg-white p-6 rounded-lg border border-[#E0E0E0] shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 border-l-[#DC143C]"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
                      {materia.Nombre_Materia}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarMateria(materia);
                      }}
                      title="Eliminar materia"
                      className="text-[#DC143C] hover:bg-[#FDF2F4] rounded p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-[#5A5A5A]">
                    Seleccionar materia para elegir parcialidad
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[#5A5A5A]">
                No hay materias todavía. Agrega la primera arriba.
              </p>
            )}
          </div>
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

      {showError && (
        <ErrorAlert
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
}
