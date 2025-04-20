// src/pages/Proximas.jsx

import React, { useEffect, useState } from "react";
import RifaCard from "../components/RifaCard";

const Proximas = () => {
  const [rifas, setRifas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/proximas-rifas/")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar las rifas.");
        return res.json();
      })
      .then((data) => {
        setRifas(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-4xl font-extrabold text-center text-blue-400 mb-6">
        Próximas Rifas
      </h1>

      {cargando && <p className="text-center text-white/70">Cargando rifas...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      <div className="flex flex-wrap justify-center gap-6">
        {rifas.map((rifa) => (
          <RifaCard
            key={rifa.id}
            id={rifa.id}
            nombre={rifa.nombre}
            precio={rifa.precio_boleto}
            descripcion={rifa.descripcion}
            imagenes={rifa.imagenes}
            boletos_disponibles={rifa.total_boletos - (rifa.boletos_vendidos || 0)}
            total_boletos={rifa.total_boletos}
            fecha_fin={rifa.fecha_inicio}
            mostrarBoton={false}
            mostrarCompartir={true}
          />
        ))}
      </div>

      {rifas.length === 0 && !cargando && (
        <p className="text-center text-white/70 mt-10">Aún no hay rifas programadas.</p>
      )}
    </div>
  );
};

export default Proximas;
