// src/pages/UsarLink.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RifaCard from "../components/RifaCard";

const UsarLink = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();

  const [estado, setEstado] = useState("cargando"); // 'cargando', 'valido', 'invalido'
  const [rifa, setRifa] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const validarLink = async () => {
      try {
        const response = await fetch(`https://www.rifandoando.club/api/usar-link/${codigo}/`);
        const data = await response.json();

        if (data.success) {
            setRifa({
                id: data.rifa_id,
                nombre: data.rifa_nombre,
            });
            localStorage.setItem('codigo_referido', data.codigo_referido); // Guardarlo aquí
            setEstado("valido");
        }else {
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

  if (estado === "cargando") {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Cargando...</p>
      </div>
    );
  }

  if (estado === "invalido") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Link no válido</h1>
        <p className="mb-6">{mensaje}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl transition"
        >
          Ir al Inicio
        </button>
      </div>
    );
  }

  if (estado === "valido" && rifa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🎉 ¡Has sido invitado! Participa en esta rifa:
        </h1>

        <div className="max-w-sm w-full">
          <RifaCard
            id={rifa.id}
            nombre={rifa.nombre}
            descripcion=""
            precio=""
            imagenes={[]}
            boletos_disponibles={0}
            total_boletos={0}
            fecha_fin=""
            mostrarBoton={true}
            mostrarCompartir={false}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default UsarLink;
