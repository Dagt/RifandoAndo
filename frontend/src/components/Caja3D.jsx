import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RifaCardExclusiva from "../components/RifaCardExclusiva";
import { Gift } from "lucide-react";

const Caja3D = () => {
  const confettiColors = ["#FACC15", "#FB923C", "#F472B6", "#86EFAC", "#60A5FA"];
  const [rifa, setRifa] = useState(null);
  const [jackpot, setJackpot] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0); // asegurarse que cargue desde arriba
    const fetchDatos = async () => {
      try {
        const res = await fetch("/api/exclusiva/rifas-activas/");
        const data = await res.json();
        setRifa(data.rifa);
        setJackpot(data.jackpot);
      } catch (error) {
        console.error("Error al cargar datos de la rifa activa:", error);
      }
    };
    fetchDatos();
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden text-white px-4">
      {/* Luz de fondo */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-yellow-200/10 rounded-full blur-[180px] animate-pulse-slow"></div>

      {/* Confeti animado */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-float"
            style={{
              backgroundColor: confettiColors[i % confettiColors.length],
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>

      <h1 className="text-6xl font-extrabold text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-yellow-300 drop-shadow-[0_5px_15px_rgba(255,255,255,0.25)] z-10 leading-tight font-serif tracking-wide">
        V.I.P
      </h1>

      {/* Cards y caja */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-y-12 gap-x-12 w-full max-w-7xl z-10">
        <div className="flex-1 max-w-md w-full">
          <RifaCardExclusiva data={rifa ?? { nombre: "Próximamente" }} modo="exclusiva" />
        </div>

        <div className="flex flex-col items-center justify-center">
          <motion.div
          className="w-48 h-48 relative [transform-style:preserve-3d] animate-spin-slow"
          animate={{ rotateY: 360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        >
          {['front', 'back', 'left', 'right', 'top', 'bottom'].map((face) => (
            <div
              key={face}
              className={`absolute w-48 h-48 bg-gradient-to-br from-red-500 via-yellow-300 to-red-400 border-[3px] border-white/30 rounded-xl shadow-2xl ${face}`}
            >

              <div className="absolute inset-0 flex items-center justify-center text-[9rem] font-black text-red-500 drop-shadow-lg">
                ?
              </div>
            </div>
          ))}


        </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-10 py-4 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold text-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.6)] transition-all border border-white/20 backdrop-blur-md flex items-center gap-3"
          >
            <Gift className="w-6 h-6 text-black" /> ¡Abrir caja sorpresa!
          </motion.button>
        </div>

        <div className="flex-1 max-w-md w-full">
          <RifaCardExclusiva data={jackpot ?? { nombre: "Próximamente" }} modo="jackpot" />
        </div>
      </div>

      {/* Descripción */}
      <div className="max-w-xl mt-20 text-center text-white/90 text-base bg-white/10 rounded-2xl px-8 py-6 backdrop-blur-md shadow-xl z-10">
        <h2 className="text-xl font-semibold text-yellow-300 mb-3">¿Qué es la Caja Sorpresa?</h2>
        <p className="mb-2">
          Cada caja contiene un premio aleatorio: desde boletos normales, descuentos, cajas repetidas o incluso un <b>boleto exclusivo</b> para una rifa especial.
        </p>
        <p className="mb-2">
          ¡Además, cada compra participa automáticamente en el <span className="text-pink-400 font-semibold">Jackpot</span>!
        </p>
        <p className="text-white/50 text-xs">* Nadie se queda sin premio. Todos los premios se otorgan al instante.</p>
      </div>

      <style>{`
        .front { transform: rotateY(0deg) translateZ(6rem); }
        .back { transform: rotateY(180deg) translateZ(6rem); }
        .left { transform: rotateY(-90deg) translateZ(6rem); }
        .right { transform: rotateY(90deg) translateZ(6rem); }
        .top { transform: rotateX(90deg) translateZ(6rem); }
        .bottom { transform: rotateX(-90deg) translateZ(6rem); }

        .animate-spin-slow { animation: spin 30s linear infinite; }
        .animate-pulse-slow { animation: pulse 4s ease-in-out infinite; }

        @keyframes spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }

        @keyframes float {
          0% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-20px); opacity: 0.6; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .animate-float { animation: float ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Caja3D;
