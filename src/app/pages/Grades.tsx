import { useState } from "react";
import { mockMateria, Materia } from "../data/materias";
import { mockStudents, Student } from "../data/students";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export function Grades() {
  // Estado para saber qué materia se seleccionó
  const [materiaSeleccionada, setMateriaSeleccionada] =
    useState<Materia | null>(null);

  // Filtramos los estudiantes que pertenecen a la materia seleccionada
  // Usamos toLowerCase() y quitamos espacios extra para evitar errores tipográficos en los mocks
  const estudiantesFiltrados = materiaSeleccionada
    ? mockStudents.filter((student) =>
        student.subject
          .toLowerCase()
          .includes(
            materiaSeleccionada.Nombre_Materia.toLowerCase().replace(
              "bases",
              "base",
            ),
          ),
      )
    : [];

  return (
    <div className="p-8">
      {/* Header idéntico al de Students */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">
            Calificaciones
          </h1>
          <p className="text-[#5A5A5A]">
            Gestión de calificaciones y evaluaciones por materia
          </p>
        </div>
      </div>

      {/* Renderizado: Vista de Tarjetas de Materias */}
      {!materiaSeleccionada ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMateria.map((materia) => (
            <div
              key={materia.id_materia}
              onClick={() => setMateriaSeleccionada(materia)}
              className="bg-white p-6 rounded-lg border border-[#E0E0E0] shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 border-l-[#DC143C]"
            >
              <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
                {materia.Nombre_Materia}
              </h3>
              <p className="text-sm text-[#5A5A5A]">
                Ver lista de alumnos e ingresar calificaciones →
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* Renderizado: Vista de la Tabla de Estudiantes */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#2C2C2C]">
              Alumnos inscritos en:{" "}
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
                      colSpan={5}
                      className="text-center py-8 text-[#5A5A5A]"
                    >
                      No hay estudiantes registrados en esta materia.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
