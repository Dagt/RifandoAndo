// src/pages/SubirImagenes.jsx
import React, { useState } from "react";

const SubirImagenes = ({ rifaId }) => {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!archivo) return;

    const formData = new FormData();
    formData.append("imagen", archivo);

    const token = localStorage.getItem("access");

    const response = await fetch(`https://rifandoando.club/api/subir-imagen/${rifaId}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      setMensaje("✅ Imagen subida con éxito");
      setArchivo(null);
    } else {
      const data = await response.json();
      setMensaje("❌ Error: " + (data.error || "No se pudo subir la imagen"));
    }
  };

  return (
    <div className="mt-4">
      <label className="block mb-2 font-bold">Subir imagen para esta rifa:</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
      >
        Subir
      </button>
      {mensaje && <p className="text-sm mt-2">{mensaje}</p>}
    </div>
  );
};

export default SubirImagenes;
