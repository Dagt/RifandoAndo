// Simulador de Caja Sorpresa completo
import React, { useState, useEffect } from "react";
import {
  DollarSign, Hash, Target, Dice5, PackageSearch, LineChart,
  BarChart3, Activity, Coins, Star, Info, Percent, Gift, List, PiggyBank, Divide, PlusCircle
} from "lucide-react";

const SimuladorCajaSorpresa = () => {
  const [input, setInput] = useState({
    valorPremio: 100000,
    boletosTotales: 100,
    precioCaja: 100,
    dropDeseado: 2.5,
    porcentajeJackpot: 10,
  });

  const [resultados, setResultados] = useState(null);
  const [premios, setPremios] = useState([
    { nombre: "🎟️ Boleto exclusivo", valor_relativo: 1.0, drop: 0.025 },
    { nombre: "🎫 Boletos económicos (≤30%)", valor_relativo: 0.3, drop: 0.20 },
    { nombre: "🎫 Boletos intermedios (≤50%)", valor_relativo: 0.5, drop: 0.15 },
    { nombre: "🎫 Boletos raros (≤65%)", valor_relativo: 0.65, drop: 0.08 },
    { nombre: "🎁 Descuento 5%", valor_relativo: 0.0, drop: 0.12 },
    { nombre: "🎁 Descuento 10%", valor_relativo: 0.0, drop: 0.10 },
    { nombre: "🎁 Descuento 15%", valor_relativo: 0.0, drop: 0.06 },
    { nombre: "🎁 Descuento 20%", valor_relativo: 0.0, drop: 0.04 },
    { nombre: "🎁 Descuento 30%", valor_relativo: 0.0, drop: 0.02 },
    { nombre: "🧩 Código coleccionable", valor_relativo: 0.0, drop: 0.05 },
    { nombre: "🧧 Caja gratis", valor_relativo: 1.0, drop: 0.025 },
    { nombre: "🎫 +2 boletos para Jackpot", valor_relativo: 0.0, drop: 0.04 },
    { nombre: "🎫 +3 boletos para Jackpot", valor_relativo: 0.0, drop: 0.02 },
    { nombre: "— Sin premio visible (solo boleto para Jackpot)", valor_relativo: 0.0, drop: 1.0 }
  ]);

  useEffect(() => {
  const cargarCajaExistente = async () => {
    try {
      const res = await fetch("/api/caja-actual/");
      const data = await res.json();
      if (res.ok && data) {
        setInput({
          valorPremio: data.valor_premio,
          boletosTotales: data.total_boletos,
          precioCaja: parseFloat(data.precio),
          dropDeseado: parseFloat(data.drop_boleto_exclusivo)*100,
          porcentajeJackpot: parseFloat(data.porcentaje_jackpot)*100,
        });


        setPremios(data.premios);
      }
    } catch (err) {
      console.error("Error al cargar caja existente:", err);
    }
  };
  cargarCajaExistente();
}, []);

  useEffect(() => {
  const fetchSimulacion = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/simular-caja/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...input, premios }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultados(data);
      } else {
        setResultados(null);
      }
    } catch (err) {
      setResultados(null);
    }
  };
  fetchSimulacion();
}, [input, premios]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value === "" ? null : parseFloat(value),
    }));
  };

  const handleGuardarPremios = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/actualizar-premios-caja/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ premios }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ Premios guardados correctamente.");
    } else {
      alert("❌ Error: " + data.error);
    }
  } catch (err) {
    alert("❌ Error al guardar premios.");
  }
};


  const handlePremioChange = (index, field, value) => {
    setPremios((prev) => {
      const copia = [...prev];
      copia[index][field] = parseFloat(value);
      return copia;
    });
  };

  const format = (n) => {
    if (n === null || n === undefined) return "—";
    return n.toLocaleString("es-MX", { minimumFractionDigits: 2 });
  };

  const handleCrearCaja = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/crear-caja/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          precio: input.precioCaja,
          porcentaje_jackpot: input.porcentajeJackpot / 100,
          drop_boleto_exclusivo: input.dropDeseado / 100,
          premios,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Caja creada exitosamente.");
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      alert("❌ Error al crear la caja.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6 flex justify-center items-center gap-2">
        <Dice5 className="text-red-400 w-6 h-6" /> Simulador de Caja Sorpresa
      </h1>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {[
          ["valorPremio", "Valor del premio principal", DollarSign, "text-yellow-400"],
          ["boletosTotales", "Boletos en la rifa exclusiva", Hash, "text-green-300"],
          ["precioCaja", "Precio por caja", Target, "text-cyan-300"],
          ["dropDeseado", "Drop boleto exclusivo (%)", Percent, "text-lime-300"],
        ].map(([name, label, Icon, color], i) => (
          <label key={i} className="text-sm">
            <span className={`flex items-center gap-2 mb-1 text-white/80`}>
              <Icon className={`w-4 h-4 ${color}`} /> {label}
            </span>
            <input
              name={name}
              type="number"
              className="p-2 w-full rounded bg-white/10"
              value={input[name] || ""}
              onChange={handleChange}
            />
          </label>
        ))}
        <label className="text-sm col-span-1 md:col-span-2">
          <span className="flex items-center gap-2 mb-1 text-white/80">
            <Gift className="w-4 h-4 text-pink-300" /> Porcentaje destinado al Jackpot (%)
          </span>
          <input
            name="porcentajeJackpot"
            type="number"
            className="p-2 w-full rounded bg-white/10 md:max-w-xs"
            value={input.porcentajeJackpot || ""}
            onChange={handleChange}
          />
        </label>

        <div className="flex justify-end mt-6">
        <button
          onClick={handleCrearCaja}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3 rounded-lg shadow-md transition"
        >
          <PlusCircle className="w-5 h-5" /> Crear esta caja
        </button>
      </div>
      </div>


      {/* Tabla editable de premios */}
      <div className="bg-white/10 rounded-lg p-4 text-sm text-white/80 mt-6">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <List className="w-4 h-4 text-cyan-300" /> Editar premios
        </h3>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="text-white/70 border-b border-white/20">
              <th className="p-2 font-semibold">🎁 Premio</th>
              <th className="p-2 font-semibold text-center">🎯 Drop rate (%)</th>
              <th className="p-2 font-semibold text-center">💰 Valor Relativo (%)</th>
            </tr>
          </thead>
          <tbody>
            {premios.map((p, i) => (
              <tr key={i} className="border-b border-white/10">
                <td className="p-2">{p.nombre}</td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={p.drop * 100}
                    onChange={(e) => handlePremioChange(i, "drop", e.target.value / 100)}
                    className="bg-white/10 rounded px-2 py-1 w-20 text-center"
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={p.valor_relativo * 100}
                    onChange={(e) => handlePremioChange(i, "valor_relativo", e.target.value / 100)}
                    className="bg-white/10 rounded px-2 py-1 w-20 text-center"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
  <button
    onClick={handleGuardarPremios}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-lg shadow-md transition"
  >
    <PlusCircle className="w-5 h-5" /> Guardar premios
  </button>
</div>

      </div>

      {/* Escenarios */}
      {resultados && (
        <div className="mt-12 space-y-6 bg-white/5 p-6 rounded-xl backdrop-blur-md">
          <div className="text-white/80 text-sm mb-4 flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-300" /> Costo promedio premios menores:
            <b>${format(resultados.costoPremioMenor)}</b>
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-300 mb-2">
              <LineChart className="text-yellow-400 w-5 h-5" /> Escenario 1: Rentabilidad mínima
            </h2>
            <ul className="text-sm space-y-1">
              <li><Coins className="inline w-4 h-4 text-blue-300" /> Cajas necesarias: <b>{format(resultados.cajasParaRentabilidad)}</b></li>
              <li><DollarSign className="inline w-4 h-4 text-orange-300" /> Ingreso total: <b>${format(resultados.ingresoRentabilidad)}</b></li>
              <li><Activity className="inline w-4 h-4 text-pink-300" /> Utilidad estimada: <b>${format(resultados.utilidadRentabilidad)}</b></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-300 mb-2">
              <BarChart3 className="text-yellow-400 w-5 h-5" /> Escenario 2: Punto medio realista
            </h2>
            <ul className="text-sm space-y-1">
              <li><Coins className="inline w-4 h-4 text-indigo-300" /> Cajas estimadas: <b>{format(Math.round((resultados.cajasParaRentabilidad + resultados.cajasParaLiberarTodos) / 2))}</b></li>
              <li><DollarSign className="inline w-4 h-4 text-orange-300" /> Ingreso estimado: <b>${format(Math.round((resultados.ingresoRentabilidad + resultados.ingresoTodosBoletos) / 2))}</b></li>
              <li><PiggyBank className="inline w-4 h-4 text-yellow-400" /> Jackpot estimado: <b>${format(Math.round((resultados.ingresoRentabilidad + resultados.ingresoTodosBoletos) / 2 * (input.porcentajeJackpot / 100)))}</b></li>
              <li><Star className="inline w-4 h-4 text-green-400" /> Utilidad estimada: <b>${format(Math.round((resultados.utilidadRentabilidad + resultados.utilidadNetaLiberar) / 2))}</b></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-300 mb-2">
              <Divide className="text-yellow-400 w-5 h-5" /> Escenario 3: Comportamiento estadístico esperado
            </h2>
            <ul className="text-sm space-y-1">
              <li><Target className="inline w-4 h-4 text-lime-300" /> Probabilidad aplicada: <b>{(resultados.probabilidadBoleto * 100).toFixed(2)}%</b></li>
              <li><PackageSearch className="inline w-4 h-4 text-purple-300" /> Cajas necesarias: <b>{format(resultados.cajasParaLiberarTodos)}</b></li>
              <li><DollarSign className="inline w-4 h-4 text-orange-300" /> Ingreso total: <b>${format(resultados.ingresoTodosBoletos)}</b></li>
              <li><PiggyBank className="inline w-4 h-4 text-yellow-400" /> Jackpot reservado: <b>${format(resultados.ingresoTodosBoletos - resultados.ingresoNetoLiberar)}</b></li>
              <li><DollarSign className="inline w-4 h-4 text-cyan-300" /> Ingreso neto: <b>${format(resultados.ingresoNetoLiberar)}</b></li>
              <li><Star className="inline w-4 h-4 text-green-400" /> Utilidad neta: <b>${format(resultados.utilidadNetaLiberar)}</b></li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-lg p-4 text-sm text-white/70 mt-6">
            <h3 className="font-bold text-white mb-2 flex gap-2 items-center">
              <Info className="w-4 h-4 text-white/60" /> Interpretación
            </h3>
            <p><b>Rentabilidad mínima:</b> Punto de equilibrio con ganancia.</p>
            <p className="mt-2"><b>Punto medio:</b> Escenario balanceado entre riesgo y retorno.</p>
            <p className="mt-2"><b>Estadístico:</b> Comportamiento teórico si los drops funcionan como se espera.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimuladorCajaSorpresa;
