// Estadisticas.jsx mejorado con paginación y visualización explicativa mejorada
import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { TicketCheck, Gift, PieChart, Banknote, Star, TrendingUp, TimerReset } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Papa from "papaparse";

const Estadisticas = () => {
  const [data, setData] = useState(null);
  const [pagina, setPagina] = useState(0);
  const codigosPorPagina = 10;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/estadisticas/")
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Error cargando estadísticas:", err));
  }, []);

  const exportToPDF = () => {
    html2canvas(document.body, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("estadisticas.pdf");
    });
  };

  const exportToCSV = () => {
    const csvData = data.codigos_mas_usados.map(c => ({
      codigo: c.codigo,
      tipo: c.tipo,
      usos: c.usos,
      monto_generado: c.monto_generado,
      ticket_promedio: c.ticket_promedio,
      porcentaje_total: c.porcentaje_del_total
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "codigos_promocionales.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data) return <p className="text-white text-center mt-10">Cargando estadísticas...</p>;

  const chartStyle = "bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md";
  const ticketPromedioVisible = data.ticket_promedio_por_rifa.filter(r => r.ticket_promedio < 10000).slice(0, 10);
  const codigosPaginados = data.codigos_mas_usados.slice(pagina * codigosPorPagina, (pagina + 1) * codigosPorPagina);

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-center mb-6 text-yellow-400">📊 Estadísticas Generales</h2>

      <div className="flex justify-center gap-4 mb-8">
        <button onClick={exportToPDF} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold">Exportar PDF</button>
        <button onClick={exportToCSV} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm font-bold">Exportar CSV</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <Card icon={<Gift />} label="Rifas activas" value={data.activas} color="text-orange-300" />
        <Card icon={<TimerReset />} label="Rifas en espera" value={data.en_espera} color="text-yellow-300" />
        <Card icon={<PieChart />} label="Rifas finalizadas" value={data.finalizadas} color="text-purple-300" />
        <Card icon={<TicketCheck />} label="Boletos vendidos" value={data.boletos_vendidos} color="text-green-300" />
        <Card icon={<Banknote />} label="Monto recaudado" value={`$${data.ingresos_totales.toLocaleString()}`} color="text-emerald-300" />
        <Card icon={<Star />} label="Códigos activos" value={data.codigos_activos} color="text-blue-300" />
        <Card icon={<Star />} label="Códigos expirados" value={data.codigos_expirados} color="text-red-300" />
        <Card icon={<TrendingUp />} label="Ingresos por códigos" value={`$${data.total_generado_por_codigos.toLocaleString()}`} color="text-yellow-200" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Rifas por Estado" type="pie" series={[data.activas, data.en_espera, data.finalizadas]} categories={["Activas", "En espera", "Finalizadas"]} color={["#f97316", "#facc15", "#a78bfa"]} />
        <ChartCard title="Boletos por Rifa" type="bar" series={[{ name: "Vendidos", data: data.boletos_por_rifa.map(r => r.vendidos) }]} categories={data.boletos_por_rifa.map(r => r.nombre)} color="#facc15" />
        <ChartCard title="Métodos de Pago" type="donut" series={["SPEI", "OXXO", "TARJETA"].map(m => data.metodos_pago[m] || 0)} categories={["SPEI", "OXXO", "TARJETA"]} color={["#22c55e", "#f97316", "#ef4444"]} />
        <ChartCard title="Rifas por Mes" type="area" series={[{ name: "Rifas", data: Object.values(data.rifas_por_mes) }]} categories={Object.keys(data.rifas_por_mes)} color="#38bdf8" />
        <ChartCard title="% Boletos vendidos por Tamaño" type="bar" series={[{ name: "% Vendido", data: Object.values(data.porcentaje_vendidos_por_tamano) }]} categories={Object.keys(data.porcentaje_vendidos_por_tamano)} color="#34d399" />
        <ChartCard title="% Ventas por Precio" type="bar" series={[{ name: "% Ventas", data: Object.values(data.porcentaje_por_precio) }]} categories={Object.keys(data.porcentaje_por_precio)} color="#f87171" />
        <ChartCard title="Ticket Promedio por Método" type="bar" series={[{ name: "Promedio", data: Object.values(data.ticket_promedio_por_metodo) }]} categories={Object.keys(data.ticket_promedio_por_metodo)} color="#7c3aed" />
        <ChartCard title="Ticket Promedio por Rifa" type="bar" series={[{ name: "Promedio", data: ticketPromedioVisible.map(r => r.ticket_promedio) }]} categories={ticketPromedioVisible.map(r => r.nombre)} color="#4ade80" />
        <ChartCard title="Top Códigos por Ingresos" type="bar" series={[{ name: "Ingresos", data: Object.values(data.ingresos_por_codigo) }]} categories={Object.keys(data.ingresos_por_codigo)} color="#fcd34d" />
        <ChartCard title="Distribución por Tipo de Código" type="pie" series={Object.values(data.distribucion_tipo_codigo)} categories={Object.keys(data.distribucion_tipo_codigo)} color={["#60a5fa", "#ec4899"]} />
        <ChartCard title="Usos de Códigos por Mes" type="area" series={[{ name: "Usos", data: Object.values(data.usos_por_codigo_por_mes) }]} categories={Object.keys(data.usos_por_codigo_por_mes)} color="#22d3ee" />
        <ChartCard title="Estado de Transacciones" type="pie" series={[data.transacciones_completadas, data.transacciones_canceladas]} categories={["Completadas", "Canceladas"]} color={["#22c55e", "#ef4444"]} />
      </div>

      <div className={chartStyle + " col-span-full mt-20 overflow-x-auto"}>
        <h3 className="text-center font-semibold mb-4 text-white text-xl">🔥 Códigos Promocionales</h3>
        <table className="w-full text-sm text-white text-left border-collapse">
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
            {codigosPaginados.map(c => (
              <tr key={c.codigo} className={c.porcentaje_del_total >= 25 ? "bg-yellow-800/20" : "border-t border-white/10"}>
                <td className="p-2 font-bold text-yellow-300">{c.codigo}</td>
                <td className="p-2">{c.tipo}</td>
                <td className="p-2">{c.usos}</td>
                <td className="p-2">${c.monto_generado.toFixed(2)}</td>
                <td className="p-2">${c.ticket_promedio.toFixed(2)}</td>
                <td className="p-2">{c.porcentaje_del_total.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center mt-4 space-x-2">
          <button disabled={pagina === 0} onClick={() => setPagina(p => p - 1)} className="bg-white/10 px-3 py-1 rounded hover:bg-white/20">Anterior</button>
          <button disabled={(pagina + 1) * codigosPorPagina >= data.codigos_mas_usados.length} onClick={() => setPagina(p => p + 1)} className="bg-white/10 px-3 py-1 rounded hover:bg-white/20">Siguiente</button>
        </div>
      </div>

      <div className="mt-10 bg-white/5 p-6 rounded-xl space-y-4">
        <h4 className="text-lg font-semibold text-white">📘 Cómo interpretar las gráficas:</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li><b>Rifas por Estado:</b> cantidad actual de rifas activas, en espera y finalizadas.</li>
          <li><b>Boletos por Rifa:</b> muestra cuáles rifas han vendido más boletos.</li>
          <li><b>Métodos de Pago:</b> compara la popularidad de SPEI, OXXO y tarjeta.</li>
          <li><b>% Boletos por Tamaño:</b> qué tanto se están vendiendo proporcionalmente las rifas según su tamaño total de boletos (no suma 100%).</li>
          <li><b>% Ventas por Precio:</b> qué precios de boleto generan más ventas.</li>
          <li><b>Ticket Promedio por Método:</b> cuánto gasta en promedio un usuario por tipo de pago.</li>
          <li><b>Ticket Promedio por Rifa:</b> gasto promedio por comprador en cada rifa (se omiten valores extremos > $10,000).</li>
          <li><b>Top Códigos por Ingresos:</b> qué códigos han generado más dinero.</li>
          <li><b>Distribución por Tipo de Código:</b> tipos de códigos usados (porcentaje o boletos gratis).</li>
          <li><b>Usos de Códigos por Mes:</b> evolución mensual del uso de códigos.</li>
          <li><b>Estado de Transacciones:</b> transacciones completadas vs canceladas.</li>
        </ul>
      </div>
    </div>
  );
};

const Card = ({ icon, label, value, color }) => (
  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-center gap-4">
    <div className={`w-10 h-10 text-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-white/80">{label}</p>
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