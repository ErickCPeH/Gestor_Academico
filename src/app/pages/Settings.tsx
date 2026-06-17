export function Settings() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">
          Configuración
        </h1>
        <p className="text-[#5A5A5A]">
          Ajustes y preferencias del sistema
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#E0E0E0] shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#DC143C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚙️</span>
          </div>
          <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">
            Módulo en Construcción
          </h2>
          <p className="text-[#5A5A5A]">
            Esta sección estará disponible próximamente para configurar
            preferencias del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
