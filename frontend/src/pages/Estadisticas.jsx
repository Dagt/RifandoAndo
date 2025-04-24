
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { TicketCheck, Gift, PieChart, Banknote, Percent, Star, TrendingUp } from "lucide-react";
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
      { métrica: "Promedio por rifa", valor: data.promedio_precio_general },
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <Card icon={<Gift className="text-yellow-400" />} label="Rifas activas" value={data.activas} color="text-orange-300" />
        <Card icon={<TicketCheck className="text-green-400" />} label="Boletos vendidos" value={data.boletos_vendidos} color="text-green-300" />
        <Card icon={<PieChart className="text-purple-400" />} label="Rifas finalizadas" value={data.finalizadas} color="text-purple-300" />
        <Card icon={<Banknote className="text-emerald-400" />} label="Monto recaudado" value={"$" + data.ingresos_totales.toLocaleString()} color="text-emerald-300" />
        <Card icon={<Percent className="text-pink-400" />} label="Promedio por rifa" value={"$" + data.promedio_precio_general.toFixed(2)} color="text-pink-300" />
        <Card icon={<Star className="text-blue-400" />} label="Códigos activos" value={data.codigos_activos} color="text-blue-200" />
        <Card icon={<Star className="text-red-400" />} label="Códigos expirados" value={data.codigos_expirados} color="text-red-200" />
        <Card icon={<TrendingUp className="text-yellow-300" />} label="Total generado por códigos" value={"$" + data.total_generado_codigos.toLocaleString()} color="text-yellow-100" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Boletos Vendidos por Rifa" type="bar" series={[{ name: "Vendidos", data: data.boletos_por_rifa.map(r => r.vendidos) }]} categories={data.boletos_por_rifa.map(r => r.nombre)} color="#facc15" />
        <ChartCard title="Rifas por Mes" type="area" series={[{ name: "Rifas", data: Object.values(data.rifas_por_mes) }]} categories={Object.keys(data.rifas_por_mes)} color="#38bdf8" />
        <ChartCard title="Métodos de Pago" type="donut" series={["SPEI", "OXXO", "TARJETA"].map(m => data.metodos_pago[m] || 0)} categories={["SPEI", "OXXO", "TARJETA"]} color={["#22c55e", "#f97316", "#ef4444"]} />
        <ChartCard title="% de Boletos Vendidos por Tamaño" type="bar" series={[{ name: "% Vendido", data: Object.values(data.porcentaje_vendidos_por_tamano) }]} categories={Object.keys(data.porcentaje_vendidos_por_tamano)} color="#34d399" />
        <ChartCard title="% de Ventas por Precio" type="bar" series={[{ name: "% Ventas", data: Object.values(data.porcentaje_por_precio) }]} categories={Object.keys(data.porcentaje_por_precio)} color="#f87171" />
        <ChartCard title="Ticket Promedio por Método" type="bar" series={[{ name: "Promedio", data: Object.values(data.ticket_promedio_por_metodo) }]} categories={Object.keys(data.ticket_promedio_por_metodo)} color="#7c3aed" />
      </div>

      <div className={chartStyle + " col-span-full mt-8"}>
        <h3 className="text-center font-semibold mb-2 text-white">🔥 Códigos Promocionales</h3>
        <table className="w-full text-sm text-white text-left">
          <thead className="border-b border-white/10">
            <tr>
              <th className="p-2">Código</th>
              <th className="p-2">Usos</th>
              <th className="p-2">Monto generado</th>
              <th className="p-2">Ticket promedio</th>
              <th className="p-2">% del total</th>
            </tr>
          </thead>
          <tbody>
            {data.codigos_mas_usados.map(c => (
              <tr key={c.codigo__codigo} className="border-t border-white/10">
                <td className="p-2 font-bold text-yellow-300">{c.codigo__codigo}</td>
                <td className="p-2">{c.usos}</td>
                <td className="p-2">${c.monto_generado.toFixed(2)}</td>
                <td className="p-2">${c.ticket_promedio.toFixed(2)}</td>
                <td className="p-2">{c.porcentaje_total.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Card = ({ icon, label, value, color }) => (
  <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
    <div className="w-10 h-10">{icon}</div>
    <div>
      <p className="text-sm">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

const ChartCard = ({ title, type, series, categories, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md">
    <h3 className="text-center font-semibold mb-2 text-white">{title}</h3>
    <Chart
      type={type}
      series={series}
      options={{
        labels: categories,
        xaxis: { categories, labels: { style: { colors: "#ffffff" } } },
        yaxis: { labels: { style: { colors: "#ffffff" } } },
        colors: Array.isArray(color) ? color : [color],
        legend: { labels: { colors: "#ffffff" } },
        dataLabels: { style: { colors: ["#ffffff"] } },
      }}
    />
  </div>
);

export default Estadisticas;
