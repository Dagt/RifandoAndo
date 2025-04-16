import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-6 text-center">
      <AlertTriangle className="w-20 h-20 text-yellow-400 mb-4" />
      <h1 className="text-4xl font-bold text-orange-400 mb-2">Página no encontrada</h1>
      <p className="text-white/80 mb-6">Lo sentimos, la ruta que estás buscando no existe.</p>
      <Link
        to="/"
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
