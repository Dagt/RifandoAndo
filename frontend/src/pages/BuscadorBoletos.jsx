import React, { useEffect, useState } from "react";
import useAuth from "../utils/useAuth";
import {
  User,
  Mail,
  Phone,
  Ticket,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Search,
} from "lucide-react";

const BuscadorBoletos = () => {
  const { token } = useAuth();
  const [numero, setNumero] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timeout = setTimeout(() => setMensaje(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [mensaje]);

  const buscar = async () => {
    if (!numero) {
      setMensaje("Debes ingresar un número de boleto");
      setResultados([]);
      return;
    }

    try {
      const res = await fetch(`/api/buscar-boletos/?numero=${numero}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        if (Array.isArray(data)) {
          setResultados(data);
          setMensaje("");
        } else {
          setMensaje(data.mensaje || "Sin resultados");
          setResultados([]);
        }
      } else {
        setMensaje(data.error || "Error en la búsqueda");
        setResultados([]);
      }
    } catch (error) {
      console.error("Error al buscar boleto:", error);
      setMensaje("Error al buscar boleto");
    }
  };

  const resultadosFiltrados = resultados.filter((res) => {
    const texto = filtroTexto.toLowerCase();
    const cumpleTexto =
      res.nombre_completo?.toLowerCase().includes(texto) ||
      res.rifa?.toLowerCase().includes(texto) ||
      res.telefono?.toLowerCase().includes(texto) ||
      res.correo?.toLowerCase().includes(texto) ||
      res.folio?.toLowerCase().includes(texto);

    const cumpleEstado =
      !estadoFiltro || res.estado_rifa?.toLowerCase() === estadoFiltro;

    return cumpleTexto && cumpleEstado;
  });

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-yellow-400 text-center mb-6">
        🔎 Buscar Boleto
      </h2>

      <div className="max-w-xl mx-auto space-y-4">
        <input
          type="number"
          placeholder="Número de boleto"
          className="w-full p-3 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />

        <button
          onClick={buscar}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 rounded font-bold flex justify-center items-center gap-2"
        >
          <Search className="w-5 h-5" /> Buscar
        </button>
      </div>

      {mensaje && <p className="text-center text-red-400 mt-6">{mensaje}</p>}

      {resultados.length > 0 && (
        <div className="max-w-3xl mx-auto mt-10 space-y-6">
          {/* Filtros adicionales */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Filtrar por nombre, teléfono, correo, rifa, etc."
              className="w-full md:w-2/3 p-3 rounded bg-white/10 border border-white/20 text-white placeholder-white/60"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />

            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="p-3 rounded border border-white/20 bg-white/10 text-white backdrop-blur-md w-full md:w-1/3 focus:outline-none"
            >
              <option value="">Todas las rifas</option>
              <option value="activa">🎯 Rifas activas</option>
              <option value="finalizada">🏁 Rifas finalizadas</option>
            </select>
          </div>

          {resultadosFiltrados.length === 0 ? (
            <p className="text-center text-white/60">Sin coincidencias con los filtros aplicados.</p>
          ) : (
            resultadosFiltrados.map((res, idx) => (
              <div
                key={idx}
                className="bg-white/10 rounded-xl p-6 shadow border border-white/20 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold mb-4 text-yellow-300 flex items-center gap-2">
                  <Ticket className="text-yellow-400 w-5 h-5" />
                  Boleto #{res.numero}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p>
                    <User className="inline w-4 h-4 text-blue-300 mr-1" />
                    {res.nombre_completo}
                  </p>
                  <p>
                    <Mail className="inline w-4 h-4 text-purple-300 mr-1" />
                    {res.correo}
                  </p>
                  <p>
                    <Phone className="inline w-4 h-4 text-pink-300 mr-1" />
                    {res.telefono}
                  </p>
                  <p>
                    <FileText className="inline w-4 h-4 text-teal-300 mr-1" />
                    {res.rifa}
                  </p>
                  <p>
                    <CreditCard className="inline w-4 h-4 text-orange-300 mr-1" />
                    {res.metodo_pago}
                  </p>
                  <p>
                    {res.pagado ? (
                      <CheckCircle className="inline w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <AlertCircle className="inline w-4 h-4 text-red-400 mr-1" />
                    )}
                    {res.pagado ? "Pagado" : "No pagado"}
                  </p>
                  <p>
                    <Ticket className="inline w-4 h-4 text-indigo-300 mr-1" />
                    Folio: {res.folio}
                  </p>
                  <p>
                    <CalendarDays className="inline w-4 h-4 text-cyan-300 mr-1" />
                    {new Date(res.fecha_transaccion).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BuscadorBoletos;
