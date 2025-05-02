// Caja3D.jsx — Caja sorpresa en 3D con mejoras visuales
import React from "react";
import { motion } from "framer-motion";

const Caja3D = () => {
  const confettiColors = ["#FF69B4", "#FFD700", "#00FFFF", "#ADFF2F", "#FF4500"];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 via-purple-900 to-pink-950 overflow-hidden text-white">
      {/* Luz de fondo */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-pink-300/30 rounded-full blur-[180px] animate-pulse-slow"></div>

      {/* Confeti animado de colores */}
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
        <h1 className="text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 text-transparent bg-clip-text animate-pulse">
            Participa y gana</h1>


      {/* Caja flotante 3D con moño y signos de interrogación */}
      <div className="[perspective:1000px] z-10 mt-4">
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
      </div>

      {/* Botón festivo */}
      <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="mt-6 px-8 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-lg shadow-md hover:shadow-pink-300 transition-all border-2 border-white/20 backdrop-blur-sm"
>
  🎁 Participar ahora
</motion.button>

        <div className="max-w-xl mt-10 text-center text-white/80 text-sm bg-white/10 rounded-xl px-6 py-4 backdrop-blur-sm shadow-md">
  <h2 className="text-lg font-semibold text-pink-300 mb-2">¿Qué es la Caja Sorpresa?</h2>
  <p className="mb-2">
    Cada caja contiene un premio aleatorio: desde boletos normales, descuentos, cajas repetidas o incluso un <b>boleto exclusivo</b> para una rifa especial.
  </p>
  <p className="mb-2">
    ¡Además, cada compra participa automáticamente en el <span className="text-yellow-300 font-semibold">Jackpot!</span>
  </p>
  <p className="text-white/60 text-xs">* Nadie se queda sin premio. Todos los premios se otorgan al instante.</p>
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
        @keyframes spin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }

        @keyframes float {
          0% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-20px); opacity: 0.6; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Caja3D;
