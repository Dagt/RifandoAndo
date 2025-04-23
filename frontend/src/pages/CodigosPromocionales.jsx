import React, { useEffect, useState } from "react";

const CodigosPromocionalesAdmin = () => {
  const [codigos, setCodigos] = useState([]);
  const [nuevoCodigo, setNuevoCodigo] = useState({
    codigo: "",
    tipo: "porcentaje",
    valor: "",
    compra_minima: "",
    fecha_expiracion: "",
    usos_maximos: "",
    rifas: [],
  });
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("/api/codigos-promocionales/")
      .then((res) => res.json())
      .then((data) => setCodigos(data))
      .catch((err) => console.error("Error al cargar códigos", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoCodigo((prev) => ({ ...prev, [name]: value }));
  };

  const crearCodigo = (e) => {
    e.preventDefault();
    fetch("/api/codigos-promocionales/crear/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoCodigo),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setCodigos((prev) => [data, ...prev]);
          setMensaje("✅ Código creado correctamente.");
          setNuevoCodigo({
            codigo: "",
            tipo: "porcentaje",
            valor: "",
            compra_minima: "",
            fecha_expiracion: "",
            usos_maximos: "",
            rifas: [],
          });
        } else {
          setMensaje("❌ Error al crear código.");
        }
      })
      .catch((err) => {
        console.error("Error al crear código", err);
        setMensaje("❌ Error al crear código.");
      });
  };

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-center text-yellow-400 mb-6">
        🎫 Gestión de Códigos Promocionales
      </h1>

      {mensaje && (
        <div className="mb-4 bg-white/10 p-3 rounded text-sm text-center">{mensaje}</div>
      )}

      <form
        onSubmit={crearCodigo}
        className="grid md:grid-cols-3 gap-4 mb-8 bg-white/10 p-4 rounded-xl backdrop-blur-md shadow-md"
      >
        <input
          type="text"
          name="codigo"
          placeholder="Código"
          className="p-2 rounded bg-white/20 text-white"
          value={nuevoCodigo.codigo}
          onChange={handleChange}
          required
        />

        <select
          name="tipo"
          className="p-2 rounded bg-white/20 text-white"
          value={nuevoCodigo.tipo}
          onChange={handleChange}
        >
          <option value="porcentaje">Descuento (%)</option>
          <option value="boletos_extra">Boletos extra</option>
        </select>

        <input
          type="number"
          name="valor"
          placeholder="Valor"
          className="p-2 rounded bg-white/20 text-white"
          value={nuevoCodigo.valor}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="compra_minima"
          placeholder="Compra mínima"
          className="p-2 rounded bg-white/20 text-white"
          value={nuevoCodigo.compra_minima}
          onChange={handleChange}
        />

        <input
          type="datetime-local"
          name="fecha_expiracion"
          className="p-2 rounded bg-white/20 text-white"
          value={nuevoCodigo.fecha_expiracion}
          onChange={handleChange}
        />

        <input
          type="number"
          name="usos_maximos"
          placeholder="Límite de usos"
          className="p-2 rounded bg-white/20 text-white"
          value={nuevoCodigo.usos_maximos}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 transition text-white font-bold py-2 px-4 rounded col-span-full"
        >
          ➕ Crear código
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-white text-left border border-white/10">
          <thead className="bg-white/10">
            <tr>
              <th className="p-2">Código</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Usos</th>
              <th className="p-2">Expira</th>
              <th className="p-2">Compra mínima</th>
            </tr>
          </thead>
          <tbody>
            {codigos.map((c) => (
              <tr key={c.id} className="border-t border-white/10">
                <td className="p-2 font-bold text-yellow-300">{c.codigo}</td>
                <td className="p-2 capitalize">{c.tipo}</td>
                <td className="p-2">{c.valor}</td>
                <td className="p-2">{c.usos_actuales} / {c.usos_maximos || "∞"}</td>
                <td className="p-2">{c.fecha_expiracion ? new Date(c.fecha_expiracion).toLocaleString("es-MX") : "—"}</td>
                <td className="p-2">{c.compra_minima ? `$${c.compra_minima}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CodigosPromocionalesAdmin;
