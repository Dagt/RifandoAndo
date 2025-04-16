// src/pages/FalloPago.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, Home } from "lucide-react";

const FalloPago = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center text-white p-6 text-center space-y-6">
      <XCircle className="w-16 h-16 text-red-400" />
      <h2 className="text-3xl font-bold text-red-300">¡Pago no completado!</h2>
      <p className="text-white/80">
        Parece que algo salió mal con tu pago. Puedes intentar nuevamente o
        elegir otro método.
      </p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 mt-4 px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20"
      >
        <Home className="w-5 h-5" />
        Ir al inicio
      </button>
    </div>
  );
};

export default FalloPago;
