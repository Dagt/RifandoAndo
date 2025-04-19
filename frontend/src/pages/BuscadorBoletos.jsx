import React, { useState, useEffect } from "react";
import useAuth from "../utils/useAuth";

const BuscadorBoletos = () => {
  const { token } = useAuth();
  const [numero, setNumero] = useState("");
  const [rifas, setRifas] = useState([]);
  const [rifaSeleccionada, setRifaSeleccionada] = useState("");
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
        const rifasFiltradas = data.results.filter(
          (r) => r.estado !== "en_espera" && r.boletos_vendidos > 0
        );
        setRifas(rifasFiltradas);
      } else {
        console.error("Error al cargar rifas");
      }
    } catch (error) {
      console.error("Error al cargar rifas:", error);
    }
  };

  const buscar = async () => {
    if (!numero) {
      setMensaje("Debes ingresar un número de boleto");
      setResultados([]);
      return;
    }

    const params = new URLSearchParams();
    params.append("numero", numero);
    if (rifaSeleccionada) params.append("rifa_id", rifaSeleccionada);

    try {
      const res = await fetch(`/api/buscar-boletos/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        if (Array.isArray(data)) {
          setResultados(data);
          setMensaje("");
        } else if (data.mensaje) {
          setMensaje(data.mensaje);
          setResultados([]);
        }
      } else {
        setMensaje(data.error || "Error al buscar");
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

      <div className="max-w-xl mx-auto space-y-4">
        <input
          type="number"
          placeholder="Número de boleto"
          className="w-full p-3 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />

        <select
          value={rifaSeleccionada}
          onChange={(e) => setRifaSeleccionada(e.target.value)}
          className="w-full p-3 rounded bg-white/10 border border-white/20 text-white backdrop-blur-md"
        >
          <option value="">Todas las rifas</option>
          {rifas.map((r) => (
            <option key={r.id} value={r.id} className="text-black">
              {r.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={buscar}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 rounded font-bold"
        >
          Buscar
        </button>
      </div>

      {mensaje && <p className="text-center text-red-400 mt-6">{mensaje}</p>}

      {resultados.length > 0 && (
        <div className="mt-8 max-w-4xl mx-auto space-y-6">
          {resultados.map((resultado, idx) => (
            <div
              key={idx}
              className="bg-white/10 rounded-xl p-6 shadow border border-white/20 backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold mb-4 text-yellow-300">
                🎫 Boleto #{resultado.numero}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <span className="text-white/70 font-semibold">Nombre:</span>{" "}
                  {resultado.nombre_completo}
                </p>
                <p>
                  <span className="text-white/70 font-semibold">Correo:</span>{" "}
                  {resultado.correo}
                </p>
                <p>
                  <span className="text-white/70 font-semibold">
                    Teléfono:
                  </span>{" "}
                  {resultado.telefono}
                </p>
                <p>
                  <span className="text-white/70 font-semibold">Rifa:</span>{" "}
                  {resultado.rifa}
                </p>
                <p>
                  <span className="text-white/70 font-semibold">Folio:</span>{" "}
                  {resultado.folio}
                </p>
                <p>
                  <span className="text-white/70 font-semibold">
                    Método de pago:
                  </span>{" "}
                  {resultado.metodo_pago}
                </p>
                <p>
                  <span className="text-white/70 font-semibold">
                    Estado transacción:
                  </span>{" "}
                  {resultado.estado_transaccion}
                </p>
                <p>
                  <span className="text-white/70 font-semibold">Pagado:</span>{" "}
                  {resultado.pagado ? "✅ Sí" : "❌ No"}
                </p>
                <p>
                  <span className="text-white/70 font-semibold">Fecha:</span>{" "}
                  {new Date(resultado.fecha_transaccion).toLocaleString()}
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
