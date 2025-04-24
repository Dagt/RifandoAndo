
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { TicketCheck, Gift, PieChart, Banknote, Percent } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Papa from "papaparse";

const Estadisticas = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/estadisticas/")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Error cargando estadísticas:", err));
  }, []);

  const exportToPDF = () => {
    html2canvas(document.body, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("estadisticas.pdf");
    });
  };

  const exportToCSV = () => {
    const csvData = [
      { métrica: "Rifas activas", valor: data.activas },
      { métrica: "Rifas en espera", valor: data.en_espera },
      { métrica: "Rifas finalizadas", valor: data.finalizadas },
      { métrica: "Boletos vendidos", valor: data.boletos_vendidos },
      { métrica: "Monto total recaudado", valor: data.ingresos_totales },
    ];
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "estadisticas.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data) {
    return <p className="text-white text-center mt-10">Cargando estadísticas...</p>;
  }

  const chartStyle = "bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md";

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-orange-400 text-center mb-4">📊 Estadísticas Generales</h2>

      <div className="flex justify-center gap-4 mb-8">
        <button onClick={exportToPDF} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold text-white">Exportar PDF</button>
        <button onClick={exportToCSV} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm font-bold text-white">Exportar CSV</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-8">
        <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
          <Gift className="w-10 h-10 text-yellow-400" />
          <div>
            <p className="text-sm">Rifas activas</p>
            <p className="text-xl font-bold text-orange-300">{data.activas}</p>
          </div>
        </div>
        <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
          <TicketCheck className="w-10 h-10 text-green-400" />
          <div>
            <p className="text-sm">Boletos vendidos</p>
            <p className="text-xl font-bold text-green-300">{data.boletos_vendidos}</p>
          </div>
        </div>
        <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
          <PieChart className="w-10 h-10 text-purple-400" />
          <div>
            <p className="text-sm">Rifas finalizadas</p>
            <p className="text-xl font-bold text-purple-300">{data.finalizadas}</p>
          </div>
        </div>
        <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
          <Banknote className="w-10 h-10 text-emerald-400" />
          <div>
            <p className="text-sm">Monto recaudado</p>
            <p className="text-xl font-bold text-emerald-300">${data.ingresos_totales.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
          <Percent className="w-10 h-10 text-pink-400" />
          <div>
            <p className="text-sm">Promedio por rifa</p>
            <p className="text-xl font-bold text-pink-300">${data.promedio_precio_general.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Aquí insertamos las gráficas que ya tienes */}
        {/* ... (gráficas omitidas para brevedad) ... */}

        <div className={chartStyle + " col-span-full"}>
          <h3 className="text-center font-semibold mb-2 text-white">🎯 Precio Promedio por Rifa</h3>
          <table className="w-full text-sm text-white text-left">
            <thead className="border-b border-white/10">
              <tr>
                <th className="p-2">Rifa</th>
                <th className="p-2">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {data.promedio_precio_por_rifa.map((r) => (
                <tr key={r.nombre} className="border-t border-white/10">
                  <td className="p-2">{r.nombre}</td>
                  <td className="p-2">${r.promedio?.toFixed(2) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.codigos_mas_usados?.length > 0 && (
          <div className={chartStyle + " col-span-full"}>
            <h3 className="text-center font-semibold mb-2 text-white">🔥 Códigos Promocionales Más Usados</h3>
            <table className="w-full text-sm text-white text-left">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="p-2">Código</th>
                  <th className="p-2">Usos</th>
                </tr>
              </thead>
              <tbody>
                {data.codigos_mas_usados.map((c) => (
                  <tr key={c.codigo__codigo} className="border-t border-white/10">
                    <td className="p-2 font-bold text-yellow-300">{c.codigo__codigo}</td>
                    <td className="p-2">{c.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Estadisticas;
