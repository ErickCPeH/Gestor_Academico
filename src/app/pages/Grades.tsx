import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { mockMateria, Materia } from "../data/materias";
import { mockStudents, Student } from "../data/students";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { AddMateriaModal } from "../components/AddMateriaModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export function Grades() {
  // Inicializa materias desde LocalStorage o usa el mock por defecto
  const [materias, setMaterias] = useState<Materia[]>(() => {
    const localData = localStorage.getItem("uvm_materias");
    return localData ? JSON.parse(localData) : mockMateria;
  });

  // Carga la lista sincrónica de alumnos reales modificada en la otra pestaña
  const [students] = useState<Student[]>(() => {
    const localData = localStorage.getItem("uvm_students");
    return localData ? JSON.parse(localData) : mockStudents;
  });

  const [materiaSeleccionada, setMateriaSeleccionada] =
    useState<Materia | null>(null);
  const [parcialSeleccionado, setParcialSeleccionado] = useState<string | null>(
    null,
  );
  const [isMateriaModalOpen, setIsMateriaModalOpen] = useState(false);

  const parcialidades = ["1", "2", "3"];

  // Guarda materias en LocalStorage cada vez que se agregue una nueva
  useEffect(() => {
    localStorage.setItem("uvm_materias", JSON.stringify(materias));
  }, [materias]);

  // Filtro corregido para que consuma del estado sincrónico de estudiantes del LocalStorage
  const estudiantesFiltrados =
    materiaSeleccionada && parcialSeleccionado
      ? students.filter((student) => {
          const coincideMateria = student.subject
            .toLowerCase()
            .includes(
              materiaSeleccionada.Nombre_Materia.toLowerCase().replace(
                "bases",
                "base",
              ),
            );
          const coincideParcial =
            parcialSeleccionado === "Todas"
              ? true
              : student.parcial === parcialSeleccionado;
          return coincideMateria && coincideParcial;
        })
      : [];

  const handleSaveMateria = (nuevaMateria: Omit<Materia, "id_materia">) => {
    const materiaCompleta: Materia = {
      ...nuevaMateria,
      id_materia:
        materias.length > 0
          ? Math.max(...materias.map((m) => m.id_materia)) + 1
          : 1,
    };
    setMaterias([...materias, materiaCompleta]);
    setIsMateriaModalOpen(false);
  };

  return (
    <div className="p-8">
      {/* Encabezado Principal */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">
            Calificaciones
          </h1>
          <p className="text-[#5A5A5A]">
            Gestión y seguimiento de evaluaciones por materia y parcialidad
          </p>
        </div>

        {!materiaSeleccionada && (
          <Button
            onClick={() => setIsMateriaModalOpen(true)}
            className="bg-[#DC143C] hover:bg-[#B01030] text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Materia
          </Button>
        )}
      </div>

      {/* PASO 1: Grid de Selección de Materias */}
      {!materiaSeleccionada && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map((materia) => (
            <div
              key={materia.id_materia}
              onClick={() => setMateriaSeleccionada(materia)}
              className="bg-white p-6 rounded-lg border border-[#E0E0E0] shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 border-l-[#DC143C]"
            >
              <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
                {materia.Nombre_Materia}
              </h3>
              <p className="text-sm text-[#5A5A5A]">
                Seleccionar materia para elegir parcialidad
              </p>
            </div>
          ))}
        </div>
      )}

      {/* PASO 2: Selección de Parcialidad */}
      {materiaSeleccionada && !parcialSeleccionado && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#2C2C2C]">
              Materia:{" "}
              <span className="text-[#DC143C]">
                {materiaSeleccionada.Nombre_Materia}
              </span>
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

      {/* PASO 3: Tabla de Estudiantes Filtrada */}
      {materiaSeleccionada && parcialSeleccionado && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#2C2C2C]">
                Materia:{" "}
                <span className="text-[#DC143C]">
                  {materiaSeleccionada.Nombre_Materia}
                </span>
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
                        {student.name}
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        <span
                          className={
                            student.absences > 5
                              ? "text-[#DC143C] font-semibold"
                              : ""
                          }
                        >
                          {student.absences}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        {student.parcial}
                      </TableCell>
                      <TableCell className="text-[#2C2C2C]">
                        {student.partialAverage.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            student.status === "Regular"
                              ? "bg-[#22C55E] hover:bg-[#16A34A] text-white"
                              : "bg-[#DC143C] hover:bg-[#B01030] text-white"
                          }
                        >
                          {student.status}
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

      <AddMateriaModal
        isOpen={isMateriaModalOpen}
        onClose={() => setIsMateriaModalOpen(false)}
        onSubmit={handleSaveMateria}
      />
    </div>
  );
}
