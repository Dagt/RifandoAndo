import React, { useEffect, useState } from "react";
import useAuth from "../utils/useAuth";
import {
  User,
  Mail,
  Phone,
  Ticket,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Search,
} from "lucide-react";

const BuscadorBoletos = () => {
  const { token } = useAuth();
  const [numero, setNumero] = useState("");
  const [rifas, setRifas] = useState([]);
  const [rifaTexto, setRifaTexto] = useState("");
  const [rifaId, setRifaId] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    cargarRifas();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timeout = setTimeout(() => setMensaje(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [mensaje]);

  const cargarRifas = async () => {
    try {
      const res = await fetch("/api/rifas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.results) {
        const filtradas = data.results.filter(
          (r) => r.estado !== "en_espera" && r.boletos_vendidos > 0
        );
        setRifas(filtradas);
      }
    } catch (error) {
      console.error("Error al cargar rifas:", error);
    }
  };

  const manejarTextoRifa = (texto) => {
    setRifaTexto(texto);
    const sugerenciasFiltradas = rifas.filter((r) =>
      r.nombre.toLowerCase().includes(texto.toLowerCase())
    );
    setSugerencias(sugerenciasFiltradas);
    const encontrada = sugerenciasFiltradas.find(
      (r) => r.nombre.toLowerCase() === texto.toLowerCase()
    );
    setRifaId(encontrada ? encontrada.id : "");
  };

  const buscar = async () => {
    if (!numero) {
      setMensaje("Debes ingresar un número de boleto");
      setResultados([]);
      return;
    }

    const params = new URLSearchParams();
    params.append("numero", numero);
    if (rifaId) params.append("rifa_id", rifaId);

    try {
      const res = await fetch(`/api/buscar-boletos/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        if (Array.isArray(data)) {
          setResultados(data);
          setMensaje("");
        } else {
          setMensaje(data.mensaje || "Sin resultados");
          setResultados([]);
        }
      } else {
        setMensaje(data.error || "Error en la búsqueda");
        setResultados([]);
      }
    } catch (error) {
      console.error("Error al buscar boleto:", error);
      setMensaje("Error al buscar boleto");
    }
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-yellow-400 text-center mb-6">
        🔎 Buscar Boleto
      </h2>

      <div className="max-w-xl mx-auto space-y-4 relative">
        <input
          type="number"
          placeholder="Número de boleto"
          className="w-full p-3 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />

        <input
          type="text"
          placeholder="Nombre de la rifa (opcional)"
          className="w-full p-3 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
          value={rifaTexto}
          onChange={(e) => manejarTextoRifa(e.target.value)}
          onBlur={() => setTimeout(() => setSugerencias([]), 200)}
        />

        {sugerencias.length > 0 && (
          <ul className="absolute z-10 bg-black/80 text-white w-full mt-1 rounded border border-white/20 backdrop-blur-sm">
            {sugerencias.map((r) => (
              <li
                key={r.id}
                onClick={() => {
                  setRifaTexto(r.nombre);
                  setRifaId(r.id);
                  setSugerencias([]);
                }}
                className="p-2 hover:bg-white/10 cursor-pointer"
              >
                {r.nombre}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={buscar}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 rounded font-bold flex justify-center items-center gap-2"
        >
          <Search className="w-5 h-5" /> Buscar
        </button>
      </div>

      {mensaje && <p className="text-center text-red-400 mt-6">{mensaje}</p>}

      {resultados.length > 0 && (
        <div className="mt-8 max-w-4xl mx-auto space-y-6">
          {resultados.map((res, idx) => (
            <div
              key={idx}
              className="bg-white/10 rounded-xl p-6 shadow border border-white/20 backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold mb-4 text-yellow-300 flex items-center gap-2">
                <Ticket className="text-yellow-400 w-5 h-5" />
                Boleto #{res.numero}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <User className="inline w-4 h-4 text-blue-300 mr-1" />
                  {res.nombre_completo}
                </p>
                <p>
                  <Mail className="inline w-4 h-4 text-purple-300 mr-1" />
                  {res.correo}
                </p>
                <p>
                  <Phone className="inline w-4 h-4 text-pink-300 mr-1" />
                  {res.telefono}
                </p>
                <p>
                  <FileText className="inline w-4 h-4 text-teal-300 mr-1" />
                  {res.rifa}
                </p>
                <p>
                  <CreditCard className="inline w-4 h-4 text-orange-300 mr-1" />
                  {res.metodo_pago}
                </p>
                <p>
                  {res.pagado ? (
                    <CheckCircle className="inline w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <AlertCircle className="inline w-4 h-4 text-red-400 mr-1" />
                  )}
                  {res.pagado ? "Pagado" : "No pagado"}
                </p>
                <p>
                  <Ticket className="inline w-4 h-4 text-indigo-300 mr-1" />
                  Folio: {res.folio}
                </p>
                <p>
                  <CalendarDays className="inline w-4 h-4 text-cyan-300 mr-1" />
                  {new Date(res.fecha_transaccion).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuscadorBoletos;
