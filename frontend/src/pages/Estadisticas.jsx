import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Papa from "papaparse";
import {
  Gift, TicketCheck, PieChart, Banknote, Star, TrendingUp,
  TimerReset, PlusCircle, Check, X
} from "lucide-react";
import TablaCodigosPromocionales from "@/components/TablaCodigosPromocionales";

const Estadisticas = () => {
  const [data, setData] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [rifaSeleccionada, setRifaSeleccionada] = useState("");
  const [rifasDisponibles, setRifasDisponibles] = useState([]);

  useEffect(() => {
    fetch("/api/rifas/?page_size=100")
      .then(res => res.json())
      .then(res => setRifasDisponibles(res.results || []));
  }, []);

  const cargarEstadisticas = () => {
    let url = "/api/estadisticas/?";
    if (fechaInicio) url += `fecha_inicio=${fechaInicio}&`;
    if (fechaFin) url += `fecha_fin=${fechaFin}&`;
    if (rifaSeleccionada) url += `rifa_id=${rifaSeleccionada}`;
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  };

  useEffect(() => {
    cargarEstadisticas();
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
    const csvData = Array.isArray(data?.codigos_mas_usados)
      ? data.codigos_mas_usados.map(c => ({
        codigo: c.codigo,
        tipo: c.tipo,
        usos: c.usos,
        monto_generado: c.monto_generado,
        ticket_promedio: c.ticket_promedio,
        porcentaje_total: c.porcentaje_del_total
      })) : [];
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
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md overflow-x-auto">
      <h3 className="text-center font-semibold mb-2 text-white">{title}</h3>
      <div style={{ minWidth: Math.max((categories?.length || 1) * 80, 300) }}>
        <Chart
          type={type}
          series={type === "pie" || type === "donut" ? series : [{ name: title, data: series }]}
          options={{
            labels: categories,
            xaxis: { categories, labels: { style: { colors: "#fff" } } },
            yaxis: { labels: { style: { colors: "#fff" } } },
            legend: { labels: { colors: "#fff" } },
            dataLabels: { style: { colors: ["#fff"] } },
            colors: Array.isArray(color) ? color : [color]
          }}
        />
      </div>
    </div>
  );

  const ticketPromedioVisible = (data.ticket_promedio_por_rifa || []).filter(r => r.ticket_promedio < 10000).slice(0, 10);

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-3xl font-bold text-center mb-6 text-yellow-400">📊 Estadísticas Generales</h2>

      {/* Filtros y exportación */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-white/10 px-2 py-1 rounded" />
        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-white/10 px-2 py-1 rounded" />
        <select value={rifaSeleccionada} onChange={e => setRifaSeleccionada(e.target.value)} className="bg-white/10 px-2 py-1 rounded">
          <option value="">Todas las rifas</option>
          {rifasDisponibles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
        <button onClick={cargarEstadisticas} className="bg-emerald-500 hover:bg-emerald-600 px-4 py-1 rounded text-sm font-bold">Filtrar</button>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button onClick={exportToPDF} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold">Exportar PDF</button>
        <button onClick={exportToCSV} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm font-bold">Exportar CSV</button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <Card icon={<Gift />} label="Rifas activas" value={data.activas} color="text-orange-300" />
        <Card icon={<TimerReset />} label="Rifas en espera" value={data.en_espera} color="text-yellow-300" />
        <Card icon={<PieChart />} label="Rifas finalizadas" value={data.finalizadas} color="text-purple-300" />
        <Card icon={<TicketCheck />} label="Boletos vendidos" value={data.boletos_vendidos} color="text-green-300" />
        <Card icon={<PlusCircle />} label="Boletos regalo" value={data.boletos_regalados || 0} color="text-indigo-300" />
        <Card icon={<Banknote />} label="Monto recaudado" value={`$${data.ingresos_totales.toLocaleString()}`} color="text-emerald-300" />
        <Card icon={<Star />} label="Códigos activos" value={data.codigos_activos} color="text-blue-300" />
        <Card icon={<Star />} label="Códigos expirados" value={data.codigos_expirados} color="text-red-300" />
        <Card icon={<TrendingUp />} label="Ingresos por códigos" value={`$${data.total_generado_por_codigos.toLocaleString()}`} color="text-yellow-200" />
        <Card icon={<PlusCircle />} label="Links Generados" value={data.links_referidos.total_generados} color="text-indigo-300" />
        <Card icon={<Check />} label="Links Usados" value={data.links_referidos.total_usados} color="text-green-300" />
        <Card icon={<X />} label="Links Expirados" value={data.links_referidos.total_expirados} color="text-red-300" />
        <Card icon={<PieChart />} label="% Conversión Links" value={`${data.links_referidos.porcentaje_conversion}%`} color="text-yellow-300" />
      </div>

      {/* Gráficas principales */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Rifas por Estado" type="pie" series={[data.activas, data.en_espera, data.finalizadas]} categories={["Activas", "En espera", "Finalizadas"]} color={["#f97316", "#facc15", "#a78bfa"]} />
        <ChartCard title="Boletos por Rifa" type="bar" series={data.boletos_por_rifa.map(r => r.vendidos)} categories={data.boletos_por_rifa.map(r => r.nombre)} color="#facc15" />
        <ChartCard title="Métodos de Pago" type="donut" series={["SPEI", "OXXO", "TARJETA"].map(m => data.metodos_pago[m] || 0)} categories={["SPEI", "OXXO", "TARJETA"]} color={["#22c55e", "#f97316", "#ef4444"]} />
        <ChartCard title="Rifas por Mes" type="area" series={Object.values(data.rifas_por_mes)} categories={Object.keys(data.rifas_por_mes)} color="#38bdf8" />
        <ChartCard title="% Vendido por Tamaño" type="bar" series={Object.values(data.porcentaje_vendidos_por_tamano)} categories={Object.keys(data.porcentaje_vendidos_por_tamano)} color="#34d399" />
        <ChartCard title="% Ventas por Precio" type="bar" series={Object.values(data.porcentaje_por_precio)} categories={Object.keys(data.porcentaje_por_precio)} color="#f87171" />
        <ChartCard title="Ticket Promedio por Método" type="bar" series={Object.values(data.ticket_promedio_por_metodo)} categories={Object.keys(data.ticket_promedio_por_metodo)} color="#7c3aed" />
        <ChartCard title="Ticket Promedio por Rifa" type="bar" series={ticketPromedioVisible.map(r => r.ticket_promedio)} categories={ticketPromedioVisible.map(r => r.nombre)} color="#4ade80" />
        <ChartCard title="Top Códigos por Ingresos" type="bar" series={Object.values(data.ingresos_por_codigo)} categories={Object.keys(data.ingresos_por_codigo)} color="#fcd34d" />
        <ChartCard title="Distribución por Tipo de Código" type="pie" series={Object.values(data.distribucion_tipo_codigo)} categories={Object.keys(data.distribucion_tipo_codigo)} color={["#60a5fa", "#ec4899"]} />
        <ChartCard title="Usos de Códigos por Mes" type="area" series={Object.values(data.usos_por_codigo_por_mes)} categories={Object.keys(data.usos_por_codigo_por_mes)} color="#22d3ee" />
        <ChartCard title="Estado de Transacciones" type="pie" series={[data.transacciones_completadas, data.transacciones_canceladas]} categories={["Completadas", "Canceladas"]} color={["#22c55e", "#ef4444"]} />
        <ChartCard title="Proporción Ventas (Con vs Sin Link)" type="donut" series={[data.ventas_por_links.total_usando_link, data.ventas_por_links.total_generaron_link]} categories={["Con Link", "Sin Link"]} color={["#10b981", "#3b82f6"]} />
        <ChartCard title="Top Rifas con más Uso de Links" type="bar" series={data.uso_links_por_rifa.map(r => r.usos)} categories={data.uso_links_por_rifa.map(r => r.nombre_rifa)} color="#f59e0b" />
      </div>

      {/* Tabla códigos */}
      <TablaCodigosPromocionales codigos={data.codigos_mas_usados} />
    </div>
  );
};

export default Estadisticas;
