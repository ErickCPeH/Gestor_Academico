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
import { Student } from "../data/students";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, "id">) => void;
  onError: () => void;
  studentToEdit?: Student | null;
}

export function AddStudentModal({
  isOpen,
  onClose,
  onSubmit,
  onError,
  studentToEdit,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    matricula: "",
    subject: "",
    cycle: "",
    parcial: "",
    teoria: 5,
    laboratorio: 5,
    blackboard: 5,
    absences: 0,
    allowedLimit: 6,
  });

  useEffect(() => {
    if (studentToEdit && isOpen) {
      setFormData({
        name: studentToEdit.name,
        matricula: studentToEdit.matricula,
        subject: studentToEdit.subject,
        cycle: "",
        parcial: studentToEdit.parcial || "",
        teoria: 5,
        laboratorio: 5,
        blackboard: 5,
        absences: studentToEdit.absences,
        allowedLimit: 6,
      });
    } else if (isOpen && !studentToEdit) {
      handleReset();
    }
  }, [studentToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.teoria < 0 ||
      formData.teoria > 10 ||
      formData.laboratorio < 0 ||
      formData.laboratorio > 10 ||
      formData.blackboard < 0 ||
      formData.blackboard > 10
    ) {
      onError();
      return;
    }

    const partialAverage =
      formData.teoria * 0.1 +
      formData.laboratorio * 0.4 +
      formData.blackboard * 0.5;

    const status =
      formData.absences > formData.allowedLimit
        ? "Reprobado por Faltas"
        : "Regular";

    const student: Omit<Student, "id"> = {
      matricula: formData.matricula,
      name: formData.name,
      subject: formData.subject,
      parcial: formData.parcial,
      absences: formData.absences,
      partialAverage,
      status: status as "Regular" | "Reprobado por Faltas",
    };

    onSubmit(student);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      name: "",
      matricula: "",
      subject: "",
      cycle: "",
      parcial: "",
      teoria: 5,
      laboratorio: 5,
      blackboard: 5,
      absences: 0,
      allowedLimit: 6,
    });
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#2C2C2C]">
            {studentToEdit ? "Editar Estudiante" : "Agregar Nuevo Estudiante"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-[#2C2C2C]">
                Información Básica
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Estudiante</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
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
                    placeholder="2024-XXX"
                    required
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Materia</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Nombre de la materia"
                    required
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cycle">Ciclo</Label>
                  <Input
                    id="cycle"
                    value={formData.cycle}
                    onChange={(e) =>
                      setFormData({ ...formData, cycle: e.target.value })
                    }
                    placeholder="2024-1"
                    required
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcial">Parcial</Label>
                  <Input
                    id="parcial"
                    value={formData.parcial}
                    onChange={(e) =>
                      setFormData({ ...formData, parcial: e.target.value })
                    }
                    placeholder="Inserta Número del Parcial"
                    required
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-[#2C2C2C]">
                Evaluación Continua
              </h3>
              <div className="space-y-4 bg-[#F9F9F9] p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="teoria">Teoría (10%)</Label>
                    <span className="text-sm font-semibold text-[#DC143C]">
                      {formData.teoria.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    id="teoria"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[formData.teoria]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teoria: value[0] })
                    }
                    className="[&_[role=slider]]:bg-[#DC143C] [&_[role=slider]]:border-[#DC143C]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="laboratorio">Laboratorio (40%)</Label>
                    <span className="text-sm font-semibold text-[#DC143C]">
                      {formData.laboratorio.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    id="laboratorio"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[formData.laboratorio]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, laboratorio: value[0] })
                    }
                    className="[&_[role=slider]]:bg-[#DC143C] [&_[role=slider]]:border-[#DC143C]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="blackboard">Blackboard (50%)</Label>
                    <span className="text-sm font-semibold text-[#DC143C]">
                      {formData.blackboard.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    id="blackboard"
                    min={0}
                    max={10}
                    step={0.1}
                    value={[formData.blackboard]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, blackboard: value[0] })
                    }
                    className="[&_[role=slider]]:bg-[#DC143C] [&_[role=slider]]:border-[#DC143C]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-[#2C2C2C]">Asistencias</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="absences">Número de Faltas</Label>
                  <Input
                    id="absences"
                    type="number"
                    min="0"
                    value={formData.absences}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        absences: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedLimit">Límite Permitido</Label>
                  <Input
                    id="allowedLimit"
                    type="number"
                    min="0"
                    value={formData.allowedLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowedLimit: parseInt(e.target.value) || 0,
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
              onClick={handleCancel}
              className="border-[#D0D0D0] text-[#2C2C2C] hover:bg-[#F9F9F9]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#DC143C] hover:bg-[#B01030] text-white"
            >
              {studentToEdit ? "Guardar Cambios" : "Calcular y Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
