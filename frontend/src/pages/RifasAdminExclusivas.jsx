import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, ListTodo } from "lucide-react";

const RifasAdminExclusivas = () => {
  const navigate = useNavigate();
  const [rifas, setRifas] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const token = localStorage.getItem("token");

  const fetchRifas = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (estadoFiltro !== "") params.append("finalizada", estadoFiltro);
    if (busqueda.trim() !== "") params.append("buscar", busqueda.trim());

    const res = await fetch(`/api/exclusiva/listar-rifas/?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    setRifas(data.results || []);
  } catch (err) {
    console.error("Error cargando rifas exclusivas:", err);
    setMensaje("Error al cargar rifas exclusivas");
  }
  setLoading(false);
};

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRifas();
  }, [estadoFiltro, busqueda]);

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-pink-300 text-center mb-6 flex items-center justify-center gap-2">
        <ListTodo className="w-7 h-7 text-pink-300" /> Rifas Exclusivas Registradas
      </h2>

      {mensaje && <p className="text-center text-red-400 mb-4">{mensaje}</p>}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o ID"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="p-2 rounded bg-white/10 border border-white/20 w-full md:w-1/3 focus:outline-none text-white placeholder-white/50"
        />

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="p-2 rounded bg-white/10 border border-white/20 text-white focus:outline-none w-full md:w-auto"
        >
          <option value="">Todos los estados</option>
          <option value="false">✅ Activas</option>
          <option value="true">🏁 Finalizadas</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center mt-10">Cargando rifas exclusivas...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/10 text-white/80 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Boletos</th>
                <th className="px-4 py-3">Valor Premio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rifas.map((rifa) => (
                <tr key={rifa.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{rifa.id}</td>
                  <td className="px-4 py-3">{rifa.nombre}</td>
                  <td className="px-4 py-3">
                    {rifa.boletos_encontrados} / {rifa.total_boletos}
                  </td>
                  <td className="px-4 py-3">${rifa.valor_premio}</td>
                  <td className="px-4 py-3">
                    {rifa.finalizada ? "🏁 Finalizada" : "✅ Activa"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/panel/rifa-exclusiva/${rifa.id}/editar`)}
                      className="border border-yellow-400 text-yellow-300 hover:bg-yellow-400/10 px-3 py-1 rounded text-sm transition"
                    >
                      <Pencil size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RifasAdminExclusivas;
