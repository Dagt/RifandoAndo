import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "../utils/AuthContext";


const Login = () => {
  const [credenciales, setCredenciales] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("https://rifandoando.club/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credenciales),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.access); // ← actualiza el contexto global
        localStorage.setItem("refresh", data.refresh);
        navigate("/adm-panel");
      } else {
        setError("Credenciales incorrectas");
      }
    } catch {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-extrabold text-center text-orange-400 mb-4 flex items-center justify-center gap-2">
          <Lock className="w-6 h-6" />
          Acceso de Administrador
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Usuario</label>
            <input
              type="text"
              name="username"
              value={credenciales.username}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={credenciales.password}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/50 flex justify-center items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-yellow-300" />
          Solo personal autorizado
        </p>
      </div>
    </div>
  );
};

export default Login;
