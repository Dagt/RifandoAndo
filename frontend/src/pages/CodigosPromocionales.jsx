import React, { useEffect, useState } from "react";
import { Sparkles, Pause, Play, ClipboardList } from "lucide-react";

const CodigosPromocionalesAdmin = () => {
  const [codigos, setCodigos] = useState([]);
  const [rifas, setRifas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [codigoDetalle, setCodigoDetalle] = useState(null);
  const token = localStorage.getItem("token");

  const [nuevoCodigo, setNuevoCodigo] = useState({
    codigo: "",
    tipo: "porcentaje",
    valor: "",
    compra_minima: "",
    fecha_expiracion: "",
    usos_maximos: "",
    rifas: [],
    minimo_boletos_para_regalo: "",
    boletos_regalo: "",
  });

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/codigos-promocionales/")
      .then((res) => res.json())
      .then((data) => setCodigos(data));
    fetch("/api/rifas-activas/")
      .then((res) => res.json())
      .then((data) => setRifas(data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoCodigo((prev) => ({ ...prev, [name]: value }));
  };

  const handleRifaToggle = (id) => {
    setNuevoCodigo((prev) => {
      const rifas = prev.rifas.includes(id)
        ? prev.rifas.filter((r) => r !== id)
        : [...prev.rifas, id];
      return { ...prev, rifas };
    });
  };

  const crearCodigo = (e) => {
    e.preventDefault();

    const payload = {
      codigo: nuevoCodigo.codigo.trim(),
      tipo: nuevoCodigo.tipo,
      rifas: nuevoCodigo.rifas,
      usos_maximos: nuevoCodigo.usos_maximos || null,
      fecha_expiracion: nuevoCodigo.fecha_expiracion || null,
    };
    if (payload.rifas.length === 0) delete payload.rifas;

    if (nuevoCodigo.tipo === "porcentaje") {
      payload.valor = parseInt(nuevoCodigo.valor, 10);
      payload.compra_minima = nuevoCodigo.compra_minima || null;
    } else if (nuevoCodigo.tipo === "boletos_extra") {
      payload.valor = null;
      payload.minimo_boletos_para_regalo = parseInt(nuevoCodigo.minimo_boletos_para_regalo, 10);
      payload.boletos_regalo = parseInt(nuevoCodigo.boletos_regalo, 10);
      payload.compra_minima = null;
    }

    fetch("/api/codigos-promocionales/crear/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setCodigos((prev) => [data, ...prev]);
          setMensaje("✅ Código creado correctamente.");
          setNuevoCodigo({
            codigo: "",
            tipo: "porcentaje",
            valor: "",
            compra_minima: "",
            fecha_expiracion: "",
            usos_maximos: "",
            rifas: [],
            minimo_boletos_para_regalo: "",
            boletos_regalo: "",
          });
        } else {
          const mensajeError = data?.error
            ? Object.values(data.error).flat().join(" ")
            : "❌ Error al crear código.";
          setMensaje(mensajeError);
        }
      })
      .catch(() => setMensaje("❌ Error al crear código."));
  };

  const togglePausa = (id) => {
    fetch(`/api/codigos-promocionales/${id}/toggle-pausa/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCodigos((prev) =>
          prev.map((c) => (c.id === id ? { ...c, pausado: data.pausado } : c))
        );
      });
  };

  const codigosFiltrados = codigos.filter((c) => {
    const ahora = new Date();
    const expira = c.fecha_expiracion ? new Date(c.fecha_expiracion) < ahora : false;
    const agotado = c.usos_maximos !== null && c.usos_actuales >= c.usos_maximos;

    if (filtroEstado === "activos" && (expira || agotado || c.pausado)) return false;
    if (filtroEstado === "expirados" && !expira) return false;
    if (filtroEstado === "agotados" && !agotado) return false;
    if (filtroEstado === "pausados" && !c.pausado) return false;

    return c.codigo.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-center text-yellow-400 mb-6">
        <Sparkles className="inline-block w-6 h-6 mr-2" />
        Gestión de Códigos Promocionales
      </h1>

      {mensaje && (
        <div className="mb-4 bg-white/10 p-3 rounded text-sm text-center">{mensaje}</div>
      )}

      {/* Formulario */}
      <form onSubmit={crearCodigo} className="grid md:grid-cols-3 gap-4 mb-8 bg-white/10 p-4 rounded-xl backdrop-blur-md shadow-md">
        <input type="text" name="codigo" placeholder="Código" className="p-2 rounded bg-white/30 text-white" value={nuevoCodigo.codigo} onChange={handleChange} required />
        <select name="tipo" className="p-2 rounded bg-white/30 text-white" value={nuevoCodigo.tipo} onChange={handleChange}>
          <option value="porcentaje">Descuento (%)</option>
          <option value="boletos_extra">Boletos extra</option>
        </select>

        {nuevoCodigo.tipo === "porcentaje" && (
          <input type="number" name="valor" placeholder="Porcentaje de descuento" className="p-2 rounded bg-white/30 text-white" value={nuevoCodigo.valor} onChange={handleChange} required />
        )}
        {nuevoCodigo.tipo === "boletos_extra" && (
          <>
            <input type="number" name="minimo_boletos_para_regalo" placeholder="Ej: 5 (cada X)" className="p-2 rounded bg-white/30 text-white" value={nuevoCodigo.minimo_boletos_para_regalo} onChange={handleChange} required />
            <input type="number" name="boletos_regalo" placeholder="Ej: 1 (regalo)" className="p-2 rounded bg-white/30 text-white" value={nuevoCodigo.boletos_regalo} onChange={handleChange} required />
          </>
        )}
        {nuevoCodigo.tipo === "porcentaje" && (
          <input type="number" name="compra_minima" placeholder="Compra mínima en $" className="p-2 rounded bg-white/30 text-white" value={nuevoCodigo.compra_minima} onChange={handleChange} />
        )}
        <input type="datetime-local" name="fecha_expiracion" className="p-2 rounded bg-white/30 text-white" value={nuevoCodigo.fecha_expiracion} onChange={handleChange} />
        <input type="number" name="usos_maximos" placeholder="Límite de usos" className="p-2 rounded bg-white/30 text-white" value={nuevoCodigo.usos_maximos} onChange={handleChange} />

        <div className="col-span-full">
          <label className="block mb-2 text-sm">Aplicar solo en rifas específicas:</label>
          <div className="flex flex-wrap gap-2">
            {rifas.map((r) => (
              <label key={r.id} className="text-sm bg-white/10 px-2 py-1 rounded cursor-pointer">
                <input type="checkbox" className="mr-1" checked={nuevoCodigo.rifas.includes(r.id)} onChange={() => handleRifaToggle(r.id)} />
                {r.nombre}
              </label>
            ))}
          </div>
        </div>

        <div className="col-span-full text-center">
          <button type="submit" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold py-2 px-5 rounded">
            ➕ Crear código
          </button>
        </div>
      </form>

      {/* Tabla de códigos */}
      <div className="overflow-x-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div className="flex gap-2 backdrop-blur-md">
            {["todos", "activos", "expirados", "agotados","pausados"].map((filtro) => (
              <button key={filtro} onClick={() => setFiltroEstado(filtro)} className={`px-3 py-1 rounded-full text-sm font-semibold ${filtroEstado === filtro ? "bg-yellow-400 text-indigo-900" : "bg-white/10 text-white hover:bg-white/20"}`}>
                {filtro.charAt(0).toUpperCase() + filtro.slice(1)}
              </button>
            ))}
          </div>
          <input type="text" placeholder="🔍 Buscar código" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="px-3 py-1 rounded bg-white/10 text-white text-sm w-full md:w-64 border border-white/20" />
        </div>

        <table className="min-w-full text-sm text-white text-left border backdrop-blur-md border-white/10">
          <thead className="bg-white/10">
            <tr>
              <th className="p-2">Código</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Usos</th>
              <th className="p-2">Expira</th>
              <th className="p-2">Compra mínima</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {codigosFiltrados.map((c) => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="p-2 font-bold text-yellow-300">{c.codigo}</td>
                <td className="p-2 capitalize">{c.tipo}</td>
                <td className="p-2">{c.valor ?? `${c.boletos_regalo} por ${c.minimo_boletos_para_regalo}`}</td>
                <td className="p-2">{c.usos_actuales} / {c.usos_maximos || "∞"}</td>
                <td className="p-2">
                  {c.fecha_expiracion && new Date(c.fecha_expiracion) < new Date()
                    ? "Expirado"
                    : c.fecha_expiracion
                      ? new Date(c.fecha_expiracion).toLocaleString("es-MX")
                      : "—"}
                </td>
                <td className="p-2">{c.compra_minima ? `$${c.compra_minima}` : "—"}</td>
                <td className="p-2 flex items-center gap-2 justify-center">
                  {/* Botón de detalles */}
                  <button onClick={() => setCodigoDetalle(c)}
                  className="text-cyan-400 hover:text-cyan-300 transition"
                  title="Ver rifas asignadas"
                  >
                    <ClipboardList size={16} />
                  </button>

                  {/* Botón de pausa/reanudar */}
                  <button onClick={() => togglePausa(c.id)}
                  className={`transition ${c.pausado
                  ? "text-green-400 hover:text-green-300"
                  : "text-red-400 hover:text-red-300"}`}
                  title={c.pausado ? "Reanudar código" : "Pausar código"}
                  >
                    {c.pausado ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de rifas asignadas */}
      {codigoDetalle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 text-black p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Rifas asociadas al código <span className="text-yellow-600">{codigoDetalle.codigo}</span></h2>
            <ul className="list-disc pl-5 max-h-60 overflow-auto">
              {codigoDetalle.rifas_nombres.map((nombre, i) => (
                <li key={i}>{nombre}</li>
              ))}
            </ul>
            <div className="mt-4 text-right">
              <button onClick={() => setCodigoDetalle(null)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodigosPromocionalesAdmin;
