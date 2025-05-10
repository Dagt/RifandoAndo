import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const ConfirmarCompraCaja = () => {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    nacimiento: "",
    acepta: false,
  });

  const [errores, setErrores] = useState({});
  const [precioCaja, setPrecioCaja] = useState(null);
  const [cantidad, setCantidad] = useState(() => parseInt(localStorage.getItem("cantidad_cajas")) || 1);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    fetch("/api/caja-actual/")
      .then(res => res.json())
      .then(data => setPrecioCaja(data.precio))
      .catch(() => setPrecioCaja(null));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const calcularEdad = (fecha) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const validar = () => {
    const nuevosErrores = {};
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexTelefono = /^[0-9]{10}$/;
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = "Requerido";
    } else if (!regexNombre.test(formulario.nombre.trim())) {
      nuevosErrores.nombre = "Solo letras y espacios";
    }

    if (!regexCorreo.test(formulario.correo)) nuevosErrores.correo = "Correo inválido";
    if (!regexTelefono.test(formulario.telefono)) nuevosErrores.telefono = "Teléfono inválido";

    if (!formulario.nacimiento) {
      nuevosErrores.nacimiento = "Requerido";
    } else if (calcularEdad(formulario.nacimiento) < 18) {
      nuevosErrores.nacimiento = "Debes ser mayor de edad";
    }

    if (!formulario.acepta) nuevosErrores.acepta = "Debes aceptar los términos";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      const anon_id = localStorage.getItem("anon_id") || crypto.randomUUID();
      localStorage.setItem("anon_id", anon_id);

      const payload = {
        ...formulario,
        metodo_pago: "tarjeta",
        cantidad,
        anon_id,
      };

      const res = await fetch("/api/caja/confirmar-compra/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.instrucciones?.checkout_url) {
        alert("❌ Error: " + (data.error || "No se pudo procesar la compra"));
        return;
      }

      // Redirige a la pasarela de pago con tarjeta
      window.location.href = data.instrucciones.checkout_url;
    } catch (error) {
      alert("❌ Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen p-6 text-white flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-xl shadow-lg border border-white/20">
        <h2 className="text-2xl font-extrabold text-center text-yellow-300 mb-6">
          Confirma tu información para comprar
        </h2>

        {precioCaja !== null && (
          <p className="text-center text-white/80 mb-4">
            Estás por comprar <strong>{cantidad}</strong> caja(s) sorpresa por un total de{" "}
            <strong>${(precioCaja * cantidad).toFixed(2)}</strong>.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Nombre completo</label>
            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
            />
            {errores.nombre && <p className="text-red-300 text-sm">{errores.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
            />
            {errores.correo && <p className="text-red-300 text-sm">{errores.correo}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formulario.telefono}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
            />
            {errores.telefono && <p className="text-red-300 text-sm">{errores.telefono}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Fecha de nacimiento</label>
            <input
              type="date"
              name="nacimiento"
              value={formulario.nacimiento}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
            />
            {errores.nacimiento && <p className="text-red-300 text-sm">{errores.nacimiento}</p>}
          </div>

          <div className="flex flex-col items-center justify-center text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="acepta"
                checked={formulario.acepta}
                onChange={handleChange}
                className="form-checkbox h-4 w-4 text-yellow-400"
              />
              <span className="flex items-center gap-1 text-white">
                <ShieldCheck className="w-4 h-4 text-yellow-300" />
                Acepto los{" "}
                <a
                  href="/terminos"
                  className="underline text-yellow-300 hover:text-yellow-400"
                  target="_blank"
                  rel="noreferrer"
                >
                  términos y condiciones
                </a>
              </span>
            </label>
            {errores.acepta && <p className="text-red-300 mt-1">{errores.acepta}</p>}
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 hover:to-yellow-400 text-black font-bold py-2 rounded transition mt-2 shadow-lg"
          >
            {cargando ? "Procesando..." : "Comprar con tarjeta"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmarCompraCaja;
