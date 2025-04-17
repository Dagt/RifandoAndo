import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Search, CheckCircle, XCircle, Hourglass, Mail, Phone,
  User, Receipt, Ticket, ShieldCheck, Calendar, Gift
} from "lucide-react";

const Verificador = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const folioInicial = queryParams.get("folio");

  const [folio, setFolio] = useState(folioInicial || "");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const buscarTransaccion = async () => {
    setResultado(null);
    setError(null);
    try {
      const res = await fetch(`https://rifandoando.club/api/verificar/${folio}/`);
      if (!res.ok) throw new Error("No encontrado");
      const data = await res.json();
      setResultado(data);
    } catch (err) {
      setError("No se encontró ninguna transacción con ese folio.");
    }
  };

  useEffect(() => {
    if (folioInicial) buscarTransaccion();
  }, [folioInicial]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "completado": return "text-green-400";
      case "pendiente": return "text-yellow-400";
      case "cancelado": return "text-red-400";
      default: return "text-white";
    }
  };

  const getEstadoIcono = (estado) => {
    switch (estado) {
      case "completado": return <CheckCircle className="w-6 h-6 mr-2 text-green-400" />;
      case "pendiente": return <Hourglass className="w-6 h-6 mr-2 text-yellow-400" />;
      case "cancelado": return <XCircle className="w-6 h-6 mr-2 text-red-400" />;
      default: return null;
    }
  };

  const formatearNumero = (n) => {
    if (!resultado || !resultado.total_boletos) return String(n);
    const digitos = Math.max(3, String(resultado.total_boletos - 1).length);
    return String(n).padStart(digitos, "0");
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-6 text-white">
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl w-full max-w-3xl">
        <h2 className="text-3xl font-extrabold text-center text-yellow-400 mb-2">
          Verificador de Transacciones
        </h2>
        <p className="text-sm text-center text-white/70 mb-6">
          Ingresa tu <strong>folio</strong> para ver el estado de tu compra, método de pago, boletos y más detalles.
        </p>

        <div className="flex gap-2 mb-6 justify-center">
          <input
            type="text"
            placeholder="Ej. 20250414-12345f"
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
            className="flex-1 max-w-[400px] p-2 rounded bg-white/20 border border-white/30 text-white focus:outline-none"
          />
          <button
            onClick={buscarTransaccion}
            className="bg-orange-400 hover:bg-orange-500 text-indigo-900 font-bold px-4 py-2 rounded transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-red-400 text-center">{error}</p>}

        {resultado && (
          <div className="space-y-4 text-sm bg-white/5 p-6 rounded-xl shadow-inner">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-lg border border-white/20 shadow-md bg-white/10">
                {getEstadoIcono(resultado.estado)}
                <span className={`uppercase ${getEstadoColor(resultado.estado)} text-xl`}>
                  {resultado.estado}
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <p className="flex items-center gap-2"><User className="w-4 h-4 text-orange-300" /><span className="font-bold">Nombre:</span> {resultado.nombre}</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-300" /><span className="font-bold">Correo:</span> {resultado.correo}</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-pink-300" /><span className="font-bold">Teléfono:</span> {resultado.telefono}</p>
              <p className="flex items-center gap-2"><Receipt className="w-4 h-4 text-green-300" /><span className="font-bold">Método:</span> {resultado.metodo_pago}</p>
              <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-white/80" /><span className="font-bold">Fecha:</span> {new Date(resultado.fecha).toLocaleString()}</p>
              <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-white/80" /><span className="font-bold">Total:</span> ${resultado.monto}</p>
              <p className="flex items-center gap-2"><Gift className="w-4 h-4 text-yellow-300" /><span className="font-bold">Rifa:</span> {resultado.rifa}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Ticket className="text-yellow-300 w-4 h-4" />
                <span className="font-bold">Boletos:</span>
              </div>
              <p className="text-sm text-white/90 border border-white/10 rounded p-3 bg-white/5">
                {resultado.boletos.map((n) => formatearNumero(n)).join(", ")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verificador;
