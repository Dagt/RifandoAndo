import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle, RefreshCcw } from "lucide-react";

const ConfiguracionReferidosAdmin = () => {
  const [configuracion, setConfiguracion] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [nuevoMinimoGenerar, setNuevoMinimoGenerar] = useState("");
  const [nuevoMinimoValidar, setNuevoMinimoValidar] = useState("");
  const [nuevoMinimoRegla, setNuevoMinimoRegla] = useState("");
  const [nuevoBoletosRegla, setNuevoBoletosRegla] = useState("");

  useEffect(() => {
    fetch("/api/configuracion-referidos/", { credentials: "include" })
      .then(res => res.json())
      .then(data => setConfiguracion({
        ...data,
        reglas_premios: data.reglas_premios || []
      }))
      .catch(() => setMensaje("❌ No se pudo cargar la configuración."));
  }, []);

  const toggleSwitch = (campo) => {
    fetch("/api/configuracion-referidos/actualizar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ [campo]: !configuracion[campo] })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setConfiguracion(prev => ({ ...prev, [campo]: !prev[campo] }));
      }
    });
  };

  const actualizarMontosMinimos = () => {
    const payload = {};
    if (nuevoMinimoGenerar !== "") payload.monto_minimo_para_generar = parseFloat(nuevoMinimoGenerar);
    if (nuevoMinimoValidar !== "") payload.monto_minimo_para_validar = parseFloat(nuevoMinimoValidar);

    fetch("/api/configuracion-referidos/actualizar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setMensaje("✅ Montos actualizados correctamente.");
        setConfiguracion(prev => ({ ...prev, ...payload }));
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

    const nuevaRegla = { minimo: parseInt(nuevoMinimoRegla, 10), boletos: parseInt(nuevoBoletosRegla, 10) };

    fetch("/api/configuracion-referidos/actualizar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reglas_premios: [...(configuracion.reglas_premios || []), nuevaRegla] }),
      credentials: "include"
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

  const eliminarRegla = (index) => {
    const nuevasReglas = [...configuracion.reglas_premios];
    nuevasReglas.splice(index, 1);

    fetch("/api/configuracion-referidos/actualizar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reglas_premios: nuevasReglas }),
      credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setConfiguracion(prev => ({ ...prev, reglas_premios: nuevasReglas }));
        setMensaje("✅ Regla eliminada.");
      }
    });
  };

  if (!configuracion) {
    return <p className="text-white text-center mt-10">Cargando configuración...</p>;
  }

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">🔗 Links de Referidos</h2>

      {mensaje && (
        <div className="max-w-4xl mx-auto mb-6 text-center p-3 rounded-lg bg-white/10 text-sm font-semibold">
          {mensaje}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-md max-w-4xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <label className="font-semibold text-lg">Programa Activo:</label>
          <button
            onClick={() => toggleSwitch('activo')}
            className={`w-14 h-8 rounded-full flex items-center px-1 ${configuracion.activo ? 'bg-emerald-400' : 'bg-white/20'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full transform ${configuracion.activo ? 'translate-x-6' : ''} transition`} />
          </button>
        </div>

        {configuracion.activo && (
          <>
            <div className="flex items-center justify-between">
              <label className="font-semibold text-lg">Permitir Cadenas de Referidos:</label>
              <button
                onClick={() => toggleSwitch('permitir_cadena_referidos')}
                className={`w-14 h-8 rounded-full flex items-center px-1 ${configuracion.permitir_cadena_referidos ? 'bg-emerald-400' : 'bg-white/20'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transform ${configuracion.permitir_cadena_referidos ? 'translate-x-6' : ''} transition`} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold">Montos Mínimos</h3>
              <p className="text-white/80 text-sm">Actual: Generar Link = ${configuracion.monto_minimo_para_generar} | Validar Compra = ${configuracion.monto_minimo_para_validar}</p>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={nuevoMinimoGenerar}
                  onChange={(e) => setNuevoMinimoGenerar(e.target.value)}
                  placeholder="Nuevo mínimo para generar link ($)"
                  className="w-full p-2 rounded bg-white/20 text-white"
                />
                <input
                  type="number"
                  value={nuevoMinimoValidar}
                  onChange={(e) => setNuevoMinimoValidar(e.target.value)}
                  placeholder="Nuevo mínimo para validar compra ($)"
                  className="w-full p-2 rounded bg-white/20 text-white"
                />
                <button onClick={actualizarMontosMinimos} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg p-2">
                  <RefreshCcw size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">🎯 Reglas Activas</h3>
              {configuracion.reglas_premios.length > 0 ? (
                configuracion.reglas_premios.map((regla, index) => (
                  <div key={index} className="flex items-center gap-4 bg-white/5 rounded p-3">
                    <span className="flex-1">Compra mínima: <b>${regla.minimo}</b> ➔ Boletos: <b>{regla.boletos}</b></span>
                    <button onClick={() => eliminarRegla(index)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-white/60 italic">No hay reglas configuradas.</p>
              )}

              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input
                  type="number"
                  value={nuevoMinimoRegla}
                  onChange={(e) => setNuevoMinimoRegla(e.target.value)}
                  placeholder="Monto mínimo ($)"
                  className="p-2 rounded bg-white/20 text-white w-full md:w-1/2"
                />
                <input
                  type="number"
                  value={nuevoBoletosRegla}
                  onChange={(e) => setNuevoBoletosRegla(e.target.value)}
                  placeholder="Boletos a otorgar"
                  className="p-2 rounded bg-white/20 text-white w-full md:w-1/2"
                />
                <button onClick={agregarRegla} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg p-2">
                  <PlusCircle size={20} />
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ConfiguracionReferidosAdmin;
