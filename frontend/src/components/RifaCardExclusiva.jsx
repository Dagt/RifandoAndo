import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkle, Crown, Ticket, PiggyBank, TicketCheck } from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const RifaCardExclusiva = ({ data = {}, modo = "exclusiva", mostrarCompartir = true }) => {
  const {
    id,
    nombre,
    descripcion,
    imagenes = [],
    boletos_encontrados = 0,
    total_boletos = 1,
    monto_acumulado = 0,
    imagen,
  } = data;

  const [porcentaje, setPorcentaje] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (modo === "exclusiva" && total_boletos > 0) {
      setPorcentaje((boletos_encontrados / total_boletos) * 100);
    }
  }, [boletos_encontrados, total_boletos, modo]);

  const verBoletos = () => {
    navigate(`/panel/rifa-exclusiva/${id}/boletos`);
  };

  return (
    <div className="relative z-20 rounded-[28px] overflow-visible shadow-2xl transition-all duration-300 w-full max-w-sm text-white border hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]
 border-white/10 backdrop-blur-md bg-black/30">
      {/* Lucecita trasera más sutil y borde redondeado completo */}
      <div className="absolute -inset-1 z-0 bg-yellow-200/2 blur-[20px] rounded-[32px]" />

      {/* Corona sobrepuesta */}
      {modo === "exclusiva" && (
        <div className="absolute -top-10 -left-5 z-30">
          <Crown className="w-14 h-14 text-yellow-300 rotate-[-20deg] drop-shadow-[0_0_8px_rgba(255,255,0,0.35)]" />
        </div>
      )}

      {/* Imagen superior */}
      {modo === "exclusiva" ? (
        <div className="relative h-64 z-10 rounded-t-[28px] overflow-hidden">
          <Carousel
            showThumbs={false}
            showStatus={false}
            infiniteLoop
            autoPlay
            interval={5000}
            stopOnHover
          >
            {imagenes.length > 0 ? (
              imagenes.map((img, index) => (
                <div key={index}>
                  <img src={img} alt={`Premio ${index + 1}`} className="h-64 w-full object-cover object-center opacity-70" />
                </div>
              ))
            ) : (
              <img
                src="https://via.placeholder.com/400x300?text=Premio+Exclusivo"
                alt="placeholder"
                className="h-64 w-full object-cover object-center opacity-70"
              />
            )}
          </Carousel>
        </div>
      ) : (
        <div className="relative h-64 w-full z-10 rounded-t-[28px] overflow-hidden">
          <img
            src="/static/jackpot3.png"
            alt="Jackpot"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="p-5 flex flex-col justify-between flex-grow font-sans tracking-wide z-10 bg-gradient-to-b from-black/30 to-black/80 rounded-b-[28px]">
        <h2 className="text-2xl font-semibold text-center flex justify-center items-center gap-2 mb-4 text-white">
          <Sparkle className="w-6 h-6 text-yellow-300 animate-pulse" />
          {nombre}
        </h2>

        {modo === "exclusiva" && descripcion && (
          <p className="text-sm text-neutral-300 text-center mb-3 line-clamp-2">{descripcion}</p>
        )}

        {modo === "exclusiva" && (
          <>
            <p className="text-lg text-center text-yellow-300 font-semibold mb-2 flex justify-center items-center gap-2 animate-pulse">
              <TicketCheck className="w-5 h-5" />
              {boletos_encontrados} / {total_boletos} boletos encontrados
            </p>
            <div className="w-full bg-white/20 h-3 rounded-full mb-4">
              <div
                className="bg-gradient-to-r from-yellow-300 to-pink-400 h-3 rounded-full transition-all"
                style={{ width: `${porcentaje}%` }}
              ></div>
            </div>
          </>
        )}

        {modo === "jackpot" && (
          <>
            <p className="text-lg text-center text-yellow-300 font-medium mb-2 flex justify-center items-center gap-2 animate-pulse">
              <PiggyBank className="w-5 h-5" /> Acumulado actual:
            </p>
            <p className="text-5xl text-center text-white font-extrabold mb-3 animate-pulse">
              ${parseFloat(monto_acumulado || 0).toLocaleString("es-MX")}
            </p>
          </>
        )}

        {mostrarCompartir && modo === "exclusiva" && (
          <button
            onClick={verBoletos}
            className="mt-auto w-full border border-yellow-400 text-yellow-300 py-2 font-semibold rounded-xl hover:bg-yellow-400/10 transition flex items-center justify-center gap-2"
          >
            <Ticket className="w-5 h-5" /> Ver boletos
          </button>
        )}
      </div>
    </div>
  );
};

export default RifaCardExclusiva;