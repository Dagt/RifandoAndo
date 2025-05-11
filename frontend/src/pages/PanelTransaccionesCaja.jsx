import React, { useEffect, useState } from "react";
import {
  CreditCard, ClipboardList, Gift, Ticket, User, Mail, Phone, Calendar
} from "lucide-react";
import useAuth from "../utils/useAuth";

const PanelTransaccionesCaja = () => {
  const { token, loading } = useAuth();
  const [transacciones, setTransacciones] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [transaccionDetalle, setTransaccionDetalle] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [metodo, setMetodo] = useState("");

  const fetchTransacciones = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", pagina);
      if (buscar) params.append("buscar", buscar);
      if (estado) params.append("estado", estado);
      if (metodo) params.append("metodo", metodo);

      const res = await fetch(`/api/transacciones-caja/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTransacciones(data.results || []);
      setTotalPaginas(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error al cargar transacciones de caja:", err);
    }
  };

  useEffect(() => {
    if (token && !loading) fetchTransacciones();
  }, [pagina, token, loading, buscar, estado, metodo]);

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-yellow-400 text-center mb-6 flex items-center justify-center gap-2">
        <CreditCard className="w-7 h-7" /> Compras de Cajas Sorpresa
      </h2>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por folio o nombre"
          className="p-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/60 w-full md:w-1/3"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value);
            setPagina(1);
          }}
        />

        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setPagina(1);
          }}
          className="p-2 rounded bg-white/10 border border-white/20 text-white w-full md:w-auto"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">⏳ Pendiente</option>
          <option value="completado">✅ Completado</option>
          <option value="cancelado">❌ Cancelado</option>
        </select>

        <select
          value={metodo}
          onChange={(e) => {
            setMetodo(e.target.value);
            setPagina(1);
          }}
          className="p-2 rounded bg-white/10 border border-white/20 text-white w-full md:w-auto"
        >
          <option value="">Todos los métodos</option>
          <option value="tarjeta">💳 Tarjeta</option>
          <option value="oxxo">🧾 OXXO</option>
          <option value="spei">🏦 Transferencia</option>
          <option value="gratis">🎁 Gratis</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow w-full">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/10 text-white text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Cajas</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-center">Premios</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((t) => (
              <tr key={t.folio} className="border-t border-white/10">
                <td className="px-4 py-3 font-mono">{t.folio}</td>
                <td className="px-4 py-3">{t.nombre_completo}</td>
                <td className="px-4 py-3 text-center">{t.aperturas.length}</td>
                <td className="px-4 py-3">${parseFloat(t.monto || 0).toFixed(2)}</td>
                <td className="px-4 py-3 capitalize">{t.metodo_pago}</td>
                <td className="px-4 py-3">{new Date(t.fecha_creacion).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setTransaccionDetalle(t)}
                    className="text-cyan-400 hover:text-cyan-300"
                    title="Ver premios"
                  >
                    <ClipboardList className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles */}
      {transaccionDetalle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-xl border border-white/20">
            <h3 className="text-xl font-bold text-yellow-300 mb-4">
              Detalles de la transacción <span className="font-mono">{transaccionDetalle.folio}</span>
            </h3>

            <div className="space-y-2 text-white/90 text-sm mb-4">
              <p className="flex items-center gap-2"><User className="w-4 h-4 text-yellow-400" /> {transaccionDetalle.nombre_completo}</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-yellow-400" /> {transaccionDetalle.correo}</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-yellow-400" /> {transaccionDetalle.telefono}</p>
              <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-yellow-400" /> {transaccionDetalle.fecha_nacimiento}</p>
              <p className="flex items-center gap-2"><Gift className="w-4 h-4 text-pink-400" /> Cajas abiertas: {transaccionDetalle.aperturas.length}</p>
            </div>

            <h4 className="text-yellow-300 font-semibold mb-2">Premios otorgados:</h4>
            <ul className="space-y-1 text-sm text-white/80 max-h-48 overflow-auto">
              {transaccionDetalle.aperturas.map((a, i) => (
                <li key={i} className="flex items-center gap-2">
                  {a.boleto_exclusivo && <Ticket className="w-4 h-4 text-green-400" title="Boleto exclusivo" />}
                  {a.jackpot && <Gift className="w-4 h-4 text-yellow-300" title="Boleto para el Jackpot" />}
                  <span>{a.nombre} {a.valor ? `($${parseFloat(a.valor).toFixed(2)})` : null}</span>
                </li>
              ))}
            </ul>

            <div className="text-center mt-6">
              <button
                onClick={() => setTransaccionDetalle(null)}
                className="px-5 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      <div className="mt-6 flex justify-center items-center gap-3 text-sm">
        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
        >
          ← Anterior
        </button>
        <span>Página {pagina} de {totalPaginas}</span>
        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default PanelTransaccionesCaja;
