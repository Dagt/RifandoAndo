import React from "react";

const TablaCodigosPromocionales = ({ codigos, pagina, codigosPorPagina, setPagina }) => {
  const codigosPaginados = codigos.slice(pagina * codigosPorPagina, (pagina + 1) * codigosPorPagina);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md col-span-full mt-20 overflow-x-auto">
      <h3 className="text-center font-semibold mb-4 text-white text-xl">🔥 Códigos Promocionales</h3>

      <table className="min-w-full text-sm text-white text-left border-collapse">
        <thead className="border-b border-white/10">
          <tr>
            <th className="p-2">Código</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Usos</th>
            <th className="p-2">Monto generado</th>
            <th className="p-2">Ticket promedio</th>
            <th className="p-2">% de su(s) rifa(s)</th>
          </tr>
        </thead>
        <tbody>
          {codigosPaginados.length > 0 ? (
            codigosPaginados.map((c) => (
              <tr key={c.codigo} className={c.porcentaje_del_total >= 25 ? "bg-yellow-800/20" : "border-t border-white/10"}>
                <td className="p-2 font-bold text-yellow-300">{c.codigo || "—"}</td>
                <td className="p-2">{c.tipo || "—"}</td>
                <td className="p-2">{c.usos ?? "—"}</td>
                <td className="p-2">${typeof c.monto_generado === "number" ? c.monto_generado.toFixed(2) : "0.00"}</td>
                <td className="p-2">${typeof c.ticket_promedio === "number" ? c.ticket_promedio.toFixed(2) : "0.00"}</td>
                <td className="p-2">{typeof c.porcentaje_del_total === "number" ? c.porcentaje_del_total.toFixed(2) : "0.00"}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-4 text-center text-white/60">
                No se encontraron códigos.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-center mt-4 space-x-2">
        <button
          disabled={pagina === 0}
          onClick={() => setPagina(p => p - 1)}
          className="bg-white/10 px-3 py-1 rounded hover:bg-white/20"
        >
          Anterior
        </button>
        <button
          disabled={(pagina + 1) * codigosPorPagina >= codigos.length}
          onClick={() => setPagina(p => p + 1)}
          className="bg-white/10 px-3 py-1 rounded hover:bg-white/20"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default TablaCodigosPromocionales;
