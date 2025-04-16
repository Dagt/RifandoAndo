import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, Printer, Home, Search } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const InstruccionesPago = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const refContenido = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!state || !state.referencia || !state.codigo_barras) {
      navigate("/");
    }
  }, [state, navigate]);

  const imprimir = () => window.print();

  const descargarPDF = () => {
    const input = refContenido.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`instrucciones_pago_${state.referencia}.pdf`);
    });
  };

  return (
    <div className="min-h-screen p-6 bg-[url('/fondo-galaxia.jpg')] bg-cover bg-center flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-yellow-400">Instrucciones de Pago</h2>

        </div>
        <div className="flex gap-3">
          <button
            onClick={descargarPDF}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Download className="w-5 h-5" /> PDF
          </button>
          <button
            onClick={imprimir}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Printer className="w-5 h-5" /> Imprimir
          </button>
        </div>
        <div
          ref={refContenido}
          className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 text-white space-y-5 shadow-xl"
        >
          <p>
            Hola <strong>{state.nombre}</strong>, has apartado{" "}
            <strong>{state.boletos.length}</strong> boletos para la rifa{" "}
            <strong>{state.rifa}</strong>.
          </p>

          <div>
            <p className="text-lg font-bold text-yellow-300">💵 Monto:</p>
            <p className="text-xl font-mono bg-black/50 p-3 rounded border border-white/20 tracking-widest">
              ${state.monto}
            </p>
          </div>

          <div>
            <p className="text-lg font-bold text-yellow-300">🔢 Referencia para pagar:</p>
            <p className="text-xl font-mono bg-black/50 p-3 rounded border border-white/20 tracking-widest">
              {state.referencia}
            </p>
          </div>

          <div>
            <p className="text-lg font-bold text-yellow-300">📅 Expira el:</p>
            <p className="bg-black/30 p-2 rounded border border-white/10">
              {state.expira_pago
                ? new Date(state.expira_pago * 1000).toLocaleString("es-MX")
                : "Fecha no disponible"}
            </p>
          </div>

          <div>
            <p className="text-lg font-bold text-yellow-300">📎 Código de barras:</p>
            <img
              src={state.codigo_barras}
              alt="Código de barras"
              className="mx-auto max-w-xs bg-white p-2 rounded"
            />
          </div>

          <p className="text-sm text-white/80 pt-4 border-t border-white/10">
            Puedes acudir a cualquier tienda OXXO, 7-Eleven, Farmacias del Ahorro y más a pagar
            usando la referencia mostrada. Conserva tu ticket y verifica el estado en el verificador
            del sitio.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </button>
          <button
            onClick={() =>
              navigate(`/verificador?folio=${state.folio || ""}`)
            }
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded"
          >
            <Search className="w-5 h-5" />
            Verificar mi compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstruccionesPago;
