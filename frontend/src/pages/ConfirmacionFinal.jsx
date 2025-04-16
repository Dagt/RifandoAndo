import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Receipt, Clock4, SearchCheck, Ticket, ShieldCheck, CheckCircle, Calendar, User
} from "lucide-react";

const ConfirmacionFinal = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const folio = query.get("folio") || location.state?.folio;

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (folio) {
      fetch(`http://192.168.1.90:8000/api/verificar/${folio}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setDatos(data);
          setCargando(false);
        })
        .catch(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, [folio]);

  const formatear = (n) => {
    if (!datos || !datos.total_boletos) return n;
    const digitos = String(datos.total_boletos - 1).length;
    return String(n).padStart(digitos, "0");
  };

  const formatearFecha = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString("es-MX");
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Cargando detalles de la compra...</p>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>No se pudo cargar la información de la compra.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center text-white">
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl max-w-lg w-full space-y-4">
        <h2 className="text-2xl font-extrabold text-center mb-2 text-green-400 flex items-center justify-center gap-2">
          <CheckCircle className="w-6 h-6" />
          ¡Pago Confirmado!
        </h2>

        <div className="space-y-2 text-sm">
          <p className="text-center text-white/80 font-semibold">
            Rifa: <span className="text-yellow-300">{datos.rifa}</span>
          </p>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-orange-300" />
            Nombre: <span className="font-bold">{datos.nombre}</span>
          </div>

          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-yellow-300" />
            Boletos confirmados: <span className="font-bold">{datos.boletos.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-green-300" />
            Total: <span className="font-bold">${datos.monto}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock4 className="w-4 h-4 text-white/70" />
            Método de pago: <span className="capitalize font-bold">{datos.metodo_pago}</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white/60" />
            Folio de la transacción: <span className="font-mono text-sm">{datos.folio}</span>
          </div>

          {datos.expira_pago && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/60" />
              Expira el: <span>{formatearFecha(datos.expira_pago)}</span>
            </div>
          )}

          <div>
            <p className="text-white/80 font-bold mb-1">Boletos:</p>
            <p className="text-white/90 border border-white/20 bg-white/5 rounded p-3 text-sm">
              {datos.boletos.map((b) => formatear(b)).join(", ")}
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link
            to="/verificador"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full font-semibold transition"
          >
            <SearchCheck className="w-4 h-4" />
            Ir al verificador
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionFinal;
