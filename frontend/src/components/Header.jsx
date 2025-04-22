import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  ShieldCheck,
  BarChart,
  Trophy,
  Menu,
  Clock,
  ShieldX,
  Mail,
  LayoutDashboard,
  PlusCircle,
  Pencil,
  CreditCard,
  ChevronDown,
  SearchCheck
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";

const Header = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [submenuAbierto, setSubmenuAbierto] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const cerrarSesion = () => {
    logout();
    navigate("/lgn");
  };

  const enlaces = [
    { to: "/", texto: "Inicio", icono: <Home className="w-4 h-4" /> },
    { to: "/verificador", texto: "Verificador", icono: <Search className="w-4 h-4" /> },
    { to: "/ganadores", texto: "Ganadores", icono: <Trophy className="w-4 h-4" /> },
    { to: "/proximas-rifas", texto: "Próximas", icono: <Clock className="w-4 h-4" /> },
    { to: "/terminos", texto: "Términos", icono: <ShieldCheck className="w-4 h-4" /> },
    { to: "/contacto", texto: "Contacto", icono: <Mail className="w-4 h-4" /> },
  ];

  const cerrarSubmenu = () => setSubmenuAbierto(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white/10 backdrop-blur-md px-4 sm:px-10 md:px-16 lg:px-20 py-4 flex justify-between items-center border-b border-white/20 z-[100]">
      {/* Menú escritorio */}
      <nav className="hidden lg:flex gap-6 text-[15px] font-bold text-white z-10 relative">
        {enlaces.map(({ to, texto, icono }) => (
          <Link key={to} to={to} className="flex items-center gap-1 hover:text-yellow-300">
            {icono}
            {texto}
          </Link>
        ))}

        {user && (
          <div className="relative">
            <button
              onClick={() => setSubmenuAbierto(!submenuAbierto)}
              className="flex items-center gap-1 hover:text-yellow-300 focus:outline-none"
            >
              <LayoutDashboard className="w-4 h-4" />
              Panel
              <ChevronDown className="w-4 h-4" />
            </button>

            {submenuAbierto && (
              <div className="absolute top-full mt-2 bg-black/80 text-white rounded-md shadow-lg py-2 px-4 flex flex-col z-[200]">
                <Link to="/adm-panel" onClick={cerrarSubmenu} className="hover:text-yellow-300 flex items-center gap-2 py-1">
                  <LayoutDashboard className="w-4 h-4" /> Ir al panel
                </Link>
                <Link to="/admin/crear-rifa" onClick={cerrarSubmenu} className="hover:text-yellow-300 flex items-center gap-2 py-1">
                  <PlusCircle className="w-4 h-4" /> Crear rifa
                </Link>
                <Link to="/admin/rifas" onClick={cerrarSubmenu} className="hover:text-yellow-300 flex items-center gap-2 py-1">
                  <Pencil className="w-4 h-4" /> Editar rifas
                </Link>
                <Link to="/admin/transacciones" onClick={cerrarSubmenu} className="hover:text-yellow-300 flex items-center gap-2 py-1">
                  <CreditCard className="w-4 h-4" /> Transacciones
                </Link>
                <Link to="/admin/buscador-boletos" onClick={cerrarSubmenu} className="hover:text-yellow-300 flex items-center gap-2 py-1">
                  <SearchCheck className="w-4 h-4" /> Buscar boleto
                </Link>
                <Link to="/admin/estadisticas" onClick={cerrarSubmenu} className="hover:text-yellow-300 flex items-center gap-2 py-1">
                <BarChart className="w-4 h-4" /> Estadisticas
                </Link>
              </div>
            )}
          </div>
        )}

        {user && (
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-1 text-red-300 hover:text-red-400 ml-4"
          >
            <ShieldX className="w-4 h-4" />
            Cerrar sesión
          </button>
        )}
      </nav>

      {/* Logo y texto "Menú" solo en móviles */}
<div className="flex items-center gap-2 lg:hidden text-white font-bold">
  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
  <span className="text-[16px]">Menú</span>
</div>

      {/* Botón hamburguesa móvil */}
      <button onClick={() => setMenuAbierto(!menuAbierto)} className="lg:hidden z-[101] text-yellow-300 ml-auto">
        <Menu className="w-7 h-7" />
      </button>

      {/* Menú lateral móvil */}
      {menuAbierto && (
        <div className="fixed top-0 right-0 h-screen w-2/3 bg-black/80 backdrop-blur-md p-6 flex flex-col gap-6 text-white font-bold text-[17px] z-[100]">
          {enlaces.map(({ to, texto, icono }) => (
            <Link key={to} to={to} onClick={() => setMenuAbierto(false)} className="flex items-center gap-2 hover:text-yellow-300">
              {icono}
              {texto}
            </Link>
          ))}

          {user && (
  <>
    <p className="text-yellow-300 flex items-center gap-2 mt-4">
      <LayoutDashboard className="w-4 h-4" />
      Panel
    </p>
    <div className="pl-4 flex flex-col gap-2">
      <Link to="/adm-panel" onClick={() => setMenuAbierto(false)} className="hover:text-yellow-300 flex items-center gap-2">
        <LayoutDashboard className="w-4 h-4" /> Ir al panel
      </Link>
      <Link to="/admin/crear-rifa" onClick={() => setMenuAbierto(false)} className="hover:text-yellow-300 flex items-center gap-2">
        <PlusCircle className="w-4 h-4" /> Crear rifa
      </Link>
      <Link to="/admin/rifas" onClick={() => setMenuAbierto(false)} className="hover:text-yellow-300 flex items-center gap-2">
        <Pencil className="w-4 h-4" /> Editar rifas
      </Link>
      <Link to="/admin/transacciones" onClick={() => setMenuAbierto(false)} className="hover:text-yellow-300 flex items-center gap-2">
        <CreditCard className="w-4 h-4" /> Transacciones
      </Link>
      <Link to="/admin/buscador-boletos" onClick={() => setMenuAbierto(false)} className="hover:text-yellow-300 flex items-center gap-2">
        <SearchCheck className="w-4 h-4" /> Buscar boleto
      </Link>
      <Link to="/admin/estadisticas" onClick={() => setMenuAbierto(false)} className="hover:text-yellow-300 flex items-center gap-2">
        <BarChart className="w-4 h-4" /> Estadisticas
      </Link>
    </div>

    <button
      onClick={() => {
        cerrarSesion();
        setMenuAbierto(false);
      }}
      className="flex items-center gap-2 text-red-300 hover:text-red-400 mt-4"
    >
      <ShieldX className="w-4 h-4" />
      Cerrar sesión
    </button>
  </>
)}
        </div>
      )}
    </header>
  );
};

export default Header;
