// src/pages/RifaDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RifaCard from "../components/RifaCard";

const RifaDetalle = () => {
  const { id } = useParams();
  const [rifa, setRifa] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/rifas/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la rifa.");
        return res.json();
      })
      .then((data) => {
        setRifa(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, [id]);

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-orange-400 mb-6">
         Mira esta rifa!!!
      </h1>

      {cargando && <p className="text-center text-white/70">Cargando rifa...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {rifa && (
        <div className="flex justify-center">
          <RifaCard
            id={rifa.id}
            nombre={rifa.nombre}
            precio={rifa.precio_boleto}
            descripcion={rifa.descripcion}
            imagenes={Array.isArray(rifa.imagenes) ? rifa.imagenes : []}
            boletos_disponibles={rifa.total_boletos - (rifa.boletos_vendidos || 0)}
            total_boletos={rifa.total_boletos}
            fecha_fin={rifa.fecha_fin}
            mostrarBoton={rifa.estado === "activa"}
            mostrarCompartir={rifa.estado !== "finalizada"}
          />
        </div>
      )}

      {/* Espacio decorativo para evitar que se vea vacía */}
      <div className="mt-12 text-center text-white/50 text-sm">
        <p>¡Mucha suerte! 🍀 Recuerda revisar los resultados al finalizar la rifa.</p>
        <p className="mt-1 italic">Puedes compartir esta rifa con tus amigos y familia.</p>
      </div>
    </div>
  );
};

export default RifaDetalle;
