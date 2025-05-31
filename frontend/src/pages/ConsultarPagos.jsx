import React, { useState } from "react";
import {
  BadgeDollarSign,
  CalendarCheck2,
  CalendarClock,
  ClipboardSignature,
  FileText,
  Info,
  Link as LinkIcon,
  ShieldCheck,
  TimerReset,
  XCircle,
  CircleCheck,
  CreditCard
} from "lucide-react";

const ConsultarPagos = () => {
  const [folio, setFolio] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const consultar = async () => {
    if (!folio.trim()) return;
    try {
      const res = await fetch(`/api/consultar_pagos?folio=${folio}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setResultado(data);
        setError("");
      } else {
        setResultado(null);
        setError(data.error || "Error desconocido");
      }
    } catch (err) {
      setResultado(null);
      setError("Error de conexión con el servidor");
    }
  };

  const formatearFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleString("es-MX") : "—";

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-2xl font-bold text-orange-400 mb-4 text-center">
        <ClipboardSignature className="inline-block w-6 h-6 mr-2 text-orange-400" />
        Consultar Transacción por Folio
      </h2>

      <div className="max-w-md mx-auto bg-white/10 border border-white/20 p-4 rounded-xl space-y-4">
        <input
          type="text"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          placeholder="Ingresa el folio de la transacción"
          className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none"
        />
        <button
          onClick={consultar}
          className="bg-indigo-600 hover:bg-indigo-700 w-full p-2 rounded font-bold"
        >
          Buscar
        </button>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {resultado && (
          <div className="bg-white/5 border border-white/20 p-4 rounded mt-4 text-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FileText className="inline-block w-4 h-4 mr-1 text-yellow-300" /> <strong>Folio:</strong>
              <div className="text-white/80">{resultado.folio}</div>
            </div>
            <div>
              <Info className="inline-block w-4 h-4 mr-1 text-blue-300" /> <strong>Estado interno:</strong>
              <div className="text-white/80">{resultado.estado_interno || "—"}</div>
            </div>
            <div>
              <ShieldCheck className="inline-block w-4 h-4 mr-1 text-cyan-300" /> <strong>Estado MP:</strong>
              <div className="text-white/80">{resultado.estado_mp || "—"} ({resultado.detalle_status_mp || "—"})</div>
            </div>
            <div>
              <BadgeDollarSign className="inline-block w-4 h-4 mr-1 text-green-300" /> <strong>Payment ID:</strong>
              <div className="text-white/80">{resultado.payment_id || "—"}</div>
            </div>
            <div>
              <CreditCard className="inline-block w-4 h-4 mr-1 text-violet-300" /> <strong>Tipo de pago:</strong>
              <div className="text-white/80">{resultado.tipo_pago || "—"}</div>
            </div>
            <div>
              <CreditCard className="inline-block w-4 h-4 mr-1 text-indigo-300" /> <strong>Método de pago:</strong>
              <div className="text-white/80">{resultado.metodo_pago || "—"}</div>
            </div>
            <div>
              <ClipboardSignature className="inline-block w-4 h-4 mr-1 text-pink-300" /> <strong>Referencia:</strong>
              <div className="text-white/80">{resultado.referencia || "—"}</div>
            </div>
            <div>
              <CalendarClock className="inline-block w-4 h-4 mr-1 text-yellow-400" /> <strong>Fecha creación:</strong>
              <div className="text-white/80">{formatearFecha(resultado.fecha_creacion)}</div>
            </div>
            <div>
              <CalendarCheck2 className="inline-block w-4 h-4 mr-1 text-green-400" /> <strong>Fecha aprobación:</strong>
              <div className="text-white/80">{formatearFecha(resultado.fecha_aprobacion)}</div>
            </div>
            <div>
              <TimerReset className="inline-block w-4 h-4 mr-1 text-red-300" /> <strong>Fecha expiración:</strong>
              <div className="text-white/80">{formatearFecha(resultado.fecha_expiracion)}</div>
            </div>
            <div>
              <BadgeDollarSign className="inline-block w-4 h-4 mr-1 text-green-400" /> <strong>Monto total:</strong>
              <div className="text-white/80">${resultado.monto_total}</div>
            </div>
            <div>
              <BadgeDollarSign className="inline-block w-4 h-4 mr-1 text-green-200" /> <strong>Neto recibido:</strong>
              <div className="text-white/80">${resultado.neto_recibido}</div>
            </div>
            {resultado.link_ticket && (
              <div className="col-span-full">
                <LinkIcon className="inline-block w-4 h-4 mr-1 text-cyan-400" /> <strong>Ticket URL:</strong>
                <div>
                  <a
                    href={resultado.link_ticket}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline"
                  >
                    Ver ticket
                  </a>
                </div>
              </div>
            )}
            <div>
              <CircleCheck className={`inline-block w-4 h-4 mr-1 ${resultado.acreditado ? "text-green-400" : "text-white/30"}`} /> <strong>Acreditado:</strong>
              <div className="text-white/80">{resultado.acreditado ? "Sí" : "No"}</div>
            </div>
            <div>
              <XCircle className={`inline-block w-4 h-4 mr-1 ${resultado.cancelado ? "text-red-400" : "text-white/30"}`} /> <strong>Cancelado:</strong>
              <div className="text-white/80">{resultado.cancelado ? "Sí" : "No"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultarPagos;
