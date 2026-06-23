import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Filter } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Student } from "../data/students";
import { AddStudentModal } from "../components/AddStudentModal";
import { ErrorAlert } from "../components/ErrorAlert";

export function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [filtroParcial, setFiltroParcial] = useState<string>("Todos");
  const [materias, setMaterias] = useState<any[]>([]);

  // Helper: obtiene el token o redirige al login si no existe
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  // Helper: si la API responde 401, limpiamos sesión y vamos al login
  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 1. GET para traer los estudiantes reales desde SQL Server
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
        console.error("Error cargando estudiantes:", error);
        setErrorMessage("No se pudieron cargar los estudiantes.");
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();

    // Cargamos las materias para alimentar el menú del modal
    const fetchMaterias = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("/api/materias", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          setMaterias(await response.json());
        }
      } catch (error) {
        console.error("Error cargando materias:", error);
      }
    };
    fetchMaterias();
  }, [navigate]);

  // Filtrado en memoria sobre los datos ya traídos de la BD
  const estudiantesFiltrados =
    filtroParcial === "Todos"
      ? students
      : students.filter(
          (student) => String(student.parcial) === filtroParcial,
        );

  // 2. Guardar: decide entre POST (crear) y PUT (editar) según el contexto
  const handleSaveStudent = async (studentData: Omit<Student, "id">) => {
    const token = getToken();
    if (!token) return;

    const esEdicion = Boolean(editingStudent);
    const url = esEdicion
      ? `/api/estudiantes/${editingStudent.id}`
      : "/api/estudiantes";
    const method = esEdicion ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.message ||
            (esEdicion
              ? "No se pudo actualizar al estudiante"
              : "No se pudo agregar al estudiante"),
        );
      }

      const savedStudent = await response.json();

      if (esEdicion) {
        // Reemplazamos el registro editado en el estado
        setStudents(
          students.map((s) => (s.id === editingStudent.id ? savedStudent : s)),
        );
      } else {
        // Añadimos el nuevo estudiante retornado por la API
        setStudents([...students, savedStudent]);
      }

      handleCloseModal();
    } catch (error: any) {
      console.error("Error al guardar estudiante:", error);
      setErrorMessage(error.message || "No se pudo guardar al estudiante");
      setShowError(true);
    }
  };

  // 3. DELETE para eliminar un estudiante de la BD
  const handleDeleteStudent = async (id: number) => {
    const token = getToken();
    if (!token) return;

    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar a este estudiante?",
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/estudiantes/${id}`, {
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

      if (!response.ok) throw new Error("No se pudo eliminar al estudiante");

      // Quitamos al estudiante del estado solo si la BD confirmó el borrado
      setStudents(students.filter((s) => s.id !== id));
    } catch (error: any) {
      console.error("Error al eliminar estudiante:", error);
      setErrorMessage(error.message || "No se pudo eliminar al estudiante");
      setShowError(true);
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleError = (message?: string) => {
    setErrorMessage(message || "");
    setShowError(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#5A5A5A]">
        Cargando control académico UVM...
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">
            UVM - Dashboard de Control Académico
          </h1>
          <p className="text-[#5A5A5A]">
            Gestión y seguimiento de estudiantes reales desde SQL Server
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Filtro por parcialidad */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-[#E0E0E0] shadow-sm">
            <Filter className="w-4 h-4 text-[#5A5A5A]" />
            <span className="text-sm font-medium text-[#2C2C2C]">
              Parcialidad:
            </span>
            <select
              value={filtroParcial}
              onChange={(e) => setFiltroParcial(e.target.value)}
              className="text-sm bg-transparent border-none outline-none text-[#2C2C2C] cursor-pointer font-semibold"
            >
              <option value="Todos">Todos</option>
              <option value="1">Parcial 1</option>
              <option value="2">Parcial 2</option>
              <option value="3">Parcial 3</option>
            </select>
          </div>

          <Button
            onClick={() => {
              setEditingStudent(null);
              setIsModalOpen(true);
            }}
            className="bg-[#DC143C] hover:bg-[#B01030] text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Estudiante
          </Button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Dinámicas (sobre los datos filtrados) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Total Estudiantes</p>
          <p className="text-2xl font-semibold text-[#2C2C2C]">
            {estudiantesFiltrados.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Regulares</p>
          <p className="text-2xl font-semibold text-[#22C55E]">
            {
              estudiantesFiltrados.filter(
                (s) => s.estatus === "Regular" || s.estatus === "regular",
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Reprobados por Faltas</p>
          <p className="text-2xl font-semibold text-[#DC143C]">
            {
              estudiantesFiltrados.filter(
                (s) =>
                  s.estatus === "Reprobado por Faltas" ||
                  s.estatus === "Inactivo",
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Promedio General</p>
          <p className="text-2xl font-semibold text-[#2C2C2C]">
            {estudiantesFiltrados.length > 0
              ? (
                  estudiantesFiltrados.reduce(
                    (acc, s) => acc + (s.promedio_parcial || 0),
                    0,
                  ) / estudiantesFiltrados.length
                ).toFixed(1)
              : "0.0"}
          </p>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F9F9F9] hover:bg-[#F9F9F9]">
              <TableHead className="text-[#2C2C2C] font-semibold">ID</TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">
                Matrícula
              </TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">
                Nombre del Estudiante
              </TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">
                Materia
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
              <TableHead className="text-[#2C2C2C] font-semibold text-center">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estudiantesFiltrados.length > 0 ? (
              estudiantesFiltrados.map((student) => (
                <TableRow key={student.id} className="hover:bg-[#F9F9F9]">
                  <TableCell className="text-[#2C2C2C]">{student.id}</TableCell>
                  <TableCell className="font-medium text-[#2C2C2C]">
                    {student.matricula}
                  </TableCell>
                  <TableCell className="text-[#2C2C2C]">
                    {student.nombre}
                  </TableCell>
                  <TableCell className="text-[#5A5A5A]">
                    {student.asignatura}
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
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#5A5A5A] hover:text-[#2C2C2C] hover:bg-[#F0F0F0]"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#DC143C] hover:text-[#B01030] hover:bg-[#FDF2F4]"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-[#5A5A5A]"
                >
                  No existen estudiantes registrados en la parcialidad
                  seleccionada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Agregar / Editar */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveStudent}
        onError={handleError}
        studentToEdit={editingStudent}
        students={students}
        materias={materias}
      />

      {showError && (
        <ErrorAlert
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
}
