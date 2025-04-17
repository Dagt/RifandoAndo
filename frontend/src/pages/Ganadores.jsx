import React, { useEffect, useState } from "react";
import { Trophy, Sparkles, PartyPopper } from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Ganadores = () => {
  const [rifas, setRifas] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("https://rifandoando.club:8000/api/rifas-finalizadas/")
      .then((res) => res.json())
      .then((data) => {
        const finalizadas = data
          .filter((r) => r.estado === "finalizada")
          .sort((a, b) => new Date(b.fecha_fin) - new Date(a.fecha_fin));
        setRifas(finalizadas);
      });
  }, []);

  const formatearNumero = (n, total) => {
    const longitud = total.toString().length;
    return String(n).padStart(longitud, "0");
  };

  const obtenerGanador = (rifa) => {
    if (!rifa.numero_ganador || !rifa.boletos_pagados) return null;
    const match = rifa.boletos_pagados.find(
      (b) => b.numero === rifa.numero_ganador
    );
    return match ? match.transaccion.nombre_completo : null;
  };

  return (
    <div className="min-h-screen p-6 text-white relative z-10">
      <h1 className="text-4xl font-extrabold text-center mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-300 to-pink-400 text-transparent bg-clip-text">
        <Trophy className="w-8 h-8 text-yellow-300" />
        Resultados de Rifas Finalizadas
        <Trophy className="w-8 h-8 text-yellow-300" />
      </h1>

      {/* Contador */}
      <div className="text-center text-lg mb-8">
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-bold shadow-lg animate-bounce mx-auto">
            Rifas Completadas: {rifas.length}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {rifas.map((rifa) => {
          const ganadorNombre = obtenerGanador(rifa);
          return (
            <div
              key={rifa.id}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg animate-pulse-slow transition-all duration-500 hover:scale-[1.01]"
            >
              <h2 className="text-xl font-bold text-center text-yellow-300 mb-1 flex items-center justify-center gap-1">
                <Sparkles className="w-5 h-5 text-pink-400" />
                {rifa.nombre}
                <Sparkles className="w-5 h-5 text-pink-400" />
              </h2>

              <p className="text-sm text-white/70 text-center mb-1">
                Fecha del sorteo:{" "}
                <strong>
                  {new Date(rifa.fecha_fin).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>
              </p>

              {rifa.numero_ganador !== null ? (
                <div className="text-center my-3">
                  <p className="text-md text-white/90">Número ganador:</p>
                  <p className="text-4xl font-extrabold text-green-400 tracking-wide">
                    {formatearNumero(rifa.numero_ganador, rifa.total_boletos)}
                  </p>
                  {ganadorNombre ? (
                    <p className="mt-1 text-pink-400 font-bold text-sm flex items-center justify-center gap-1">
                      Ganador: {ganadorNombre}
                    </p>
                  ) : (
                    <p className="text-sm text-red-300 mt-1">
                      ⚠️ El número ganador no fue vendido.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-center text-red-400 mt-2">
                  ⚠️ No se ha cargado el número ganador aún.
                </p>
              )}

              {/* Carrusel de imágenes */}
              {rifa.imagenes.length > 0 && (
                <div className="mt-4">
                  <Carousel
                    autoPlay
                    infiniteLoop
                    showThumbs={false}
                    showStatus={false}
                    interval={5000}
                    className="rounded overflow-hidden"
                  >
                    {rifa.imagenes.slice(0, 5).map((img, idx) => (
                      <div key={idx}>
                        <img
                          src={img}
                          alt={`Premio ${idx + 1}`}
                          className="h-44 w-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}

              {/* Video */}
              {rifa.enlace_video && (
                <div className="mt-4 text-center">
                  <a
                    href={rifa.enlace_video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-500 underline"
                  >
                    Ver video del sorteo en YouTube →
                  </a>
                </div>
              )}

              {/* Lotenal link */}
              <div className="mt-3 text-center">
                <a
                  href="https://www.lotenal.gob.mx/sorteos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-yellow-300 underline hover:text-yellow-400"
                >
                  Ver resultados oficiales en lotenal.gob.mx →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {rifas.length === 0 && (
        <p className="text-center text-white/70 mt-10">
          Aún no hay rifas finalizadas disponibles.
        </p>
      )}
    </div>
  );
};

export default Ganadores;
