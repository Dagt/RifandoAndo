import React, {useEffect, useState} from "react";
import {Trash2, PlusCircle, RefreshCcw, Check, X, Link2} from "lucide-react";

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
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return; // Evita llamada si no hay token

    try {
      const res = await fetch("/api/configuracion-referidos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (res.ok) {
        setResultados(data);
      } else {
        console.warn("❌ Error de autenticación o formato:", data);
        setResultados(null);
      }
    } catch (err) {
      console.error("❌ Error de conexión:", err);
      setResultados(null);
    }
  };

  fetchData();
}, [input]);

    const toggleSwitch = (campo) => {
        fetch(`/api/configuracion-referidos/toggle/${campo}/`, {
            method: "POST",
            headers: {Authorization: `Bearer ${token}`},
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConfiguracion(prev => ({...prev, [campo]: !prev[campo]}));
                }
            });
    };

    const actualizarMontosMinimos = () => {
        const payload = {};
        if (nuevoMinimoGenerar !== "") payload.monto_minimo_para_generar = parseFloat(nuevoMinimoGenerar);
        if (nuevoMinimoValidar !== "") payload.monto_minimo_para_validar = parseFloat(nuevoMinimoValidar);

        fetch("/api/configuracion-referidos/actualizar-montos/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMensaje("✅ Montos actualizados.");
                    setConfiguracion(prev => ({...prev, ...payload}));
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
        const nuevaRegla = {monto_minimo: parseInt(nuevoMinimoRegla, 10), boletos_regalo: parseInt(nuevoBoletosRegla, 10)};

        fetch("/api/configuracion-referidos/agregar-regla/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(nuevaRegla),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConfiguracion(prev => ({
                        ...prev,
                        reglas_premios: [...prev.reglas_premios, nuevaRegla].sort((a, b) => a.minimo - b.minimo)
                    }));
                    setNuevoMinimoRegla("");
                    setNuevoBoletosRegla("");
                    setMensaje("✅ Regla agregada.");
                }
            });
    };

    const fetchLinksReferidos = (pagina) => {
        fetch(`/api/links-referidos/?page=${pagina}`, {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then(res => res.json())
            .then(data => {
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
            headers: {Authorization: `Bearer ${token}`},
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMensaje("✅ Link invalidado correctamente.");
                    fetchLinksReferidos(1);
                } else {
                    setMensaje("❌ Error. El link ya no era valido.");
                }
            })
            .catch(() => setMensaje("❌ Error de conexión al invalidar link."));
    };


    const eliminarRegla = (index) => {
        fetch(`/api/configuracion-referidos/eliminar-regla/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ indice: index }),
    })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const nuevas = [...configuracion.reglas_premios];
                    nuevas.splice(index, 1);
                    setConfiguracion(prev => ({...prev, reglas_premios: nuevas}));
                    setMensaje("✅ Regla eliminada.");
                }
            });
    };

    if (!configuracion) {
        return <p className="text-white text-center mt-10">Cargando configuración...</p>;
    }

    return (
        <div className="min-h-screen p-6 text-white">
            <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400 flex items-center justify-center gap-2">
                <Link2 className="w-7 h-7 text-yellow-400" />
                    Links de Referidos
            </h2>

            {mensaje && (
                <div className="mb-6 text-center p-3 rounded-lg bg-white/10 text-sm font-semibold max-w-2xl mx-auto">
                    {mensaje}
                </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-md max-w-4xl mx-auto space-y-6">
                {/* 🔥 Programa Activo */}
                <div className="flex items-center justify-between">
                    <label className="font-semibold text-lg">Programa Activo:</label>
                    <button
                        onClick={() => toggleSwitch('activo')}
                        className={`w-14 h-8 rounded-full flex items-center px-1 ${configuracion.activo ? 'bg-emerald-400' : 'bg-white/20'}`}
                    >
                        <div
                            className={`w-6 h-6 bg-white rounded-full transform ${configuracion.activo ? 'translate-x-6' : ''} transition`}/>
                    </button>
                </div>

                {/* 🔥 Si el programa NO está activo, NO muestres la configuración */}
                {!configuracion.activo ? (
                    <p className="text-center text-white/70 italic">El programa está desactivado. Actívalo para
                        configurar.</p>
                ) : (
                    <>
                        {/* 🔥 Permitir cadenas */}
                        <div className="flex items-center justify-between">
                            <label className="font-semibold text-lg">Permitir cadenas de referidos:</label>
                            <button
                                onClick={() => toggleSwitch('permitir_cadena_referidos')}
                                className={`w-14 h-8 rounded-full flex items-center px-1 ${configuracion.permitir_cadena_referidos ? 'bg-emerald-400' : 'bg-white/20'}`}
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full transform ${configuracion.permitir_cadena_referidos ? 'translate-x-6' : ''} transition`}/>
                            </button>
                        </div>

                        {/* 🔥 Montos mínimos */}
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Montos Mínimos</h3>
                            <div className="flex gap-4 flex-col md:flex-row">
                                <input
                                    type="number"
                                    value={nuevoMinimoGenerar}
                                    onChange={(e) => setNuevoMinimoGenerar(e.target.value)}
                                    placeholder={`Generar link (actual: $${configuracion.monto_minimo_para_generar})`}
                                    className="p-2 rounded bg-white/20 text-white placeholder-white/70 w-full md:w-1/2"
                                />
                                <input
                                    type="number"
                                    value={nuevoMinimoValidar}
                                    onChange={(e) => setNuevoMinimoValidar(e.target.value)}
                                    placeholder={`Validar compra (actual: $${configuracion.monto_minimo_para_validar})`}
                                    className="p-2 rounded bg-white/20 text-white placeholder-white/70 w-full md:w-1/2"
                                />
                                <button onClick={actualizarMontosMinimos}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg p-2">
                                    <RefreshCcw size={20}/>
                                </button>
                            </div>
                        </div>

                        {/* 🔥 Reglas de premios */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">🎯 Reglas Activas</h3>
                            {configuracion.reglas_premios.length > 0 ? (
                                configuracion.reglas_premios.map((regla, index) => (
                                    <div key={index} className="flex items-center gap-4 bg-white/5 rounded p-3">
                                        <span className="flex-1">
                                          Compra mínima: <b>${regla.monto_minimo}</b> ➔ Boletos: <b>{regla.boletos_regalo}</b>
                                        </span>
                                        <button onClick={() => eliminarRegla(index)}
                                                className="bg-red-500/20 hover:bg-red-500/40 rounded-full p-2 text-red-400 hover:text-white transition"
                                        >
                                            <Trash2 size={20}/>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/60 italic">No hay reglas configuradas.</p>
                            )}

                            {/* 🔥 Agregar nueva regla */}
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <input
                                    type="number"
                                    value={nuevoMinimoRegla}
                                    onChange={(e) => setNuevoMinimoRegla(e.target.value)}
                                    placeholder="Monto mínimo ($)"
                                    className="p-2 rounded bg-white/20 text-white placeholder-white/70 w-full md:w-1/2"
                                />
                                <input
                                    type="number"
                                    value={nuevoBoletosRegla}
                                    onChange={(e) => setNuevoBoletosRegla(e.target.value)}
                                    placeholder="Boletos a otorgar"
                                    className="p-2 rounded bg-white/20 text-white placeholder-white/70 w-full md:w-1/2"
                                />
                                <button onClick={agregarRegla}
                                        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg p-2">
                                    <PlusCircle size={20}/>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-md max-w-6xl mx-auto space-y-6 mt-10">
                <div className="mt-10 space-y-4">
                    <h3 className="text-xl font-bold">🔗 Links de Referidos Generados</h3>

                    {links.length === 0 ? (
                        <p className="text-white/60 italic">No se han generado links todavía.</p>
                    ) : (

                        <div className="overflow-x-auto bg-white/5 rounded-xl p-4">
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
                                    .filter(link => (
                                        (link.codigo.toLowerCase().includes(busquedaCodigo.toLowerCase()) ||
                                        link.nombre_cliente.toLowerCase().includes(busquedaCodigo.toLowerCase()) ||
                                        link.nombre_rifa.toLowerCase().includes(busquedaCodigo.toLowerCase())) &&
                                        (filtroEstado === "" ||
                                        (filtroEstado === "disponible" && !link.usado && !link.expirado) ||
                                        (filtroEstado === "usado" && link.usado) ||
                                        (filtroEstado === "expirado" && link.expirado))
                                    ))

                                    .map((link) => (
                                        <tr key={link.id} className="border-t border-white/10">
                                            <td className="p-2">{link.folio_transaccion}</td>
                                            <td className="p-2">{link.nombre_cliente}</td>
                                            <td className="p-2">{link.nombre_rifa}</td>
                                            <td className="p-2 font-mono text-yellow-300">{link.codigo}</td>
                                            <td className="p-2">{new Date(link.vence).toLocaleString()}</td>
                                            <td className="px-4 py-2 text-center">
                                              {link.usado ? (
                                                <span className="text-red-400 flex items-center justify-center gap-1">
                                                    <X size={18}/> Usado
                                                </span>
                                              ) : link.expirado ? (
                                                <span className="text-yellow-400 flex items-center justify-center gap-1">
                                                    <X size={18}/> Expirado
                                                </span>
                                              ) : (
                                                <span className="text-green-400 flex items-center justify-center gap-1">
                                                    <Check size={18}/> Disponible
                                                </span>
                                              )}

                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {!link.usado && !link.expirado && (
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

                            {/* Paginación */}
                            <div className="flex justify-center mt-4 space-x-4 text-sm">
                                <button
                                    onClick={() => fetchLinksReferidos(paginaLinks - 1)}
                                    disabled={paginaLinks <= 1}
                                    className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
                                >
                                    ← Anterior
                                </button>
                                <span>Página {paginaLinks} de {totalPaginasLinks}</span>
                                <button
                                    onClick={() => fetchLinksReferidos(paginaLinks + 1)}
                                    disabled={paginaLinks >= totalPaginasLinks}
                                    className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );

};

export default ConfiguracionReferidosAdmin;