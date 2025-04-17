import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditarRifa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rifa, setRifa] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/rifas/${id}/`)
      .then(res => res.json())
      .then(data => {
        setRifa(data);
        setForm(data);
        setLoading(false);
      });
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/rifas/${id}/editar/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMensaje("Rifa actualizada correctamente.");
      setTimeout(() => navigate("/admin/rifas"), 1500);
    } else {
      setMensaje("Error al guardar cambios.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const archivo = e.target.imagen.files[0];
    if (!archivo) return;

    const formData = new FormData();
    formData.append("imagen", archivo);

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/subir-imagen/${id}/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });

    if (res.ok) {
      alert("Imagen subida correctamente");
      e.target.reset();
    } else {
      alert("Error al subir imagen");
    }
  };

  if (loading) return <p className="text-white text-center mt-10">Cargando...</p>;

  const esEnEspera = rifa.estado === "en_espera";
  const esActiva = rifa.estado === "activa";
  const esFinalizada = rifa.estado === "finalizada";

  return (
    <div className="min-h-screen p-6 text-white">
      <h2 className="text-2xl font-bold text-orange-400 mb-4 text-center">Editar Rifa #{id}</h2>

      {mensaje && <p className="text-center text-sm text-green-400 mb-4">{mensaje}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">

        {esEnEspera && (
          <div className="bg-white/10 border border-white/20 p-4 rounded-xl">
            <h3 className="text-lg font-bold mb-2 text-yellow-300">📸 Agregar más imágenes</h3>
            <form onSubmit={handleUpload} className="space-y-2">
              <input type="file" name="imagen" accept="image/*" className="block w-full text-sm" />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-bold w-full"
              >
                Subir imagen
              </button>
            </form>
          </div>
        )}

        {(esEnEspera || esActiva) && (
          <div>
            <label className="block mb-1 font-semibold">Nombre</label>
            <input type="text" name="nombre" value={form.nombre || ""} onChange={handleChange}
              className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
          </div>
        )}

        {(esEnEspera || esActiva) && (
          <div>
            <label className="block mb-1 font-semibold">Descripción</label>
            <textarea name="descripcion" value={form.descripcion || ""} onChange={handleChange}
              className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
          </div>
        )}

        {esEnEspera && (
          <>
            <div>
              <label className="block mb-1 font-semibold">Total de boletos</label>
              <input type="number" name="total_boletos" value={form.total_boletos || ""} onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Precio del boleto</label>
              <input type="number" name="precio_boleto" value={form.precio_boleto || ""} onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Fecha de inicio</label>
              <input type="date" name="fecha_inicio" value={form.fecha_inicio || ""} onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Fecha de finalización</label>
              <input type="date" name="fecha_fin" value={form.fecha_fin || ""} onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
            </div>
          </>
        )}

        {esFinalizada && (
          <>
            <div>
              <label className="block mb-1 font-semibold">Número ganador</label>
              <input type="number" name="numero_ganador" value={form.numero_ganador || ""} onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Link al video del sorteo</label>
              <input type="url" name="video_sorteo_url" value={form.video_sorteo_url || ""} onChange={handleChange}
                className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
            </div>
          </>
        )}

        <button type="submit" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-bold w-full">
          Guardar cambios
        </button>
      </form>
    </div>
  );
};

export default EditarRifa;
