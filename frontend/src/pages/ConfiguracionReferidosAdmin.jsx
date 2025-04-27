import React, { useEffect, useState } from "react";

const ConfiguracionReferidosAdmin = () => {
  const [configuracion, setConfiguracion] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("/api/configuracion-referidos/")
      .then(res => res.json())
      .then(data => setConfiguracion(data))
      .catch(() => setMensaje("❌ No se pudo cargar la configuración."));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfiguracion(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSwitchToggle = (campo) => {
    setConfiguracion(prev => ({
      ...prev,
      [campo]: !prev[campo]
    }));
  };

  const handlePremiosChange = (index, field, value) => {
    const nuevosPremios = [...configuracion.reglas_premios];
    nuevosPremios[index][field] = parseInt(value, 10);
    setConfiguracion(prev => ({ ...prev, reglas_premios: nuevosPremios }));
  };

  const agregarRegla = () => {
    setConfiguracion(prev => ({
      ...prev,
      reglas_premios: [...prev.reglas_premios, { minimo: 0, boletos: 0 }]
    }));
  };

  const eliminarRegla = (index) => {
    const nuevosPremios = [...configuracion.reglas_premios];
    nuevosPremios.splice(index, 1);
    setConfiguracion(prev => ({ ...prev, reglas_premios: nuevosPremios }));
  };

  const guardarConfiguracion = () => {
    // Ordenar reglas antes de guardar
    const reglasOrdenadas = [...configuracion.reglas_premios].sort((a, b) => a.minimo - b.minimo);
    const nuevaConfig = { ...configuracion, reglas_premios: reglasOrdenadas };

    fetch("/api/configuracion-referidos/actualizar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaConfig)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setMensaje("✅ Configuración actualizada correctamente.");
      } else {
        setMensaje("❌ Hubo un problema al actualizar.");
      }
    })
    .catch(() => setMensaje("❌ Error de conexión al guardar."));
  };

  if (!configuracion) {
    return <p className="text-white text-center mt-10">Cargando configuración...</p>;
  }

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">⚙️ Programa de Referidos</h2>

      {mensaje && (
        <div className="mb-6 text-center p-3 rounded-lg bg-white/10 text-sm font-semibold">
          {mensaje}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-md max-w-4xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <label className="font-semibold text-lg">Programa Activo:</label>
          <button
            onClick={() => handleSwitchToggle('activo')}
            className={`w-14 h-8 rounded-full flex items-center px-1 ${configuracion.activo ? 'bg-emerald-400' : 'bg-white/20'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full transform ${configuracion.activo ? 'translate-x-6' : ''} transition`} />
          </button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label className="block mb-1 text-sm text-white/80">Monto mínimo para generar link ($):</label>
            <input
              type="number"
              name="monto_minimo_para_generar"
              value={configuracion.monto_minimo_para_generar}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-white/20 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm text-white/80">Monto mínimo para validar compra ($):</label>
            <input
              type="number"
              name="monto_minimo_para_validar"
              value={configuracion.monto_minimo_para_validar}
              onChange={handleInputChange}
              className="w-full p-2 rounded bg-white/20 text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="font-semibold text-lg">Permitir cadenas de referidos:</label>
          <button
            onClick={() => handleSwitchToggle('permitir_cadena_referidos')}
            className={`w-14 h-8 rounded-full flex items-center px-1 ${configuracion.permitir_cadena_referidos ? 'bg-emerald-400' : 'bg-white/20'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full transform ${configuracion.permitir_cadena_referidos ? 'translate-x-6' : ''} transition`} />
          </button>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">🎯 Reglas de Premios</h3>
          <p className="text-sm text-white/80 mb-4">
            Define los montos mínimos que debe gastar quien use tu link de referido para otorgar boletos de regalo.
          </p>

          {Array.isArray(configuracion.reglas_premios) && configuracion.reglas_premios.length > 0 ? (
  configuracion.reglas_premios.map((regla, index) => (
    <div key={index} className="flex items-center gap-2 mb-2">
      <input
        type="number"
        value={regla.minimo}
        onChange={e => handlePremiosChange(index, "minimo", e.target.value)}
        placeholder="Monto mínimo ($)"
        className="p-2 rounded bg-white/20 text-white w-32"
      />
      <input
        type="number"
        value={regla.boletos}
        onChange={e => handlePremiosChange(index, "boletos", e.target.value)}
        placeholder="Boletos de regalo"
        className="p-2 rounded bg-white/20 text-white w-32"
      />
      <button
        onClick={() => eliminarRegla(index)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
      >
        ✖
      </button>
    </div>
  ))
) : (
  <p className="text-white/60 italic mb-4">No hay reglas configuradas aún.</p>
)}

          <button
            onClick={agregarRegla}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            ➕ Agregar Regla
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={guardarConfiguracion}
            className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-lg"
          >
            Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfiguracionReferidosAdmin;
