import React, { useEffect, useState } from "react";
import { Trash2, PlusCircle, RefreshCcw } from "lucide-react";

const ConfiguracionReferidosAdmin = () => {
  const [configuracion, setConfiguracion] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [nuevoMinimoGenerar, setNuevoMinimoGenerar] = useState("");
  const [nuevoMinimoValidar, setNuevoMinimoValidar] = useState("");
  const [nuevoMinimoRegla, setNuevoMinimoRegla] = useState("");
  const [nuevoBoletosRegla, setNuevoBoletosRegla] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/configuracion-referidos/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setConfiguracion({
        ...data,
        reglas_premios: data.reglas_premios || []
      }))
      .catch(() => setMensaje("❌ No se pudo cargar la configuración."));
  }, [token]);

  const toggleSwitch = (campo) => {
    fetch(`/api/configuracion-referidos/toggle/${campo}/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
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

  const eliminarRegla = (index) => {
    fetch(`/api/configuracion-referidos/eliminar-regla/${index}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const nuevas = [...configuracion.reglas_premios];
        nuevas.splice(index, 1);
        setConfiguracion(prev => ({ ...prev, reglas_premios: nuevas }));
        setMensaje("✅ Regla eliminada.");
      }
    });
  };

  if (!configuracion) {
    return <p className="text-white text-center mt-10">Cargando configuración...</p>;
  }

  return (
    <div className="min-h-screen p-6 text-white">
      {/* Tu renderizado visual como lo tenías */}
    </div>
  );
};

export default ConfiguracionReferidosAdmin;
