import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../utils/useAuth";

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!loading && !user) {
      navigate("/lgn");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-3xl font-bold text-center text-orange-400 mb-8">
        Panel de Administración 🛠️
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Crear nueva rifa */}
        <div
          onClick={() => navigate("/admin/crear-rifa")}
          className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
        >
          <h2 className="text-lg font-bold text-yellow-300 mb-2">➕ Crear nueva rifa</h2>
          <p className="text-sm text-white/80">Agrega una nueva rifa con sus imágenes, fechas, etc.</p>
        </div>

        {/* Estadísticas */}
        <div
          onClick={() => navigate("/admin/estadisticas")}
          className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
        >
          <h2 className="text-lg font-bold text-yellow-300 mb-2">📊 Estadísticas</h2>
          <p className="text-sm text-white/80">Revisa boletos vendidos, transacciones y más.</p>
        </div>

        {/* Editar Rifas */}
        <div
          onClick={() => navigate("/admin/rifas")}
          className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
        >
          <h2 className="text-lg font-bold text-yellow-300 mb-2">📋 Editar rifas</h2>
          <p className="text-sm text-white/80">Modifica rifas según su estado o agrega más imágenes.</p>
        </div>

        {/* Panel de transacciones */}
        <div
          onClick={() => navigate("/admin/transacciones")}
          className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
        >
          <h2 className="text-lg font-bold text-yellow-300 mb-2">💳 Ver transacciones</h2>
          <p className="text-sm text-white/80">Consulta las compras realizadas y valida pagos.</p>
        </div>

        {/* Buscar Boletos */}
        <div
          onClick={() => navigate("/admin/buscador-boletos")}
          className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
        >
          <h2 className="text-lg font-bold text-yellow-300 mb-2"> 🎟 Buscar boleto por No.</h2>
          <p className="text-sm text-white/80">Encuentra detalles sobre un boleto.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
