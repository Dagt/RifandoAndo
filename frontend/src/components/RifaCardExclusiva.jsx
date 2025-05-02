import React, { useEffect, useState } from "react";
import { Gift, Ticket, Share2, Sparkle } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const RifaCardExclusiva = ({
  modo = "exclusiva", // o "jackpot"
  id,
  nombre,
  descripcion,
  imagenes = [],
  boletos_encontrados,
  total_boletos,
  monto_acumulado,
  imagen,
  mostrarCompartir = true,
}) => {
  const [porcentaje, setPorcentaje] = useState(0);

  useEffect(() => {
    if (modo === "exclusiva" && total_boletos > 0) {
      const vendidos = (boletos_encontrados / total_boletos) * 100;
      setPorcentaje(vendidos);
    }
  }, [boletos_encontrados, total_boletos, modo]);

  const compartir = () => {
    const url = `https://www.rifandoando.club/${modo === "jackpot" ? "jackpot" : `rifa-exclusiva/${id}`}`;
    const texto = `✨ Participa en ${modo === "jackpot" ? "el gran Jackpot" : `la rifa exclusiva: ${nombre}`} en Rifando Ando`;

    if (navigator.share) {
      navigator.share({ title: nombre, text: texto, url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Enlace copiado al portapapeles");
    }
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border-2 p-1 shadow-xl transition-all duration-300 w-full max-w-sm text-white ${
        modo === "jackpot"
          ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-yellow-400"
          : "bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 border-pink-400"
      }`}
    >
      <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
        {modo === "exclusiva" ? (
          <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
            {imagenes.length > 0 ? (
              imagenes.map((img, i) => (
                <div key={i}>
                  <img src={img} alt={`Premio ${i}`} className="h-52 w-full object-cover" />
                </div>
              ))
            ) : (
              <div>
                <img
                  src="https://via.placeholder.com/400x300?text=Premio+Exclusivo"
                  alt="placeholder"
                  className="h-52 w-full object-cover"
                />
              </div>
            )}
          </Carousel>
        ) : (
          <div className="h-52 w-full overflow-hidden">
            <img
              src={imagen || "/img/jackpot.jpg"}
              alt="Jackpot"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          <h2 className="text-xl font-extrabold text-center flex justify-center items-center gap-2 mb-2">
            <Sparkle className="w-5 h-5 text-yellow-300 animate-pulse" />
            {nombre}
          </h2>

          {modo === "exclusiva" && descripcion && (
            <p className="text-sm text-purple-100 text-center mb-2 line-clamp-2">{descripcion}</p>
          )}

          {modo === "exclusiva" && (
            <>
              <p className="text-sm text-center text-white mb-2">
                ✨ {boletos_encontrados} / {total_boletos} boletos han salido
              </p>
              <div className="w-full bg-white/20 h-3 rounded-full mb-3">
                <div
                  className="bg-gradient-to-r from-yellow-300 to-pink-400 h-3 rounded-full transition-all"
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>
            </>
          )}

          {modo === "jackpot" && (
            <>
              <p className="text-sm text-center text-black font-bold mb-2">
                🌟 Acumulado actual:
              </p>
              <p className="text-2xl text-center text-white font-extrabold mb-3">
                ${parseFloat(monto_acumulado).toLocaleString()}
              </p>
            </>
          )}

          {mostrarCompartir && (
            <button
              onClick={compartir}
              className="mt-1 w-full border border-white/20 text-white py-2 font-semibold rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" /> Compartir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RifaCardExclusiva;
