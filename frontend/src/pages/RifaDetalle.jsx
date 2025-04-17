import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock } from "lucide-react"; // icono de reloj

const RifaDetalle = () => {
  const { id } = useParams();
  const [rifa, setRifa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tiempoRestante, setTiempoRestante] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`https://rifandoando.club:8000/api/rifas/${id}/`)
      .then(res => res.json())
      .then(data => {
        setRifa(data);
        setLoading(false);
        calcularTiempoRestante(data.fecha_fin);
      });
  }, [id]);

  useEffect(() => {
    if (!rifa) return;
    const interval = setInterval(() => {
      calcularTiempoRestante(rifa.fecha_fin);
    }, 1000);
    return () => clearInterval(interval);
  }, [rifa]);

  const calcularTiempoRestante = (fechaFin) => {
    const fin = new Date(fechaFin);
    const ahora = new Date();
    const diferencia = fin - ahora;

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

  if (loading) return <div className="text-center mt-10">Cargando rifa...</div>;

  if (!rifa) return <div className="text-center mt-10 text-red-500">Rifa no encontrada.</div>;

  const boletosVendidos = rifa.boletos_vendidos || 0;
  const porcentajeVendido = (boletosVendidos / rifa.total_boletos) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-200 p-4">
      <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-xl mt-6">
        {rifa.imagen_destacada && (
          <img
            src={rifa.imagen_destacada}
            alt={rifa.nombre}
            className="w-full h-64 object-cover rounded-md mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">{rifa.nombre}</h1>
        <p className="text-gray-600 text-center mb-4">{rifa.descripcion}</p>

        <div className="text-center mb-4">
          <p className="text-green-700 font-semibold text-lg">💰 ${rifa.precio_boleto} por boleto</p>
          <p className="text-blue-700 text-lg">🎟️ {rifa.total_boletos - boletosVendidos} disponibles / {rifa.total_boletos}</p>
        </div>

        <div className="w-full bg-gray-300 h-4 rounded-full mb-4">
          <div
            className="bg-pink-500 h-4 rounded-full transition-all"
            style={{ width: `${porcentajeVendido}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-center text-gray-700 text-sm mb-4 gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          Tiempo restante: <span className="font-semibold">{tiempoRestante}</span>
        </div>

        <button className="mt-4 w-full bg-pink-500 text-white py-2 font-bold rounded-xl hover:bg-pink-600 transition">
          Participar
        </button>
      </div>
    </div>
  );
};

export default RifaDetalle;
