import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();
  const rutaActual = location.pathname;

  // Detectar si estamos en una sección con estilo tipo CajasHome
  const esCaja = rutaActual.startsWith("/caja");

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-hidden">

      {/* Fondo degradado dinámico */}
      <div className={`fixed inset-0 z-[-20] transition-all duration-700 ${esCaja 
        ? "bg-gradient-to-br from-black via-gray-900 to-black" 
        : "bg-gradient-to-b from-indigo-900 to-purple-900"
      }`} />

      {/* Logo decorativo — centrado en móviles, esquina en desktop */}
      <div className="pointer-events-none fixed z-[-10]
                      w-[450px] h-[450px] bottom-[100px] right-1/2 translate-x-1/2
                      sm:w-[650px] sm:h-[650px]
                      md:w-[850px] md:h-[850px] md:bottom-[-180px] md:right-[-120px] md:translate-x-0">
        <img
          src="/static/logo.png" alt="" className="w-full h-full object-contain opacity-50"
        />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <div className="h-[64px] lg:h-[72px]" />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
