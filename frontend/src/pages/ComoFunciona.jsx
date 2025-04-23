import React from "react";
import { Gift, Search, DollarSign, Receipt, Share2, Sparkles } from "lucide-react";

const pasos = [
  {
    icono: <Gift className="w-8 h-8 text-pink-400" />,
    titulo: "Elige una rifa",
    texto: "Explora entre las rifas activas y selecciona la que más te guste.",
  },
  {
    icono: <Search className="w-8 h-8 text-yellow-400" />,
    titulo: "Selecciona tus números",
    texto: "Escoge los boletos que más te gusten o deja que la suerte lo haga.",
  },
  {
    icono: <DollarSign className="w-8 h-8 text-green-400" />,
    titulo: "Realiza el pago",
    texto: "Paga fácil por OXXO, transferencia o tarjeta desde la misma plataforma.",
  },
  {
    icono: <Receipt className="w-8 h-8 text-blue-400" />,
    titulo: "Recibe tu folio",
    texto: "Te mandamos tu folio por SMS, guárdalo bien para el sorteo.",
  },
  {
    icono: <Share2 className="w-8 h-8 text-purple-400" />,
    titulo: "Comparte",
    texto: "Cuéntale a tu familia o amigos y participen juntos.",
  },
  {
    icono: <Sparkles className="w-8 h-8 text-orange-400" />,
    titulo: "¡Cruza los dedos!",
    texto: "Espera el sorteo y revisa si eres el ganador. ¡Suerte!",
  },
];

const ComoFunciona = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-extrabold text-center text-yellow-400 mb-8">
        ¿Cómo funciona?
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pasos.map((paso, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-md p-5 rounded-xl shadow-lg flex flex-col items-center text-center transition hover:scale-105"
          >
            <div className="mb-3">{paso.icono}</div>
            <h2 className="text-lg font-bold mb-1 text-white">{paso.titulo}</h2>
            <p className="text-sm text-white/80">{paso.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComoFunciona;
