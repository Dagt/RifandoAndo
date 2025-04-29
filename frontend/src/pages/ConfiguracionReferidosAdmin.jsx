import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle, RefreshCcw, Check, X, Clock } from "lucide-react";

const ConfiguracionReferidosAdmin = () => {
  const [configuracion, setConfiguracion] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [nuevoMinimoGenerar, setNuevoMinimoGenerar] = useState("");
  const [nuevoMinimoValidar, setNuevoMinimoValidar] = useState("");
  const [nuevoMinimoRegla, setNuevoMinimoRegla] = useState("");
  const [nuevoBoletosRegla, setNuevoBoletosRegla] = useState("");
  const token = localStorage.getItem("token");
  const [links, setLinks] = useState([]);
  const [paginaLinks, setPaginaLinks] = useState(1);
  const [totalPaginasLinks, setTotalPaginasLinks] = useState(1);
  const [busquedaCodigo, setBusquedaCodigo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => {
    fetch("/api/configuracion-referidos/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) =>
        setConfiguracion({
          ...data,
          reglas_premios: data.reglas_premios || [],
        })
      )
      .catch(() => setMensaje("❌ No se pudo cargar la configuración."));

    fetchLinksReferidos(1);
  }, [token]);

  const toggleSwitch = (campo) => {
    fetch(`/api/configuracion-referidos/toggle/${campo}/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfiguracion((prev) => ({ ...prev, [campo]: !prev[campo] }));
        }
      });
  };

  const actualizarMontosMinimos = () => {
    const payload = {};
    if (nuevoMinimoGenerar !== "")
      payload.monto_minimo_para_generar = parseFloat(nuevoMinimoGenerar);
    if (nuevoMinimoValidar !== "")
      payload.monto_minimo_para_validar = parseFloat(nuevoMinimoValidar);

    fetch("/api/configuracion-referidos/actualizar-montos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMensaje("✅ Montos actualizados.");
          setConfiguracion((prev) => ({ ...prev, ...payload }));
          setNuevoMinimoGenerar("");
          setNuevoMinimoValidar("");
        } else {
          setMensaje("❌ Error al actualizar montos.");
        }
      })
      .catch(() => setMensaje("❌ Error de conexión."));
  };

  const agregarRegla = () => {
    if (!nuevoMinimoRegla || !nuevoBoletosRegla) return;
    const nuevaRegla = {
      monto_minimo: parseInt(nuevoMinimoRegla, 10),
      boletos_regalo: parseInt(nuevoBoletosRegla, 10),
    };

    fetch("/api/configuracion-referidos/agregar-regla/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevaRegla),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfiguracion((prev) => ({
            ...prev,
            reglas_premios: [...prev.reglas_premios, nuevaRegla].sort(
              (a, b) => a.minimo - b.minimo
            ),
          }));
          setNuevoMinimoRegla("");
          setNuevoBoletosRegla("");
          setMensaje("✅ Regla agregada.");
        }
      });
  };

  const fetchLinksReferidos = (pagina) => {
    fetch(`/api/links-referidos/?page=${pagina}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLinks(data.results || []);
        setTotalPaginasLinks(Math.ceil((data.count || 1) / 10));
        setPaginaLinks(pagina);
      })
      .catch(() => setMensaje("❌ No se pudieron cargar los links."));
  };

  const invalidarLink = (linkId) => {
    if (!window.confirm("¿Estás seguro de invalidar este link? No podrá usarse más.")) return;

    fetch(`/api/links-referidos/invalidar/${linkId}/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMensaje("✅ Link invalidado correctamente.");
          fetchLinksReferidos(1);
        } else {
          setMensaje("❌ Error. El link ya no era válido.");
        }
      })
      .catch(() => setMensaje("❌ Error de conexión al invalidar link."));
  };

  const eliminarRegla = (index) => {
    fetch(`/api/configuracion-referidos/eliminar-regla/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ indice: index }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const nuevas = [...configuracion.reglas_premios];
          nuevas.splice(index, 1);
          setConfiguracion((prev) => ({ ...prev, reglas_premios: nuevas }));
          setMensaje("✅ Regla eliminada.");
        }
      });
  };

  if (!configuracion) {
    return <p className="text-white text-center mt-10">Cargando configuración...</p>;
  }

  return (
    <div className="min-h-screen p-6 text-white">
      {/* Todo tu panel de configuraciones inicial... */}

      {/* Aquí iría lo de Programa Activo, Permitir Cadenas, Montos, Reglas, etc. (no lo borro) */}

      {/* Tabla de Links de Referidos */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-md max-w-6xl mx-auto space-y-6 mt-10">
        <h3 className="text-xl font-bold">🔗 Links de Referidos Generados</h3>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Buscar código, cliente o rifa..."
            value={busquedaCodigo}
            onChange={(e) => setBusquedaCodigo(e.target.value)}
            className="p-2 rounded bg-white/20 text-white w-full md:w-1/3"
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="p-2 rounded bg-white/20 text-white w-full md:w-1/4"
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="usado">Usado</option>
            <option value="expirado">Expirado</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white/5 rounded-xl p-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/10">
              <tr>
                <th className="p-2">Folio Transacción</th>
                <th className="p-2">Nombre Cliente</th>
                <th className="p-2">Nombre Rifa</th>
                <th className="p-2">Código Link</th>
                <th className="p-2">Vence en</th>
                <th className="p-2 text-center">Estado</th>
                <th className="p-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {links
                .filter((link) =>
                  (link.codigo.toLowerCase().includes(busquedaCodigo.toLowerCase()) ||
                    link.nombre_cliente.toLowerCase().includes(busquedaCodigo.toLowerCase()) ||
                    link.nombre_rifa.toLowerCase().includes(busquedaCodigo.toLowerCase())) &&
                  (filtroEstado === "" ||
                    (filtroEstado === "disponible" && !link.usado && !link.expirado) ||
                    (filtroEstado === "usado" && link.usado) ||
                    (filtroEstado === "expirado" && link.expirado))
                )
                .map((link) => (
                  <tr key={link.id} className="border-t border-white/10">
                    <td className="p-2">{link.folio_transaccion}</td>
                    <td className="p-2">{link.nombre_cliente}</td>
                    <td className="p-2">{link.nombre_rifa}</td>
                    <td className="p-2 font-mono text-yellow-300">{link.codigo}</td>
                    <td className="p-2">{new Date(link.vence).toLocaleString()}</td>
                    <td className="px-4 py-2 text-center">
                      {link.expirado ? (
                        <span className="text-yellow-400 flex items-center justify-center gap-1">
                          <Clock size={18}/> Expirado
                        </span>
                      ) : link.usado ? (
                        <span className="text-red-400 flex items-center justify-center gap-1">
                          <X size={18}/> Usado
                        </span>
                      ) : (
                        <span className="text-green-400 flex items-center justify-center gap-1">
                          <Check size={18}/> Disponible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {!link.expirado && (
                        <button onClick={() => invalidarLink(link.id)}
                          className="text-red-400 hover:text-red-600"
                          title="Invalidar Link"
                        >
                          <Trash2 size={18}/>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionReferidosAdmin;
