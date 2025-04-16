import React from "react";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-white/10 backdrop-blur-md text-white text-sm font-semibold border-t border-white/10 px-4 py-2 text-center">
      <div className="flex justify-center gap-4 mb-1">
        <a href="https://facebook.com" target="_blank" rel="noreferrer">
          <Facebook className="w-4 h-4 hover:text-blue-400" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <Instagram className="w-4 h-4 hover:text-pink-400" />
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noreferrer">
          <SiTiktok className="w-4 h-4 hover:text-white" />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noreferrer">
          <Youtube className="w-4 h-4 hover:text-red-500" />
        </a>
      </div>
      <p>
        © {new Date().getFullYear()} Rifando Ando —{" "}
        <a href="/terminos" className="underline text-orange-300 hover:text-yellow-300">
          Términos y condiciones
        </a>
      </p>
    </footer>
  );
};

export default Footer;
