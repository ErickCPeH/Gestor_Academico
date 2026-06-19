import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  // 1. Petición GET para traer los estudiantes reales desde SQL Server
  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem("token");
      
      // Si el usuario no tiene sesión iniciada, lo pateamos al Login
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("/api/estudiantes", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        // Si el token expiró o es inválido (401), limpiamos y redirigimos
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error cargando estudiantes:", error);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  // 2. Petición POST para guardar un nuevo estudiante en la Base de Datos
  const handleAddStudent = async (newStudent: Omit<Student, "id">) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/estudiantes", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newStudent)
      });

      if (!response.ok) throw new Error("No se pudo agregar al estudiante");

      const savedStudent = await response.json();
      
      // Añadimos el nuevo estudiante retornado por la API al estado de React
      setStudents([...students, savedStudent]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al agregar estudiante:", error);
      setShowError(true);
    }
  };

  const handleError = () => {
    setShowError(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-[#5A5A5A]">Cargando control académico UVM...</div>;
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
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#DC143C] hover:bg-[#B01030] text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Estudiante
        </Button>
      </div>

      {/* Tarjetas de Estadísticas Dinámicas basadas en tu API */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Total Estudiantes</p>
          <p className="text-2xl font-semibold text-[#2C2C2C]">
            {students.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Regulares</p>
          <p className="text-2xl font-semibold text-[#22C55E]">
            {students.filter((s) => s.estatus === "Regular" || s.estatus === "regular").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Reprobados por Faltas</p>
          <p className="text-2xl font-semibold text-[#DC143C]">
            {students.filter((s) => s.estatus === "Reprobado por Faltas" || s.estatus === "Inactivo").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Promedio General</p>
          <p className="text-2xl font-semibold text-[#2C2C2C]">
            {students.length > 0 
              ? (students.reduce((acc, s) => acc + (s.promedio_parcial || 0), 0) / students.length).toFixed(1)
              : "0.0"
            }
          </p>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F9F9F9] hover:bg-[#F9F9F9]">
              <TableHead className="text-[#2C2C2C] font-semibold">ID</TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">Matrícula</TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">Nombre del Estudiante</TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">Materia</TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">Faltas</TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">Promedio Parcial</TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">Estatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="hover:bg-[#F9F9F9]">
                <TableCell className="text-[#2C2C2C]">{student.id}</TableCell>
                <TableCell className="font-medium text-[#2C2C2C]">{student.matricula}</TableCell>
                <TableCell className="text-[#2C2C2C]">{student.nombre}</TableCell>
                <TableCell className="text-[#5A5A5A]">{student.asignatura}</TableCell>
                <TableCell className="text-[#2C2C2C]">
                  <span className={student.asistencias?.faltas_totales > 5 ? "text-[#DC143C] font-semibold" : ""}>
                    {student.asistencias?.faltas_totales ?? 0}
                  </span>
                </TableCell>
                <TableCell className="text-[#2C2C2C]">
                  {student.promedio_parcial ? Number(student.promedio_parcial).toFixed(1) : "0.0"}
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      student.estatus === "Regular" || student.estatus === "regular"
                        ? "bg-[#22C55E] hover:bg-[#16A34A] text-white"
                        : "bg-[#DC143C] hover:bg-[#B01030] text-white"
                    }
                  >
                    {student.estatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modales Complementarios */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStudent}
        onError={handleError}
      />

      {showError && <ErrorAlert onClose={() => setShowError(false)} />}
    </div>
  );
}
