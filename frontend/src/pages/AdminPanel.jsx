import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../utils/useAuth";
import {
  PlusCircle,
  BarChart,
  ClipboardList,
  CreditCard,
  Search,
  Tag,
  Link,
  Settings,
  Dice5,
  Gift,
  Crown,
  Ticket
} from "lucide-react";

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
      <h1 className="text-3xl font-bold text-center text-orange-400 mb-8 flex items-center justify-center gap-2">
        <Settings className="w-7 h-7 text-orange-400" /> Panel de Administración
      </h1>

      {/* Sección de Rifas Regulares */}
      <div className="mb-12">

{/* Rifas Regulares */}
<h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
  <Ticket className="w-7 h-7 text-red-400" />
  Rifas Regulares
</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/panel/crear-rifa")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <PlusCircle className="w-6 h-6 text-yellow-300" />
              Crear nueva rifa
            </h2>
            <p className="text-sm text-white/80">Agrega una nueva rifa con sus imágenes, fechas, etc.</p>
          </div>

          <div
            onClick={() => navigate("/panel/estadisticas")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <BarChart className="w-6 h-6 text-green-300" />
              Estadísticas
            </h2>
            <p className="text-sm text-white/80">Revisa boletos vendidos, transacciones y más.</p>
          </div>

          <div
            onClick={() => navigate("/panel/rifas")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-300" />
              Editar rifas
            </h2>
            <p className="text-sm text-white/80">Modifica rifas según su estado o agrega más imágenes.</p>
          </div>

          <div
            onClick={() => navigate("/panel/transacciones")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <CreditCard className="w-6 h-6 text-pink-300" />
              Ver transacciones
            </h2>
            <p className="text-sm text-white/80">Consulta las compras realizadas y valida pagos.</p>
          </div>

          <div
            onClick={() => navigate("/panel/buscador-boletos")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <Search className="w-6 h-6 text-purple-300" />
              Buscar boleto por No.
            </h2>
            <p className="text-sm text-white/80">Encuentra detalles sobre un boleto.</p>
          </div>

          <div
            onClick={() => navigate("/panel/codigos-promocion")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <Tag className="w-6 h-6 text-red-300" />
              Códigos de promoción
            </h2>
            <p className="text-sm text-white/80">Crea y gestiona códigos de promoción.</p>
          </div>

          <div
            onClick={() => navigate("/panel/links-referidos")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <Link className="w-6 h-6 text-cyan-300" />
              Links de Referidos
            </h2>
            <p className="text-sm text-white/80">Crea y gestiona links de referidos.</p>
          </div>
        </div>
      </div>

      {/* Sección de Rifas Exclusivas y Cajas */}
      <div>
        <h2 className="text-2xl font-bold text-pink-300 mb-4 flex items-center gap-2">
  <Crown className="w-7 h-7 text-yellow-300" />
  Rifas Exclusivas y Cajas Sorpresa
</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/panel/crear-rifa-eclusiva")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <Gift className="w-6 h-6 text-yellow-300" />
              Crear Rifa Exclusiva
            </h2>
            <p className="text-sm text-white/80">Configura una rifa exclusiva y su Jackpot asociado.</p>
          </div>

          <div
            onClick={() => navigate("/panel/simular-caja-sorpresa")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <Dice5 className="w-6 h-6 text-red-400" />
              Simulador de Cajas Sorpresa
            </h2>
            <p className="text-sm text-white/80">Simula y configura los valores de las cajas sorpresa.</p>
          </div>
          <div
            onClick={() => navigate("/panel/editar-rifas-exclusivas")}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md text-center hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2 flex justify-center items-center gap-2">
              <ClipboardList className="w-6 h-6 text-blue-300" />
              Editar Rifas Exclusivas
            </h2>
            <p className="text-sm text-white/80">Edita los valores de las Rifas Exclusivas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
