import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RifasAdmin = () => {
  const navigate = useNavigate();
  const [rifas, setRifas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const fetchRifas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (estadoFiltro !== "") params.append("estado", estadoFiltro);
      if (busqueda.trim() !== "") params.append("buscar", busqueda.trim());
      params.append("page", pagina);

      const res = await fetch(`https://rifandoando.club:8000/api/rifas/?${params.toString()}`);
      const data = await res.json();
      setRifas(data.results || []);
      setTotalPaginas(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error cargando rifas:", err);
      setMensaje("Error al cargar rifas");
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRifas();
  }, [pagina, estadoFiltro, busqueda]);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta rifa?")) return;
    const res = await fetch(`https://rifandoando.club:8000/api/rifas/${id}/eliminar/`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMensaje("Rifa eliminada");
      fetchRifas();
    } else {
      const data = await res.json();
      setMensaje(data.detail || "Error al eliminar");
    }
  };

  const estados = {
    en_espera: "⏳ En espera",
    activa: "✅ Activa",
    finalizada: "🏁 Finalizada",
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-orange-400 text-center mb-6">📋 Rifas Registradas</h2>

      {mensaje && <p className="text-center text-green-400 mb-4">{mensaje}</p>}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o ID"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
          className="p-2 rounded bg-white/10 border border-white/20 w-full md:w-1/3 focus:outline-none text-white placeholder-white/50"
        />

        <div className="relative w-full md:w-auto">
        <select
value={estadoFiltro}
onChange={(e) => {
  setEstadoFiltro(e.target.value);
  setPagina(1);
}}
className="p-2 rounded bg-white/10 border border-white/20 text-white focus:outline-none w-full md:w-auto"
style={{
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  color: "white",
  backdropFilter: "blur(10px)",
}}
>
<option value="" className="text-black">Todos los estados</option>
<option value="en_espera" className="text-black">⏳ En espera</option>
<option value="activa" className="text-black">✅ Activa</option>
<option value="finalizada" className="text-black">🏁 Finalizada</option>
</select>
        </div>
      </div>

      {loading ? (
        <p className="text-center mt-10">Cargando rifas...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/10 text-white/80 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fechas</th>
                <th className="px-4 py-3">Boletos</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rifas.map((rifa) => (
                <tr key={rifa.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{rifa.id}</td>
                  <td className="px-4 py-3">{rifa.nombre}</td>
                  <td className="px-4 py-3">{estados[rifa.estado] || rifa.estado}</td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-white/80 text-xs">Inicio:</div>
                      <div>{rifa.fecha_inicio}</div>
                      <div className="text-white/80 text-xs mt-1">Fin:</div>
                      <div>{rifa.fecha_fin}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {rifa.boletos_vendidos} / {rifa.total_boletos}
                  </td>
                  <td className="px-4 py-3">${rifa.precio_boleto}</td>
                  <td className="px-4 py-3 text-center space-x-2">
  <button
    onClick={() => navigate(`/admin/rifa/${rifa.id}/editar`)}
    className="border border-yellow-400 text-yellow-300 hover:bg-yellow-400/10 px-3 py-1 rounded text-sm transition"
  >
    ✏️ Editar
  </button>
  {rifa.estado === "en_espera" && (
    <button
      onClick={() => handleEliminar(rifa.id)}
      className="border border-red-400 text-red-300 hover:bg-red-400/10 px-3 py-1 rounded text-sm transition"
    >
      🗑️ Eliminar
    </button>
  )}
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

export default RifasAdmin;
