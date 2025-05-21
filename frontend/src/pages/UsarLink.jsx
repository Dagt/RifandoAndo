// src/pages/UsarLink.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RifaCard from "../components/RifaCard";
import { XCircle } from "lucide-react";

const UsarLink = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [estado, setEstado] = useState("cargando"); // 'cargando', 'valido', 'invalido'
  const [rifa, setRifa] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const validarLink = async () => {
      try {
        const response = await fetch(`/api/usar-link/${codigo}/`);
        const data = await response.json();

        if (data.success) {
          const rifaData = data.rifa;
          setRifa({
            id: rifaData.id,
            nombre: rifaData.nombre,
            descripcion: rifaData.descripcion,
            precio: rifaData.precio_boleto,
            imagenes: rifaData.imagenes,
            boletos_disponibles: rifaData.boletos_disponibles,
            total_boletos: rifaData.total_boletos,
            fecha_fin: rifaData.fecha_fin,
          });
          localStorage.setItem('codigo_referido', data.codigo_referido);
          localStorage.setItem('rifa_referida', data.rifa.id);
          setEstado("valido");
        } else {
          setMensaje(data.mensaje || "El link no es válido.");
          setEstado("invalido");
        }
      } catch (error) {
        console.error("Error validando link:", error);
        setMensaje("Error de conexión. Intenta más tarde.");
        setEstado("invalido");
      }
    };

    validarLink();
  }, [codigo]);

  const renderMensaje = (icono, titulo, descripcion, color, botonTexto, botonAccion) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white text-center">
      <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md w-full">
        {icono}
        <h1 className="text-2xl font-bold" style={{ color }}>{titulo}</h1>
        <p className="text-white/80">{descripcion}</p>
        <button
          onClick={botonAccion}
          className="mt-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl transition font-semibold"
        >
          {botonTexto}
        </button>
      </div>
    </div>
  );

  if (estado === "cargando") {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Cargando...</p>
      </div>
    );
  }

  if (estado === "invalido") {
    return renderMensaje(
      <XCircle className="w-16 h-16 text-red-400" />,
      "Link no válido",
      mensaje,
      "#f87171", // rojo claro
      "Ir al Inicio",
      () => navigate("/")
    );
  }

  if (estado === "valido" && rifa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-sm w-full">
          <RifaCard
            id={rifa.id}
            nombre={rifa.nombre}
            descripcion={rifa.descripcion}
            precio={rifa.precio}
            imagenes={rifa.imagenes}
            boletos_disponibles={rifa.boletos_disponibles}
            total_boletos={rifa.total_boletos}
            fecha_fin={rifa.fecha_fin}
            mostrarBoton={true}
            mostrarCompartir={false}
            mensajeExtra={
              <div className="flex flex-col items-center justify-center mb-4">
                {/* Circulito bonito */}
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-yellow-300 shadow-lg mb-2">
                  <span className="text-4xl">🎊</span>
                </div>
                {/* Texto abajo */}
                <p className="text-sm font-semibold text-green-300">
                  ¡Te han invitado a participar en esta rifa!
                </p>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return null;
};

export default UsarLink;
