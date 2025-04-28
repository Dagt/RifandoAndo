import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../utils/useAuth";

const PanelTransacciones = () => {
  const navigate = useNavigate();
  const { token, user, loading } = useAuth();
  const [transacciones, setTransacciones] = useState([]);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [metodo, setMetodo] = useState("");

  const fetchTransacciones = async () => {
    setLoadingDatos(true);
    try {
      const params = new URLSearchParams();
      params.append("page", pagina);
      if (buscar) params.append("buscar", buscar);
      if (estado) params.append("estado", estado.toLowerCase());
      if (metodo) params.append("metodo", metodo);

      const res = await fetch(`/api/transacciones/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        navigate("/lgn");
        return;
      }

      const data = await res.json();
      setTransacciones(data.results || []);
      setTotalPaginas(Math.ceil((data.count || 1) / 10));
    } catch (err) {
      console.error("Error al cargar transacciones:", err);
      setMensaje("Error al cargar transacciones");
    }
    setLoadingDatos(false);
  };

  useEffect(() => {
    if (!loading && token) fetchTransacciones();
  }, [pagina, token, buscar, estado, metodo, loading]);

  useEffect(() => {
    if (mensaje) {
      const timeout = setTimeout(() => setMensaje(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [mensaje]);

  const marcarComoPagada = async (folio) => {
    if (!window.confirm("¿Confirmar que esta transacción ya fue pagada?")) return;
    const res = await fetch(`/api/transacciones/${folio}/completar/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setMensaje(data.mensaje || "Transacción actualizada ✅");
      fetchTransacciones();
    } else {
      setMensaje(data.detail || "Error al actualizar");
    }
  };

  const cancelarTransaccion = async (folio) => {
    if (!window.confirm("¿Cancelar esta transacción? Esta acción liberará los boletos.")) return;
    const res = await fetch(`/api/transacciones/${folio}/cancelar/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setMensaje(data.mensaje || "Transacción cancelada");
      fetchTransacciones();
    } else {
      setMensaje(data.detail || "Error al cancelar");
    }
  };

  const iconoEstado = (estado) => {
  const color = {
    pendiente: "text-yellow-400",
    completado: "text-green-400",
    cancelado: "text-red-400",
  };
  const simbolo = {
    pendiente: "⧗",
    completado: "✓",
    cancelado: "✗",
  };
  return <span className={`font-semibold ${color[estado]}`}>{simbolo[estado]} {estado}</span>;
};


  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-orange-400 text-center mb-6">💳 Transacciones</h2>

      {mensaje && <p className="text-center text-green-400 mb-4">{mensaje}</p>}

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por folio, nombre o rifa"
          className="p-2 rounded bg-white/10 border border-white/20 focus:outline-none text-white placeholder-white/60 w-full md:w-1/3"
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
  className="p-2 rounded border border-white/20 bg-white/10 text-white backdrop-blur-md w-full md:w-auto focus:outline-none"
>
  <option value="" className="text-black">Todos los estados</option>
  <option value="pendiente" className="text-black">⏳ Pendiente</option>
  <option value="completado" className="text-black">✅ Completado</option>
  <option value="cancelado" className="text-black">❌ Cancelado</option>
</select>

<select
  value={metodo}
  onChange={(e) => {
    setMetodo(e.target.value);
    setPagina(1);
  }}
  className="p-2 rounded border border-white/20 bg-white/10 text-white backdrop-blur-md w-full md:w-auto focus:outline-none"
>
  <option value="" className="text-black">Todos los métodos</option>
  <option value="SPEI" className="text-black">🏦 Transferencia</option>
  <option value="OXXO" className="text-black">🧾 OXXO</option>
  <option value="tarjeta" className="text-black">💳 Tarjeta</option>
</select>
      </div>

      {/* Tabla */}
      {loadingDatos ? (
        <p className="text-center mt-10">Cargando transacciones...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/10 text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-white/60">
                    No se encontraron transacciones.
                  </td>
                </tr>
              ) : (
                transacciones.map((t) => (
                  <tr key={t.folio} className="border-t border-white/10">
                    <td className="px-4 py-3 font-mono">{t.folio}</td>
                    <td className="px-4 py-3">{t.nombre_completo}</td>
                    <td className="px-4 py-3">${t.monto}</td>
                    <td className="px-4 py-3">{t.metodo_pago}</td>
                    <td className="px-4 py-3">{iconoEstado(t.estado?.toLowerCase())}</td>
                    <td className="px-4 py-3 text-center space-x-2">
  {t.estado?.toLowerCase() === "pendiente" && (
    <button
      onClick={() => marcarComoPagada(t.folio)}
      className="flex items-center gap-1 border border-green-400 text-green-300 hover:bg-green-400/10 px-3 py-1 rounded text-sm transition"
    >
      <span className="font-bold">✓</span>
    </button>
  )}
  {["pendiente", "completado"].includes(t.estado?.toLowerCase()) && (
    <button
      onClick={() => cancelarTransaccion(t.folio)}
      className="flex items-center gap-1 border border-red-400 text-red-300 hover:bg-red-400/10 px-3 py-1 rounded text-sm transition"
    >
      <span className="font-bold">✗</span>
    </button>
  )}
</td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default PanelTransacciones;
