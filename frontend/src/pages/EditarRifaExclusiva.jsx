import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";

const EditarRifaExclusiva = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const inputImagenesRef = useRef();

  useEffect(() => {
    const obtenerDatos = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/exclusiva/rifa/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDatos(data);
    };
    obtenerDatos();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setDatos((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  // Si la rifa NO está finalizada, eliminamos esos campos antes de enviar
  const datosParaEnviar = { ...datos };
  if (!datos.finalizada) {
    delete datosParaEnviar.numero_ganador;
    delete datosParaEnviar.enlace_video;
    delete datosParaEnviar.id_boleto_jackpot;
  }

  const res = await fetch(`/api/exclusiva/rifa/${id}/editar/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datosParaEnviar),
  });

  const data = await res.json();
  if (!res.ok) {
    setMensaje("❌ Error: " + (data.error || "No se pudo actualizar"));
    return;
  }

  // Subida de imágenes, como ya lo tienes
  for (let imagen of imagenes) {
    const formData = new FormData();
    formData.append("imagen", imagen);
    await fetch(`/api/subir-imagen-exclusiva/${id}/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  }

  setMensaje("✅ Rifa actualizada correctamente.");
  setTimeout(() => setMensaje(null), 5000);
};


  const handleUpload = () => {
    const archivos = inputImagenesRef.current?.files;
    if (archivos && archivos.length > 0) setImagenes([...archivos]);
  };

  if (!datos) return <div className="text-white p-6">Cargando...</div>;

  return (
    <div className="min-h-screen p-6 text-white flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-6">
          Editar Rifa Exclusiva
        </h2>

        {mensaje && (
          <div
            className={`text-center mb-4 p-3 rounded-md font-bold ${
              mensaje.includes("✅")
                ? "bg-green-600/30 text-green-300"
                : "bg-red-600/30 text-red-300"
            }`}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Nombre</label>
            <input
              name="nombre"
              value={datos.nombre}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={datos.descripcion}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            ></textarea>
          </div>

          {datos.finalizada && (
            <>
              <div>
                <label className="block text-sm font-bold mb-1">Número ganador</label>
                <input
                  name="numero_ganador"
                  type="number"
                  value={datos.numero_ganador || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">ID boleto ganador del Jackpot</label>
                <input
                  name="id_boleto_jackpot"
                  type="text"
                  value={datos.id_boleto_jackpot || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">URL del video</label>
                <input
                  name="enlace_video"
                  type="url"
                  value={datos.enlace_video || ""}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold mb-1">¿Finalizar si se recupera el valor del premio + Jackpot?</label>
            <input
              name="permitir_finalizacion_por_valor"
              type="checkbox"
              checked={datos.permitir_finalizacion_por_valor || false}
              onChange={handleChange}
            />
          </div>

          <div className="bg-white/10 border border-white/20 p-4 rounded-xl mb-4">
            <h3 className="text-lg font-bold mb-2 text-yellow-300 flex items-center gap-2">
              <Camera className="w-5 h-5" /> Agregar más imágenes
            </h3>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={inputImagenesRef}
              onChange={handleUpload}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded"
          >
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditarRifaExclusiva;
