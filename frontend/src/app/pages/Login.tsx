import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import campusImage from "../../imports/image.png";

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: username, password: password }),
      });

      // Si el servidor no devolvió JSON (p. ej. el backend está caído y nginx
      // responde con HTML), damos un mensaje claro en vez del críptico "Unexpected token '<'"
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales inválidas');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', username); // Guardamos el usuario para la página de Información
      navigate("/dashboard");
    } catch (error: any) {
      alert("Error de Autenticación: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src={campusImage} alt="UVM Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#DC143C]/20 to-[#2C2C2C]/40" />
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F5] px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="mb-8 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DC143C] rounded-full mb-4">
                <span className="text-white font-semibold text-xl">UVM</span>
              </div>
            </div>
            <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">UVM Gestión Académica</h1>
            <p className="text-[#5A5A5A]">Sistema de Gestión Académica Universitaria</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-[#E0E0E0]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#2C2C2C]">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#2C2C2C]">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#F9F9F9] border-[#D0D0D0]"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="data-[state=checked]:bg-[#DC143C]"
                  />
                  <Label htmlFor="remember" className="text-sm text-[#5A5A5A] cursor-pointer">Recordarme</Label>
                </div>
              </div>

              <Button type="submit" className="w-full mt-6 bg-[#DC143C] text-white h-11">
                Iniciar Sesión
              </Button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-[#5A5A5A]">© 2026 Universidad del Valle de México</p>
        </div>
      </div>
    </div>
  );
}
