import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import RifaCardExclusiva from "../components/RifaCardExclusiva";
import { Gift, ChevronUp, X } from "lucide-react";

const Caja3D = () => {
  const confettiColors = ["#FACC15", "#FB923C", "#F472B6", "#86EFAC", "#60A5FA"];
  const [rifa, setRifa] = useState(null);
  const [jackpot, setJackpot] = useState(null);
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    window.scrollTo(0, 0);
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

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setMostrarDescripcion(false);
    }
  };

  useEffect(() => {
    if (mostrarDescripcion) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mostrarDescripcion]);

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden text-white px-4 pt-[100px] pb-24 -mt-[64px] z-0">
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

      <h1 className="text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-yellow-300 drop-shadow-[0_5px_15px_rgba(255,255,255,0.25)] z-10 leading-tight font-serif tracking-wide mb-6">
        V.I.P
      </h1>

      {/* Contenido reorganizado */}
      <div className="flex flex-col items-center justify-center gap-y-12 lg:flex-row lg:justify-between gap-x-12 w-full max-w-7xl z-10">
        {/* Caja giratoria y botón */}
        <div className="order-1 lg:order-2 flex flex-col items-center justify-center">
          <motion.div
            className="w-48 h-48 relative [transform-style:preserve-3d] animate-spin-slow"
            animate={{ rotateY: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          >
            {["front", "back", "left", "right", "top", "bottom"].map((face) => (
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

        {/* Tarjeta de rifa exclusiva */}
        <div className="order-2 lg:order-1 flex-1 max-w-md w-full">
          <RifaCardExclusiva data={rifa ?? { nombre: "Próximamente" }} modo="exclusiva" />
        </div>

        {/* Tarjeta de jackpot */}
        <div className="order-4 lg:order-3 flex-1 max-w-md w-full">
          <RifaCardExclusiva data={jackpot ?? { nombre: "Próximamente" }} modo="jackpot" />
        </div>
      </div>

      {/* Botón de descripción */}
      <button
        onClick={() => setMostrarDescripcion(!mostrarDescripcion)}
        className="order-3 lg:order-4 fixed bottom-0 z-20 bg-white/10 backdrop-blur-md text-yellow-300 text-lg font-bold px-6 py-3 rounded-t-xl flex items-center gap-2 hover:bg-white/20 border-t border-white/20"
      >
        <ChevronUp className="w-5 h-5" /> ¿Qué es la Caja Sorpresa?
      </button>

      {/* Descripción desplegable */}
      {mostrarDescripcion && (
        <div className="fixed inset-0 z-30 flex items-start justify-center px-4 pt-[100px] overflow-y-auto bg-black/80">
          <div ref={modalRef} className="relative w-full max-w-xl bg-gray-900/90 rounded-2xl px-6 py-6 backdrop-blur-md shadow-2xl text-white border border-white/10">
            <button
              onClick={() => setMostrarDescripcion(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">¿Qué es la Caja Sorpresa?</h2>
            <p className="mb-4">
              Al comprar una <strong>Caja Sorpresa</strong>, <span className="text-yellow-200">¡siempre recibes un premio!</span> Los premios pueden incluir:
            </p>
            <ul className="list-disc list-inside mb-4 text-white/90 space-y-1">
              <li>Boletos normales para rifas activas</li>
              <li>Códigos de descuento</li>
              <li>Cajas gratis tipo "repetida"</li>
              <li>Boletos exclusivos para la Rifa Exclusiva</li>
            </ul>
            <p className="mb-4">
              Además, <strong>cada caja incluye un boleto automático para el Jackpot</strong>. El Jackpot es un premio acumulado con un porcentaje de cada caja comprada. Este gran premio se sorteará <strong>cuando se realice la Rifa Exclusiva</strong>.
            </p>
            <p className="mb-4">
              La <strong>Rifa Exclusiva</strong> es una rifa especial y de alto valor. Sólo puedes participar si obtienes un <strong>boleto exclusivo</strong> desde las cajas. Esta rifa <span className="text-pink-300 font-semibold">no se puede comprar directamente</span> y sólo se llevará a cabo cuando se hayan encontrado todos los boletos.
            </p>
            <p className="text-white/80">
              En resumen: <span className="text-yellow-200 font-medium">cada caja es una oportunidad garantizada de ganar</span>. ¡Acumula premios, entra al sorteo del Jackpot y busca tu boleto exclusivo!
            </p>
          </div>
        </div>
      )}

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
