import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: any) => void;
  onError: (message?: string) => void;
  studentToEdit?: any | null;
  students?: any[];
  materias?: any[];
}

// Estado inicial con los nombres de campo que espera el backend / la BD
const estadoInicial = {
  nombre: "",
  matricula: "",
  asignatura: "",
  ciclo: "",
  parcial: 1,
  teoria_10: 5,
  laboratorio_40: 5,
  blackboard_50: 5,
  faltas_totales: 0,
  limite_permitido: 8,
};

export function AddStudentModal({
  isOpen,
  onClose,
  onSubmit,
  onError,
  studentToEdit,
  students,
  materias,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState(estadoInicial);
  const esEdicion = Boolean(studentToEdit);

  // Al abrir: si es edición, precargamos los datos del alumno; si no, limpiamos
  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        nombre: studentToEdit.nombre ?? "",
        matricula: studentToEdit.matricula ?? "",
        asignatura: studentToEdit.asignatura ?? "",
        ciclo: studentToEdit.ciclo ?? "",
        parcial: studentToEdit.parcial ?? 1,
        teoria_10: studentToEdit.teoria_10 ?? 5,
        laboratorio_40: studentToEdit.laboratorio_40 ?? 5,
        blackboard_50: studentToEdit.blackboard_50 ?? 5,
        faltas_totales: studentToEdit.faltas_totales ?? 0,
        limite_permitido: studentToEdit.limite_permitido ?? 8,
      });
    } else {
      setFormData(estadoInicial);
    }
  }, [studentToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de calificaciones: 0 a 10 INCLUSIVE (un 0 y un 10 son válidos)
    const calificaciones = [
      formData.teoria_10,
      formData.laboratorio_40,
      formData.blackboard_50,
    ];
    if (calificaciones.some((v) => v < 0 || v > 10)) {
      onError("Las calificaciones deben estar entre 0 y 10.");
      return;
    }

    // Al agregar, evitamos matrículas duplicadas (validación rápida del lado cliente)
    if (
      !esEdicion &&
      students?.some((s) => s.matricula === formData.matricula)
    ) {
      onError("Ya existe un estudiante con esa matrícula.");
      return;
    }

    // Enviamos los campos CRUDOS. El backend calcula promedio_parcial y estatus.
    onSubmit({
      nombre: formData.nombre,
      matricula: formData.matricula,
      asignatura: formData.asignatura,
      ciclo: formData.ciclo,
      parcial: Number(formData.parcial),
      teoria_10: formData.teoria_10,
      laboratorio_40: formData.laboratorio_40,
      blackboard_50: formData.blackboard_50,
      faltas_totales: formData.faltas_totales,
      limite_permitido: formData.limite_permitido,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#2C2C2C]">
            {esEdicion ? "Editar Estudiante" : "Agregar Nuevo Estudiante"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2C2C2C]">
                Información Básica
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Estudiante</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Nombre completo"
                    required
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    value={formData.matricula}
                    onChange={(e) =>
                      setFormData({ ...formData, matricula: e.target.value })
                    }
                    placeholder="UVM2026XX"
                    required
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asignatura">Materia</Label>
                  <select
                    id="asignatura"
                    value={formData.asignatura}
                    onChange={(e) =>
                      setFormData({ ...formData, asignatura: e.target.value })
                    }
                    required
                    className="w-full h-9 px-3 rounded-md bg-[#F9F9F9] border border-[#D0D0D0] text-[#2C2C2C] text-sm"
                  >
                    <option value="">Selecciona una materia</option>
                    {/* Si el alumno (al editar) tiene una materia que ya no está en la lista, la mostramos igual */}
                    {formData.asignatura &&
                      !materias?.some(
                        (m) => m.Nombre_Materia === formData.asignatura,
                      ) && (
                        <option value={formData.asignatura}>
                          {formData.asignatura}
                        </option>
                      )}
                    {materias?.map((m) => (
                      <option key={m.id_materia} value={m.Nombre_Materia}>
                        {m.Nombre_Materia}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciclo">Ciclo</Label>
                  <Input
                    id="ciclo"
                    value={formData.ciclo}
                    onChange={(e) =>
                      setFormData({ ...formData, ciclo: e.target.value })
                    }
                    placeholder="2026-1"
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcial">Parcial</Label>
                  <select
                    id="parcial"
                    value={formData.parcial}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parcial: Number(e.target.value),
                      })
                    }
                    className="w-full h-9 px-3 rounded-md bg-[#F9F9F9] border border-[#D0D0D0] text-[#2C2C2C] text-sm"
                  >
                    <option value={1}>Parcial 1</option>
                    <option value={2}>Parcial 2</option>
                    <option value={3}>Parcial 3</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Evaluación Continua */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2C2C2C]">
                Evaluación Continua
              </h3>
              <p className="text-xs text-[#5A5A5A] -mt-2">
                Cada calificación va de 0 a 10. El porcentaje es solo el peso que
                tiene en el promedio.
              </p>
              <div className="space-y-4 bg-[#F9F9F9] p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="teoria_10">Teoría · peso 10%</Label>
                    <span className="text-sm font-semibold text-[#DC143C]">
                      {formData.teoria_10.toFixed(1)} / 10
                    </span>
                  </div>
                  <Slider
                    id="teoria_10"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[formData.teoria_10]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teoria_10: value[0] })
                    }
                    className="[&_[role=slider]]:bg-[#DC143C] [&_[role=slider]]:border-[#DC143C]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="laboratorio_40">Laboratorio · peso 40%</Label>
                    <span className="text-sm font-semibold text-[#DC143C]">
                      {formData.laboratorio_40.toFixed(1)} / 10
                    </span>
                  </div>
                  <Slider
                    id="laboratorio_40"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[formData.laboratorio_40]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, laboratorio_40: value[0] })
                    }
                    className="[&_[role=slider]]:bg-[#DC143C] [&_[role=slider]]:border-[#DC143C]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="blackboard_50">Blackboard · peso 50%</Label>
                    <span className="text-sm font-semibold text-[#DC143C]">
                      {formData.blackboard_50.toFixed(1)} / 10
                    </span>
                  </div>
                  <Slider
                    id="blackboard_50"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[formData.blackboard_50]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, blackboard_50: value[0] })
                    }
                    className="[&_[role=slider]]:bg-[#DC143C] [&_[role=slider]]:border-[#DC143C]"
                  />
                </div>
              </div>
            </div>

            {/* Asistencias */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2C2C2C]">Asistencias</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faltas_totales">Número de Faltas</Label>
                  <Input
                    id="faltas_totales"
                    type="number"
                    min="0"
                    value={formData.faltas_totales}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        faltas_totales: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limite_permitido">Límite Permitido</Label>
                  <Input
                    id="limite_permitido"
                    type="number"
                    min="0"
                    value={formData.limite_permitido}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        limite_permitido: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#D0D0D0] text-[#2C2C2C] hover:bg-[#F9F9F9]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#DC143C] hover:bg-[#B01030] text-white"
            >
              {esEdicion ? "Guardar Cambios" : "Calcular y Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
