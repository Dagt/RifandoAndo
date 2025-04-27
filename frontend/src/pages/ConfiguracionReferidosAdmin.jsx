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

  const handlePremiosChange = (index, field, value) => {
    const nuevosPremios = Array.isArray(configuracion?.reglas_premios) ? [...configuracion.reglas_premios] : [];
    nuevosPremios[index][field] = parseInt(value, 10);
    setConfiguracion(prev => ({ ...prev, reglas_premios: nuevosPremios }));
  };

  const agregarRegla = () => {
    const nuevosPremios = Array.isArray(configuracion?.reglas_premios) ? [...configuracion.reglas_premios] : [];
    setConfiguracion(prev => ({
      ...prev,
      reglas_premios: [...nuevosPremios, { minimo: 0, boletos: 0 }]
    }));
  };

  const eliminarRegla = (index) => {
    const nuevosPremios = Array.isArray(configuracion?.reglas_premios) ? [...configuracion.reglas_premios] : [];
    nuevosPremios.splice(index, 1);
    setConfiguracion(prev => ({ ...prev, reglas_premios: nuevosPremios }));
  };

  const guardarConfiguracion = () => {
    fetch("/api/configuracion-referidos/actualizar/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configuracion)
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

  const reglasPremios = Array.isArray(configuracion?.reglas_premios) ? configuracion.reglas_premios : [];

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">⚙️ Programa de Referidos</h2>

      {mensaje && (
        <div className="mb-6 text-center p-3 rounded-lg bg-white/10 text-sm font-semibold">
          {mensaje}
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-md max-w-4xl mx-auto space-y-6">

        <div className="flex items-center gap-4">
          <label className="font-semibold text-lg">Programa Activo:</label>
          <input
            type="checkbox"
            name="activo"
            checked={configuracion.activo}
            onChange={handleInputChange}
            className="w-5 h-5"
          />
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

        <div className="flex items-center gap-4">
          <label className="font-semibold text-lg">Permitir cadenas de referidos:</label>
          <input
            type="checkbox"
            name="permitir_cadena_referidos"
            checked={configuracion.permitir_cadena_referidos}
            onChange={handleInputChange}
            className="w-5 h-5"
          />
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">🎯 Reglas de Premios</h3>

          {reglasPremios.map((regla, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={regla.minimo}
                onChange={e => handlePremiosChange(index, "minimo", e.target.value)}
                placeholder="Monto mínimo"
                className="p-2 rounded bg-white/20 text-white w-32"
              />
              <input
                type="number"
                value={regla.boletos}
                onChange={e => handlePremiosChange(index, "boletos", e.target.value)}
                placeholder="Boletos"
                className="p-2 rounded bg-white/20 text-white w-32"
              />
              <button
                onClick={() => eliminarRegla(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                ✖
              </button>
            </div>
          ))}

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
