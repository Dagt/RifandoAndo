// src/pages/FalloPago.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, Home } from "lucide-react";

const FalloPago = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center text-white">
      <XCircle className="w-20 h-20 text-red-400 mb-4 animate-pulse" />
      <h1 className="text-4xl font-extrabold text-red-300 mb-2">¡Error en el pago!</h1>
      <p className="text-white/80 max-w-md mb-6">
        Algo salió mal al intentar procesar tu pago. Si fue un error de red o del banco, puedes intentarlo de nuevo más tarde o elegir otro método de pago.
      </p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition"
      >
        <Home className="w-5 h-5" />
        Volver al inicio
      </button>
    </div>
  );
};

export default FalloPago;
