import React, { useEffect, useState } from "react";
import { Gift, Ticket, Clock, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const RifaCard = ({
  id,
  nombre,
  descripcion,
  precio,
  imagenes = [],
  boletos_disponibles,
  total_boletos,
  fecha_fin,
  mostrarBoton = true,
}) => {
  const [tiempoRestante, setTiempoRestante] = useState("");

  useEffect(() => {
    const calcularTiempo = () => {
      const fin = new Date(fecha_fin);
      const ahora = new Date();
      const diferencia = fin - ahora;

      if (isNaN(diferencia)) {
        setTiempoRestante("Fecha inválida");
        return;
      }

      if (diferencia <= 0) {
        setTiempoRestante("¡Finalizada!");
      } else {
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
        const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
        const segundos = Math.floor((diferencia / 1000) % 60);
        setTiempoRestante(`${dias}d ${horas}h ${minutos}m ${segundos}s`);
      }
    };

    calcularTiempo();
    const interval = setInterval(calcularTiempo, 1000);
    return () => clearInterval(interval);
  }, [fecha_fin]);

  const boletosVendidos = total_boletos - boletos_disponibles;
  const porcentajeVendido = (boletosVendidos / total_boletos) * 100;

  const compartirRifa = () => {
    const url = `https://www.rifandoando.club/`;
    const texto = `¡Mira esta rifa: "${nombre}" en Rifando Ando! Participa aquí:\n${url}`;

    if (navigator.share) {
      navigator.share({
  title: nombre,
  text: `¡Mira esta rifa: "${nombre}" en Rifando Ando!`,
  url: `https://www.rifandoando.club/rifa/${id}/participar`,
}).catch((err) => console.error("Error al compartir", err));
    } else {
      navigator.clipboard.writeText(texto);
      alert("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 w-full max-w-sm text-white">
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
              src="https://via.placeholder.com/400x300?text=Rifa"
              alt="placeholder"
              className="h-52 w-full object-cover"
            />
          </div>
        )}
      </Carousel>

      <div className="p-5">
        <h2 className="text-xl font-extrabold text-center flex justify-center items-center gap-2 mb-1 text-orange-300">
          <Gift className="w-6 h-6 text-purple-300" />
          {nombre}
        </h2>

        {descripcion && (
          <p className="text-sm text-purple-200 text-center mb-2 line-clamp-2">{descripcion}</p>
        )}

        <p className="text-sm text-green-300 text-center flex items-center justify-center gap-1 mb-1">
          <Ticket className="w-4 h-4 text-green-300" />
          ${precio} por boleto
        </p>

        <p className="text-center text-sm text-white mb-2">
          🎟️ {boletos_disponibles} / {total_boletos} disponibles
        </p>

        <div className="w-full bg-white/20 h-3 rounded-full mb-2">
          <div
            className="bg-gradient-to-r from-orange-400 to-pink-500 h-3 rounded-full transition-all"
            style={{ width: `${porcentajeVendido}%` }}
          ></div>
        </div>

        <p className="text-sm text-center text-white flex items-center justify-center gap-1 mb-4">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{tiempoRestante}</span>
        </p>

        {mostrarBoton && (
          <>
            <Link to={`/rifa/${id}/participar`}>
              <button className="w-full bg-pink-500 text-white py-2 font-semibold rounded-xl hover:bg-pink-600 transition">
                Participar
              </button>
            </Link>

            <button
              onClick={compartirRifa}
              className="mt-2 w-full border border-white/20 text-white py-2 font-semibold rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Compartir
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RifaCard;
