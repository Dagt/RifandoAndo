// CrearRifaExclusiva.jsx
import React, { useState } from "react";

const CrearRifaExclusiva = () => {
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    total_boletos: "",
    valor_premio: "",
    enlace_video: "",
  });

  const [imagenes, setImagenes] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagenesChange = (e) => {
    setImagenes([...e.target.files]);
  };

  const reiniciarFormulario = () => {
    setFormulario({
      nombre: "",
      descripcion: "",
      total_boletos: "",
      valor_premio: "",
      enlace_video: "",
    });
    setImagenes([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    setMensaje(null);
    setSubiendo(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/exclusiva/crear-rifa/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formulario),
      });

      const data = await response.json();
      if (!response.ok) {
        setMensaje("❌ Error: " + (data.error || "No se pudo crear la rifa"));
        setSubiendo(false);
        return;
      }

      const rifaId = data.id;
      let erroresSubida = 0;

      for (let imagen of imagenes) {
        const formData = new FormData();
        formData.append("imagen", imagen);

        const subir = await fetch(`/api/subir-imagen-exclusiva/${rifaId}/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!subir.ok) erroresSubida++;
      }

      setMensaje(
        erroresSubida === 0
          ? "✅ Rifa exclusiva creada exitosamente."
          : `⚠️ Rifa creada, pero ${erroresSubida} imagen(es) fallaron.`
      );

      reiniciarFormulario();
      setTimeout(() => setMensaje(null), 6000);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error de conexión con el servidor.");
    }
    setSubiendo(false);
  };

  return (
    <div className="min-h-screen p-6 text-white flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-6">
          Crear Rifa Exclusiva
        </h2>

        {mensaje && (
          <div
            className={`text-center mb-4 p-3 rounded-md font-bold ${
              mensaje.includes("✅")
                ? "bg-green-600/30 text-green-300"
                : mensaje.includes("⚠️")
                ? "bg-yellow-600/30 text-yellow-300"
                : "bg-red-600/30 text-red-300"
            }`}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ label: "Nombre", name: "nombre" },
            { label: "Descripción", name: "descripcion" },
            { label: "Total de boletos", name: "total_boletos", type: "number" },
            { label: "Valor del premio principal", name: "valor_premio", type: "number" },
            { label: "Enlace del video (opcional)", name: "enlace_video", type: "url" }].map(
            ({ label, name, type = "text" }) => (
              <div key={name}>
                <label className="block text-sm font-bold mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formulario[name]}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
                  required={name !== "enlace_video"}
                />
              </div>
            )
          )}

          <div>
            <label className="block text-sm font-bold mb-1">Imágenes del premio</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagenesChange}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-white hover:file:bg-yellow-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={subiendo}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition"
          >
            {subiendo ? "Creando..." : "Crear Rifa Exclusiva"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearRifaExclusiva;
