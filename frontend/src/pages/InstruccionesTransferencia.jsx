import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, Printer, Home, Search } from "lucide-react";

const InstruccionesTransferencia = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log("🚀 state recibido:", state);
    if (!state || !state.clabe || !state.concepto) navigate("/");
  }, [state, navigate]);

  return (
    <div className="min-h-screen p-6 text-white flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-2xl shadow-xl space-y-6">
        <h2 className="text-3xl font-extrabold text-yellow-400 text-center drop-shadow">
          Instrucciones de Transferencia
        </h2>

        <p className="text-white/80 text-center">
          Hola <strong>{state.nombre}</strong>, has apartado{" "}
          <strong>{state.boletos.length}</strong> boletos para la rifa{" "}
          <strong>{state.rifa}</strong>. Para completar tu participación, realiza una transferencia con los siguientes datos:
        </p>

        <div className="bg-black/40 rounded-lg p-5 border border-white/20 space-y-2 text-lg">
          <p>
            <span className="font-bold text-yellow-300">🏦 Banco:</span>{" "}
            {state.banco}
          </p>
          <p>
            <span className="font-bold text-yellow-300">🔢 CLABE:</span>{" "}
            <span className="font-mono tracking-wide">{state.clabe}</span>
          </p>
          <p>
            <span className="font-bold text-yellow-300">📝 Concepto:</span>{" "}
            <span className="text-orange-300 font-semibold">
              {state.concepto}
            </span>
          </p>
          <p>
            <span className="font-bold text-yellow-300">💵 Monto:</span> ${state.monto}
          </p>
          <p>
            <span className="font-bold text-yellow-300">📅 Expira el:</span>{" "}
            <span className="text-orange-300 font-semibold">
            {state.expira_pago
              ? new Date(state.expira_pago * 1000).toLocaleString("es-MX")
              : "Fecha no disponible"}
            </span>
          </p>
        </div>

        <p className="text-white/70 text-sm pt-4 border-t border-white/10 text-center">
          Es muy importante que uses el concepto tal como se muestra para identificar correctamente tu pago.
          Después de transferir, puedes verificar el estado aquí mismo o esperar la confirmación por SMS.
        </p>

        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded transition"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </button>
          <button
            onClick={() =>
              navigate(`/verificador?folio=${state.folio || ""}`)
            }
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded transition"
          >
            <Search className="w-5 h-5" />
            Verificar mi compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstruccionesTransferencia;
