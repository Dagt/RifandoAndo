// Simulador de Caja Sorpresa con visualización balanceada, Jackpot, escenario intermedio y tabla explicativa
import React, { useState, useEffect } from "react";
import {
  DollarSign, Hash, Target, Dice5, PackageSearch, LineChart,
  BarChart3, Activity, Coins, Star, Info, Percent, Gift, List, PiggyBank, Divide, Dice4
} from "lucide-react";

const SimuladorCajaSorpresa = () => {
  const [input, setInput] = useState({
    valorPremio: 100000,
    boletosTotales: 100,
    precioCaja: 35,
    dropDeseado: 2.5,
    porcentajeJackpot: 10,
  });

  const [resultados, setResultados] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/simular-caja/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(input),
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

    fetchData();
  }, [input]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value === "" ? null : parseFloat(value),
    }));
  };

  const format = (n) => {
    if (n === null || n === undefined) return "—";
    return n.toLocaleString("es-MX", { minimumFractionDigits: 2 });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6 flex justify-center items-center gap-2">
        <Dice5 className="text-red-400 w-6 h-6" /> Simulador de Caja Sorpresa
      </h1>

      <div className="grid grid-cols-1  md:grid-cols-2 gap-4 mb-8">
        {/* Inputs de configuración */}
        <label className="text-sm">
          <span className="flex items-center gap-2 mb-1 text-white/80">
            <DollarSign className="w-4 h-4 text-yellow-400" /> Valor del premio principal
          </span>
          <input name="valorPremio" type="number" className="p-2 w-full rounded bg-white/10" value={input.valorPremio || ""} onChange={handleChange} placeholder="Ej: 100000" />
        </label>

        <label className="text-sm">
          <span className="flex items-center gap-2 mb-1 text-white/80">
            <Hash className="w-4 h-4 text-green-300" /> Boletos en la rifa exclusiva
          </span>
          <input name="boletosTotales" type="number" className="p-2 w-full rounded bg-white/10" value={input.boletosTotales || ""} onChange={handleChange} placeholder="Ej: 100" />
        </label>

        <label className="text-sm">
          <span className="flex items-center gap-2 mb-1 text-white/80">
            <Target className="w-4 h-4 text-cyan-300" /> Precio por caja
          </span>
          <input name="precioCaja" type="number" className="p-2 w-full rounded bg-white/10" value={input.precioCaja || ""} onChange={handleChange} placeholder="Ej: 35" />
        </label>

        <label className="text-sm">
          <span className="flex items-center gap-2 mb-1 text-white/80">
            <Percent className="w-4 h-4 text-lime-300" /> Drop boleto exclusivo (%)
          </span>
          <input name="dropDeseado" type="number" className="p-2 w-full rounded bg-white/10" value={input.dropDeseado || ""} onChange={handleChange} placeholder="Ej: 2.5" />
        </label>

        <label className="text-sm col-span-1 md:col-span-2">
          <span className="flex items-center gap-2 mb-1 text-white/80">
            <Gift className="w-4 h-4 text-pink-300" /> Porcentaje destinado al Jackpot (%)
          </span>
          <input name="porcentajeJackpot" type="number" className="p-2 w-full rounded bg-white/10 md:max-w-xs" value={input.porcentajeJackpot || ""} onChange={handleChange} placeholder="Ej: 10" />
        </label>
      </div>

      {resultados ? (
        <div className="bg-white/5  backdrop-blur-md p-6 rounded-xl space-y-6">
          {/* Métrica base */}
          <div className="text-white/80 text-sm mb-4 flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-300" />
            Costo promedio premios menores: <b>${format(resultados.costoPremioMenor)}</b>
          </div>

          {/* Escenario 1: Rentabilidad mínima */}
          <div>
            <h2 className="text-xl font-bold  flex items-center gap-2 text-yellow-300 mb-2">
              <LineChart className="text-yellow-400 w-5 h-5" /> Escenario 1: Rentabilidad mínima
            </h2>
            <ul className="text-sm space-y-1">
              <li><Coins className="inline w-4 h-4 text-blue-300" /> Cajas necesarias: <b>{format(resultados.cajasParaRentabilidad)}</b></li>
              <li><DollarSign className="inline w-4 h-4 text-orange-300" /> Ingreso total: <b>${format(resultados.ingresoRentabilidad)}</b></li>
              <li><Activity className="inline w-4 h-4 text-pink-300" /> Utilidad estimada: <b>${format(resultados.utilidadRentabilidad)}</b></li>
            </ul>
          </div>
          {/* Escenario 2: Punto medio */}
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
          {/* Escenario 3: Promedio real esperado */}
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

          {/* Interpretación */}
          <div className="bg-white/10 rounded-lg p-4 text-sm text-white/70 mt-6">
            <h3 className="font-bold text-white mb-2 flex gap-2 items-center">
              <Info className="w-4 h-4 text-white/60" /> Interpretación
            </h3>
            <p><b>Rentabilidad mínima:</b> Se refiere al punto de equilibrio donde recuperas tu inversión y generas ganancia.</p>
            <p className="mt-2"><b>Punto Medio Realista:</b> Refleja un escenario realista, útil para planear sin ser ni optimista ni pesimista.</p>
            <p className="mt-2"><b>Escenario estadistico esperado:</b> simula qué sucede si los boletos exclusivos caen exactamente según su drop esperado.</p>
          </div>

          {/* Tabla de premios formateada */}
          <div className="bg-white/10 rounded-lg p-4 text-sm text-white/80 mt-8">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <List className="w-4 h-4 text-cyan-300" /> Tabla de premios: descripción, probabilidad y valor relativo
            </h3>
            <p className="mt-3 text-white/60 text-xs">
              <b>🎯 Drop (%):</b> Probabilidad de que el premio salga en una caja.<br />
              <b>💰 Valor Relativo:</b> Porcentaje del valor de la caja que representa el costo estimado del premio (solo se aplica a premios con valor económico).
            </p>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-white/70 border-b border-white/20">
                  <th className="p-2 font-semibold">🎁 Premio</th>
                  <th className="p-2 font-semibold text-center">🎯 Drop rate (%)</th>
                  <th className="p-2 font-semibold text-center">💰 Valor Relativo al valor de la caja(%)</th>
                </tr>
              </thead>
              <tbody>
                {resultados.modeloPremios.map((p, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td className="p-2">{p.nombre}</td>
                    <td className="p-2 text-center">{(p.drop * 100).toFixed(2)}</td>
                    <td className="p-2 text-center">{(p.valor_relativo * 100).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-red-400 mt-4">⚠️ Faltan datos o hay conflicto en la configuración.</p>
      )}
    </div>
  );
};

export default SimuladorCajaSorpresa;
