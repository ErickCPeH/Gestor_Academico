import React, { useState } from "react";
import { Save, LayoutDashboard, RefreshCw } from "lucide-react";

export function Settings() {
  // Estado inicial
  const [config, setConfig] = useState({
    modoOscuro: false,
    notificaciones: true,
    cicloEscolar: "2026-1",
    limiteResultados: 25,
  });

  // Función de cambio robusta
  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    console.log("Datos guardados:", config);
    alert("Configuración actualizada con éxito");
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">
          Configuración
        </h1>
        <p className="text-[#5A5A5A]">Ajustes y preferencias del sistema</p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Sección: Interfaz */}
        <section className="bg-white p-6 rounded-lg border border-[#E0E0E0] shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-[#2C2C2C]">
            <LayoutDashboard size={20} className="text-[#DC143C]" />{" "}
            Preferencias de Interfaz
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-[#2C2C2C]">Modo Oscuro</span>
              <input
                type="checkbox"
                checked={config.modoOscuro}
                onChange={(e) => handleChange("modoOscuro", e.target.checked)}
                className="w-10 h-6 cursor-pointer"
              />
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-[#2C2C2C]">Notificaciones</span>
              <input
                type="checkbox"
                checked={config.notificaciones}
                onChange={(e) =>
                  handleChange("notificaciones", e.target.checked)
                }
                className="w-10 h-6 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Sección: Parámetros */}
        <section className="bg-white p-6 rounded-lg border border-[#E0E0E0] shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-[#2C2C2C]">
            <RefreshCw size={20} className="text-[#DC143C]" /> Parámetros del
            Sistema
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                Ciclo Escolar
              </label>
              <select
                value={config.cicloEscolar}
                onChange={(e) => handleChange("cicloEscolar", e.target.value)}
                className="w-full border border-[#E0E0E0] rounded-md p-2"
              >
                <option value="2025-2">2025-2</option>
                <option value="2026-1">2026-1</option>
                <option value="2026-2">2026-2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
                Resultados por página
              </label>
              <input
                type="number"
                value={config.limiteResultados}
                onChange={(e) =>
                  handleChange("limiteResultados", Number(e.target.value))
                }
                className="w-full border border-[#E0E0E0] rounded-md p-2"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-[#DC143C] text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-[#b01030] transition-colors"
          >
            <Save size={18} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
