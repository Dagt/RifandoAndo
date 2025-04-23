import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { TicketCheck, Gift, PieChart, Banknote, Sparkles, Percent } from "lucide-react";
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
      { métrica: "Precio promedio por rifa", valor: data.promedio_precio_por_rifa },
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
            <p className="text-xl font-bold text-pink-300">${data.promedio_precio_por_rifa.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className={chartStyle}>
          <h3 className="text-center font-semibold mb-2 text-white">Rifas por Estado</h3>
          <Chart
            type="pie"
            series={[data.activas, data.en_espera, data.finalizadas]}
            options={{
              labels: ["Activas", "En espera", "Finalizadas"],
              colors: ["#f59e0b", "#10b981", "#ef4444"],
              legend: { labels: { colors: "#ffffff" } },
              dataLabels: { style: { colors: ["#ffffff"] } }
            }}
          />
        </div>

        <div className={chartStyle}>
          <h3 className="text-center font-semibold mb-2 text-white">Boletos Vendidos por Rifa</h3>
          <Chart
            type="bar"
            series={[{ name: "Vendidos", data: data.boletos_por_rifa.map(r => r.vendidos) }]}
            options={{
              xaxis: {
                categories: data.boletos_por_rifa.map(r => r.nombre),
                labels: { style: { colors: "#ffffff" } },
                tickPlacement: 'on',
              },
              yaxis: { labels: { style: { colors: "#ffffff" } } },
              colors: ["#facc15"]
            }}
          />
        </div>

        <div className={chartStyle}>
          <h3 className="text-center font-semibold mb-2 text-white">Métodos de Pago</h3>
          <Chart
            type="donut"
            series={["SPEI", "OXXO", "TARJETA"].map(m => data.metodos_pago[m] || 0)}
            options={{
              labels: ["SPEI", "OXXO", "TARJETA"],
              colors: ["#22c55e", "#f97316", "#ef4444"],
              legend: { labels: { colors: "#ffffff" } },
              dataLabels: { style: { colors: ["#ffffff"] } }
            }}
          />
        </div>

        <div className={chartStyle}>
          <h3 className="text-center font-semibold mb-2 text-white">Rifas por Mes</h3>
          <Chart
            type="area"
            series={[{ name: "Rifas", data: Object.values(data.rifas_por_mes) }]}
            options={{
              xaxis: {
                categories: Object.keys(data.rifas_por_mes),
                labels: { style: { colors: "#ffffff" } }
              },
              yaxis: { labels: { style: { colors: "#ffffff" } } },
              colors: ["#38bdf8"]
            }}
          />
        </div>

        <div className={chartStyle}>
          <h3 className="text-center font-semibold mb-2 text-white">% de Boletos Vendidos por Tamaño</h3>
          <Chart
            type="bar"
            series={[{ name: "Porcentaje vendido", data: Object.values(data.porcentaje_vendidos_por_tamano) }]}
            options={{
              xaxis: {
                categories: Object.keys(data.porcentaje_vendidos_por_tamano),
                title: { text: "Tamaño de rifa", style: { color: "#ffffff" } },
                labels: { style: { colors: "#ffffff" } }
              },
              yaxis: { labels: { style: { colors: "#ffffff" } } },
              colors: ["#34d399"]
            }}
          />
        </div>

        <div className={chartStyle}>
          <h3 className="text-center font-semibold mb-2 text-white">% de Ventas por Precio</h3>
          <Chart
            type="bar"
            series={[{ name: "Porcentaje de ventas", data: Object.values(data.porcentaje_por_precio) }]}
            options={{
              xaxis: {
                categories: Object.keys(data.porcentaje_por_precio),
                title: { text: "Precio del boleto", style: { color: "#ffffff" } },
                labels: { style: { colors: "#ffffff" } }
              },
              yaxis: { labels: { style: { colors: "#ffffff" } } },
              colors: ["#f87171"]
            }}
          />
        </div>

        {/* Códigos promocionales más usados */}
        {data.codigos_promocionales?.length > 0 && (
          <div className="col-span-full">
            <h3 className="text-center text-lg font-semibold text-white mt-8 mb-4">🔥 Códigos Promocionales Usados</h3>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-4">
              <table className="min-w-full text-sm text-white">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="p-2">Código</th>
                    <th className="p-2">Usos</th>
                    <th className="p-2">Boletos vendidos</th>
                    <th className="p-2">Monto generado</th>
                    <th className="p-2">Rifas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.codigos_promocionales.map((c) => (
                    <tr key={c.codigo} className="border-t border-white/10">
                      <td className="p-2 font-bold text-yellow-300">{c.codigo}</td>
                      <td className="p-2">{c.usos}</td>
                      <td className="p-2">{c.boletos}</td>
                      <td className="p-2">${c.monto.toLocaleString()}</td>
                      <td className="p-2">{c.rifas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Estadisticas;
