import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Mail, Shield } from "lucide-react";

export function Information() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Jalamos el nombre de usuario que guardamos en el login
    const storedUser = localStorage.getItem("username") || "usuario_desconocido";
    setUsername(storedUser);
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-[#2C2C2C]">Información de la Cuenta</h1>
      <Card className="max-w-2xl bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#2C2C2C]">Perfil del Usuario</CardTitle>
          <CardDescription>Datos de la sesión activa en el gestor académico.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border border-gray-300">
            <AvatarImage src="" />
            <AvatarFallback className="bg-[#2C2C2C] text-white text-xl font-bold">
              {username ? username.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg text-gray-700">
              <Mail className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{username}</span>
            </div>
            <div className="flex items-center gap-3 text-lg text-gray-700">
              <Shield className="w-5 h-5 text-gray-500" />
              <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                Sesión Activa
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}