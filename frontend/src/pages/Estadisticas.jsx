import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { TicketCheck, Gift, PieChart, Banknote, Percent, CalendarDays, UserCheck, Hash } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Papa from "papaparse";

const Estadisticas = () => {
  const [data, setData] = useState(null);
  const [filtro, setFiltro] = useState({ desde: "", hasta: "" });

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

  const chartStyle = "bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md";

  if (!data) {
    return <p className="text-white text-center mt-10">Cargando estadísticas...</p>;
  }

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-orange-400 text-center mb-4">📊 Estadísticas Generales</h2>

      {/* Filtros y exportación */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input
          type="date"
          className="bg-white/10 p-2 rounded text-white"
          value={filtro.desde}
          onChange={(e) => setFiltro({ ...filtro, desde: e.target.value })}
        />
        <input
          type="date"
          className="bg-white/10 p-2 rounded text-white"
          value={filtro.hasta}
          onChange={(e) => setFiltro({ ...filtro, hasta: e.target.value })}
        />
        <button onClick={exportToPDF} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold">Exportar PDF</button>
        <button onClick={exportToCSV} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm font-bold">Exportar CSV</button>
      </div>

      {/* Indicadores superiores */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <Indicador icon={<Gift className="text-yellow-400 w-8 h-8" />} label="Rifas activas" valor={data.activas} />
        <Indicador icon={<TicketCheck className="text-green-400 w-8 h-8" />} label="Boletos vendidos" valor={data.boletos_vendidos} />
        <Indicador icon={<PieChart className="text-purple-400 w-8 h-8" />} label="Rifas finalizadas" valor={data.finalizadas} />
        <Indicador icon={<Banknote className="text-emerald-400 w-8 h-8" />} label="Monto recaudado" valor={`$${data.ingresos_totales.toLocaleString()}`} />
      </div>

      {/* Gráficas */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <GraficaBar titulo="🎯 Boletos por Rifa" categorias={data.boletos_por_rifa.map(r => r.nombre)} series={[{ name: "Vendidos", data: data.boletos_por_rifa.map(r => r.vendidos) }]} />
        <GraficaArea titulo="📅 Rifas por Mes" categorias={Object.keys(data.rifas_por_mes)} series={[{ name: "Rifas", data: Object.values(data.rifas_por_mes) }]} />
        <GraficaDonut titulo="💳 Métodos de Pago" labels={["SPEI", "OXXO", "TARJETA"]} series={["SPEI", "OXXO", "TARJETA"].map(m => data.metodos_pago[m] || 0)} />
        <GraficaBar titulo="📏 % Vendidos por Tamaño" categorias={Object.keys(data.porcentaje_vendidos_por_tamano)} series={[{ name: "% Vendido", data: Object.values(data.porcentaje_vendidos_por_tamano) }]} />
        <GraficaBar titulo="🎟️ % Ventas por Precio" categorias={Object.keys(data.porcentaje_por_precio)} series={[{ name: "% Ventas", data: Object.values(data.porcentaje_por_precio) }]} />
        <GraficaBar titulo="💵 Precio Promedio por Rifa" categorias={data.promedio_precio_por_rifa.map(r => r.nombre)} series={[{ name: "Promedio", data: data.promedio_precio_por_rifa.map(r => r.promedio) }]} />
      </div>

      {/* Tabla de Códigos Promocionales */}
      {data.codigos_mas_usados?.length > 0 && (
        <div className={chartStyle + " mt-10"}>
          <h3 className="text-center font-semibold mb-2 text-white">🔥 Códigos Promocionales Más Usados</h3>
          <table className="w-full text-sm text-white">
            <thead className="border-b border-white/20">
              <tr>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-right">Usos</th>
                <th className="p-2 text-right">Monto Generado</th>
              </tr>
            </thead>
            <tbody>
              {data.codigos_mas_usados.map((c) => (
                <tr key={c.codigo__codigo} className="border-t border-white/10">
                  <td className="p-2 text-yellow-300 font-bold">{c.codigo__codigo}</td>
                  <td className="p-2 text-right">{c.total}</td>
                  <td className="p-2 text-right">${c.monto_generado?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Indicador = ({ icon, label, valor }) => (
  <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
    {icon}
    <div>
      <p className="text-sm text-white">{label}</p>
      <p className="text-xl font-bold text-white">{valor}</p>
    </div>
  </div>
);

const GraficaBar = ({ titulo, categorias, series }) => (
  <div className="bg-white/10 p-4 rounded-xl">
    <h3 className="text-center font-semibold mb-2 text-white">{titulo}</h3>
    <Chart
      type="bar"
      series={series}
      options={{
        chart: { toolbar: { show: false } },
        xaxis: { categories, labels: { style: { colors: "#ffffff" } } },
        yaxis: { labels: { style: { colors: "#ffffff" } } },
        colors: ["#facc15"],
        dataLabels: { style: { colors: ["#ffffff"] } },
      }}
    />
  </div>
);

const GraficaArea = ({ titulo, categorias, series }) => (
  <div className="bg-white/10 p-4 rounded-xl">
    <h3 className="text-center font-semibold mb-2 text-white">{titulo}</h3>
    <Chart
      type="area"
      series={series}
      options={{
        chart: { toolbar: { show: false } },
        xaxis: { categories, labels: { style: { colors: "#ffffff" } } },
        yaxis: { labels: { style: { colors: "#ffffff" } } },
        colors: ["#38bdf8"]
      }}
    />
  </div>
);

const GraficaDonut = ({ titulo, labels, series }) => (
  <div className="bg-white/10 p-4 rounded-xl">
    <h3 className="text-center font-semibold mb-2 text-white">{titulo}</h3>
    <Chart
      type="donut"
      series={series}
      options={{
        labels,
        colors: ["#22c55e", "#f97316", "#ef4444"],
        legend: { labels: { colors: "#ffffff" } },
        dataLabels: { style: { colors: ["#ffffff"] } },
      }}
    />
  </div>
);

export default Estadisticas;
