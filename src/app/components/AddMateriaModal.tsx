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
import { Materia } from "../data/materias";

interface AddMateriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (materia: Omit<Materia, "id_materia">) => void;
  materiaToEdit?: Materia | null;
}

export function AddMateriaModal({
  isOpen,
  onClose,
  onSubmit,
  materiaToEdit,
}: AddMateriaModalProps) {
  const [formData, setFormData] = useState({
    Nombre_Materia: "",
  });

  // Efecto para precargar los datos si se está editando una materia
  useEffect(() => {
    if (materiaToEdit && isOpen) {
      setFormData({
        Nombre_Materia: materiaToEdit.Nombre_Materia,
      });
    } else if (isOpen && !materiaToEdit) {
      handleReset();
    }
  }, [materiaToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica para evitar materias vacías
    if (formData.Nombre_Materia.trim() === "") {
      return;
    }

    const materia: Omit<Materia, "id_materia"> = {
      Nombre_Materia: formData.Nombre_Materia.trim(),
    };

    onSubmit(materia);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      Nombre_Materia: "",
    });
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#2C2C2C]">
            {materiaToEdit ? "Editar Materia" : "Agregar Nueva Materia"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="Nombre_Materia">Nombre de la Materia</Label>
                <Input
                  id="Nombre_Materia"
                  value={formData.Nombre_Materia}
                  onChange={(e) =>
                    setFormData({ ...formData, Nombre_Materia: e.target.value })
                  }
                  placeholder="Ej. Programación Orientada a Objetos"
                  required
                  className="bg-[#F9F9F9] border-[#D0D0D0]"
                />
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
              {materiaToEdit ? "Guardar Cambios" : "Guardar Materia"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
