// src/pages/Contacto.jsx
import React from "react";
import { Mail, Phone, MessageCircle, Users, Megaphone } from "lucide-react";

const Contacto = () => {
  return (
    <div className="px-6 py-12 text-white text-center flex flex-col items-center max-w-3xl mx-auto">
      <Megaphone className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
      <h1 className="text-4xl font-extrabold text-orange-400 mb-4">¡Colabora con nosotros!</h1>

      <p className="text-white/80 mb-6 font-bold">
        ¿Tienes una idea para una rifa? ¿Representas una marca, negocio o influencer que quiere organizar un sorteo con nosotros?
        <br className="hidden sm:inline font-bold" /> Nos encantaría trabajar contigo. ¡Podemos ayudarte a llevar tu rifa al siguiente nivel!
      </p>

      <div className="w-full bg-white/10  backdrop-blur-md border border-white/20 rounded-lg p-6 space-y-4 text-left text-white">
        <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-300">
          <Users className="w-5 h-5" />
          Propuestas de colaboración
        </h2>
        <p>
          Si quieres utilizar nuestra plataforma para realizar una rifa personalizada, ya sea para promocionar tu marca o para apoyar una causa,
          escríbenos directamente por alguno de los siguientes medios:
        </p>

        <ul className="space-y-2 mt-2">
          <li className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-300" />
            <span className="font-mono">contacto@rifandoando.club</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-400" />
            <a
              href="https://wa.me/524922900619"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-300 transition"
            >
              WhatsApp: 449 886 0396
            </a>
          </li>
        </ul>

        <p className="text-white/70 pt-4 border-t border-white/10 mt-4 text-sm">
          También puedes escribirnos si tienes dudas o sugerencias sobre la plataforma.
          Estaremos felices de leerte
        </p>
      </div>

      <p className="text-white/50 text-sm mt-6">
        * Encuentra nuestras redes sociales al final de la página (footer).
      </p>
    </div>
  );
};

export default Contacto;
