import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const ConfirmarCompra = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boletosExtra, setBoletosExtra] = useState([]);
  const [infoCodigo, setInfoCodigo] = useState(null);
  const codigoReferidoGuardado = localStorage.getItem("codigo_referido");

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    nacimiento: "",
    acepta: false,
  });

  const [boletos, setBoletos] = useState([]);
  const [monto, setMonto] = useState(0);
  const [errores, setErrores] = useState({});

  const comisionExtra = 4;
  const montoFinal = monto + comisionExtra;

  useEffect(() => {
    window.scrollTo(0, 0);
    const seleccionados = JSON.parse(localStorage.getItem("boletos")) || [];
    if (seleccionados.length === 0) {
      navigate("/");
      return;
    }
    setBoletos(seleccionados);
    const precioGuardado = parseFloat(localStorage.getItem("precio_boleto")) || 0;
    const baseMonto = precioGuardado * seleccionados.length;
    setMonto(baseMonto);

    const codigoGuardado = localStorage.getItem("codigo_promocional") || "";

    if (codigoGuardado) {
      fetch("/api/validar-codigo/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: codigoGuardado,
          rifa_id: id,
          monto: baseMonto,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res?.valido && res.detalle && res.cumple_minimo) {
            const detalle = res.detalle;
            let nuevoMonto = baseMonto;

            if (detalle.tipo === "porcentaje" && detalle.descuento) {
              nuevoMonto = baseMonto * (1 - detalle.descuento / 100);
              setMonto(nuevoMonto);
            }

            if (detalle.tipo === "boletos_extra" && detalle.x && detalle.y) {
              const totalExtras = Math.floor(seleccionados.length / (detalle.x + detalle.y)) * detalle.y;
              const extrasDetectados = seleccionados.slice().filter((n, i) => i >= seleccionados.length - totalExtras);
              const boletosPagados = seleccionados.filter((n) => !extrasDetectados.includes(n));
              setBoletos(seleccionados);
              setBoletosExtra(extrasDetectados);
              const precioGuardado = parseFloat(localStorage.getItem("precio_boleto")) || 0;
              const baseMonto = precioGuardado * boletosPagados.length;
              setMonto(baseMonto);
            }
            setInfoCodigo({ ...detalle, cumple_minimo: res.cumple_minimo, codigo: codigoGuardado });
          } else {
            setMonto(baseMonto);
            setBoletosExtra([]);
            setInfoCodigo(null);
          }
        })
        .catch((err) => {
          console.error("Error validando código:", err);
          setMonto(baseMonto);
          setInfoCodigo(null);
        });
    } else {
      setMonto(baseMonto);
    }
  }, [navigate]);

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
      nuevosErrores.nombre = "Solo letras y espacios (sin números ni símbolos)";
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

  const codigoGuardado = localStorage.getItem("codigo_promocional");
  const codigoFinal = codigoGuardado && infoCodigo?.cumple_minimo ? codigoGuardado : null;

  const payload = {
    nombre: formulario.nombre,
    correo: formulario.correo,
    telefono: formulario.telefono,
    nacimiento: formulario.nacimiento,
    metodo_pago: "manual",  // o "deposito" si así lo manejas en backend
    rifa_id: id,
    boletos: boletos,
    monto: montoFinal,
    codigo_promocional: codigoFinal,
    codigo_referido: codigoReferidoGuardado || null,
  };

  try {
    const response = await fetch("/api/confirmar-compra/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success && data.transaccion?.folio) {
      const folio = data.transaccion.folio;
      const nombre = formulario.nombre.trim();

      const boletosFormateados = boletos
        .map((n) => n.toString().padStart(padLength, "0"))
        .join(", ");

      let mensaje = `👋 *Hola!*
      Mi nombre es *${nombre}*
      Mi folio es *${folio}*
      🎟 Voy a comprar los boletos: *${boletosFormateados}*
      💰 Por un total de: *$${montoFinal.toFixed(2)} MXN*

      Puedo pagar en las siguientes cuentas:
      🏦 *BBVA*
      • Cuenta: 155 048 1292
      • CLABE: 012580015504812925
      • Tarjeta: 4152 3140 5999 6119

      Después de hacer el pago, enviare el comprobante por este medio y validaré mi compra aquí:
      🔗 https://www.rifandoando.club/verificador?folio=${folio}`;

      if (codigoFinal) {
        mensaje += `

        🎁 Código promocional usado: *${codigoFinal}*`;
      }

      const numeroWhatsApp = "4498860396";
      const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

      localStorage.clear();
      window.open(url, "_blank");
      setTimeout(() => {
        navigate("/"); // o navigate(`/validar/${folio}`);
        }, 2000);
    } else {
      alert("❌ Error: " + (data.error || "No se pudo procesar la compra."));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error al conectar con el servidor.");
  }
};


  const totalBoletos = parseInt(localStorage.getItem("total_boletos") || "100", 10);
  const padLength = totalBoletos ? String(totalBoletos - 1).length : 2;

  return (
    <div className="min-h-screen p-6 text-white flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-xl shadow-lg">
        <h2 className="text-2xl font-extrabold text-center text-orange-400 mb-6">
          Confirma tu información para finalizar
        </h2>

        <div className="bg-white/10 text-white text-center p-3 rounded mb-4 space-y-1">
          <p className="text-sm">
            Estás por comprar <strong>{boletos.length - boletosExtra.length}</strong> boletos por un subtotal de <strong>${montoFinal}</strong>.
          </p>

          {infoCodigo?.tipo === "porcentaje" && infoCodigo?.cumple_minimo && (
            <div className="text-sm text-green-300 mt-1">
              🎉 Se aplicó un <strong>{infoCodigo.descuento || infoCodigo.valor}%</strong> de descuento con el código <strong>{infoCodigo.codigo}</strong>.
            </div>
          )}

          {boletosExtra.length > 0 && (
            <div className="text-sm text-green-300 mt-1">
              🎁 Tu código promocional te regaló <strong>{boletosExtra.length}</strong> boleto(s) adicional(es):
              {boletosExtra.map((n) => (
                <span key={n} className="inline-block bg-white/20 text-white ml-1 px-2 py-0.5 rounded-full text-xs">
                  {n.toString().padStart(padLength, "0")}
                </span>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Nombre completo</label>
            <input type="text" name="nombre" value={formulario.nombre} onChange={handleChange} className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none" />
            {errores.nombre && <p className="text-red-300 text-sm">{errores.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Correo electrónico</label>
            <input type="email" name="correo" value={formulario.correo} onChange={handleChange} className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none" />
            {errores.correo && <p className="text-red-300 text-sm">{errores.correo}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Teléfono</label>
            <input type="tel" name="telefono" value={formulario.telefono} onChange={handleChange} className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none" />
            {errores.telefono && <p className="text-red-300 text-sm">{errores.telefono}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Fecha de nacimiento</label>
            <input type="date" name="nacimiento" value={formulario.nacimiento} onChange={handleChange} className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none" />
            {errores.nacimiento && <p className="text-red-300 text-sm">{errores.nacimiento}</p>}
          </div>

          <div className="flex flex-col items-center justify-center text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="acepta" checked={formulario.acepta} onChange={handleChange} className="form-checkbox h-4 w-4 text-orange-400" />
              <span className="flex items-center gap-1 text-white">
                <ShieldCheck className="w-4 h-4 text-orange-300" />
                Acepto los <a href="/terminos" className="underline text-yellow-300 hover:text-yellow-400" target="_blank" rel="noreferrer">términos y condiciones</a>
              </span>
            </label>
            {errores.acepta && <p className="text-red-300 mt-1">{errores.acepta}</p>}

            <div className="mt-2 w-full text-center text-xs text-yellow-300">
              ⚠️ Comisión adicional de $4.00 por uso de la plataforma de pago
            </div>
          </div>

          <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition mt-2">
            Finalizar compra
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmarCompra;
