import { useState } from "react";
import { Plus } from "lucide-react";
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
import { mockStudents, Student } from "../data/students";
import { AddStudentModal } from "../components/AddStudentModal";
import { ErrorAlert } from "../components/ErrorAlert";

export function Students() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleAddStudent = (newStudent: Omit<Student, "id">) => {
    const student: Student = {
      ...newStudent,
      id: students.length + 1,
    };
    setStudents([...students, student]);
    setIsModalOpen(false);
  };

  const handleError = () => {
    setShowError(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">
            UVM - Dashboard de Control Académico
          </h1>
          <p className="text-[#5A5A5A]">
            Gestión y seguimiento de estudiantes
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

      {/* Stats Cards */}
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
            {students.filter((s) => s.status === "Regular").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Reprobados por Faltas</p>
          <p className="text-2xl font-semibold text-[#DC143C]">
            {students.filter((s) => s.status === "Reprobado por Faltas").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E0E0E0] shadow-sm">
          <p className="text-sm text-[#5A5A5A] mb-1">Promedio General</p>
          <p className="text-2xl font-semibold text-[#2C2C2C]">
            {(
              students.reduce((acc, s) => acc + s.partialAverage, 0) /
              students.length
            ).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Students Table */}
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
                Promedio Parcial
              </TableHead>
              <TableHead className="text-[#2C2C2C] font-semibold">
                Estatus
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="hover:bg-[#F9F9F9]">
                <TableCell className="text-[#2C2C2C]">{student.id}</TableCell>
                <TableCell className="font-medium text-[#2C2C2C]">
                  {student.matricula}
                </TableCell>
                <TableCell className="text-[#2C2C2C]">{student.name}</TableCell>
                <TableCell className="text-[#5A5A5A]">
                  {student.subject}
                </TableCell>
                <TableCell className="text-[#2C2C2C]">
                  <span
                    className={
                      student.absences > 5 ? "text-[#DC143C] font-semibold" : ""
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStudent}
        onError={handleError}
      />

      {/* Error Alert */}
      {showError && <ErrorAlert onClose={() => setShowError(false)} />}
    </div>
  );
}
