import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SeleccionBoletos = () => {
  const { id } = useParams();
  const [boletosDisponibles, setBoletosDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [cantidadSuerte, setCantidadSuerte] = useState(10);
  const [totalBoletos, setTotalBoletos] = useState(1000);
  const [mostrarCampoPromo, setMostrarCampoPromo] = useState(false);
  const [codigoPromo, setCodigoPromo] = useState("");
  const navigate = useNavigate();
  const [infoCodigo, setInfoCodigo] = useState(null);
  const [modalMensaje, setModalMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigoValido, setCodigoValido] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/rifas/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.estado !== "activa") {
          alert("⚠️ Esta rifa no está activa en este momento.");
          navigate("/");
          return;
        }

        localStorage.setItem("precio_boleto", data.precio_boleto);
        localStorage.setItem("nombre_rifa", data.nombre);
        setTotalBoletos(data.total_boletos);
        localStorage.setItem("total_boletos", data.total_boletos);
        return fetch(`/api/rifas/${id}/boletos-disponibles/`);
      })
      .then((res) => res?.json?.())
      .then((data) => {
  if (data?.disponibles) {
    setBoletosDisponibles(data.disponibles);
    localStorage.setItem("boletos_disponibles", JSON.stringify(data.disponibles));
  }
})

      .catch((err) => {
        console.error("Error al cargar datos:", err);
        alert("Error al cargar datos de la rifa.");
      });
  }, [id]);

  useEffect(() => {
  if (codigoPromo.trim().length >= 4) {
    const delay = setTimeout(() => {
      fetch("/api/validar-codigo/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: codigoPromo.trim(),
          telefono: "",
          rifa_id: id,
          monto: seleccionados.length * parseFloat(localStorage.getItem("precio_boleto") || "0"),
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.valido && res.detalle) {
            const detalle = res.detalle;
            setCodigoValido(true);
            setInfoCodigo({
              ...detalle,
              cumple_minimo: res.cumple_minimo,
            });

            let mensaje = "";
            if (detalle.tipo === "porcentaje") {
              const porcentaje = detalle.descuento || detalle.valor || 0;
              const minimo = detalle.compra_minima !== null ? `$${detalle.compra_minima}` : "$0";
              mensaje = `🎉 Este código otorga un ${porcentaje}% de descuento en tu compra. Mínimo de compra: ${minimo}`;
            } else if (detalle.tipo === "boletos_extra" && detalle.x && detalle.y) {
              mensaje = `🎁 Te regala ${detalle.y} boleto(s) por cada ${detalle.x} que compres.`;
            }

            setModalMensaje(mensaje);
            localStorage.setItem("codigo_promocional", detalle.codigo);
          } else {
            setCodigoValido(false);
            setInfoCodigo(null);
            setModalMensaje(res.razon || "❌ Código inválido.");
            localStorage.removeItem("codigo_promocional");
          }

          setMostrarModal(true);
        })
        .catch((err) => {
          console.error("Error al validar código:", err);
          setModalMensaje("❌ No se pudo validar el código.");
          setCodigoValido(false);
          setMostrarModal(true);
        });
    }, 800);

    return () => clearTimeout(delay);
  } else {
    setCodigoValido(false);
    setInfoCodigo(null);
    setMostrarModal(false);
  }
}, [codigoPromo, seleccionados]);



  const padLength = String(totalBoletos - 1).length;

  const toggleBoleto = (numero) => {
    setSeleccionados((prev) =>
      prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero]
    );
  };

  const borrarSeleccion = () => setSeleccionados([]);

  const pruebaSuerte = () => {
    const cantidad = parseInt(cantidadSuerte, 10);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("⚠️ Ingresa una cantidad válida mayor a 0.");
      return;
    }

    if (cantidad > boletosDisponibles.length) {
      alert(`⚠️ Solo hay ${boletosDisponibles.length} boletos disponibles.`);
      return;
    }

    const nuevos = [];
    const disponibles = [...boletosDisponibles];
    while (nuevos.length < cantidad && disponibles.length > 0) {
      const index = Math.floor(Math.random() * disponibles.length);
      nuevos.push(disponibles[index]);
      disponibles.splice(index, 1);
    }
    setSeleccionados(nuevos);
  };

  const continuar = () => {
  if (seleccionados.length === 0) {
    alert("⚠️ Debes seleccionar al menos un boleto.");
    return;
  }

  let finalBoletos = [...seleccionados];

  if (infoCodigo?.tipo === "boletos_extra" && infoCodigo.x && infoCodigo.y && infoCodigo.cumple_minimo) {
    const grupos = Math.floor(seleccionados.length / infoCodigo.x);
    const boletosExtra = grupos * infoCodigo.y;
    const disponibles = boletosDisponibles.filter((b) => !finalBoletos.includes(b));

    while (finalBoletos.length < seleccionados.length + boletosExtra && disponibles.length > 0) {
      const random = disponibles.splice(Math.floor(Math.random() * disponibles.length), 1)[0];
      finalBoletos.push(random);
    }
  }

  localStorage.setItem("boletos", JSON.stringify(finalBoletos));

  if (codigoValido && codigoPromo.trim()) {
  localStorage.setItem("codigo_promocional", codigoPromo.trim());
} else {
  localStorage.removeItem("codigo_promocional");
}

  navigate(`/rifa/${id}/confirmar`);
};


  return (
    <div className="min-h-screen p-6 text-white">
      <h1 className="text-2xl font-extrabold text-center text-orange-400 mb-4">
        Selecciona tus boletos entre los números disponibles
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Ventana de boletos */}
        <div className="w-full lg:flex-[3] h-[70vh] lg:h-[80vh] overflow-y-auto bg-white bg-opacity-10 backdrop-blur-md p-4 rounded-xl shadow-md">
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(36px,_1fr))] gap-[9px] justify-center items-center">
            {boletosDisponibles.map((n) => (
              <button
                key={n}
                onClick={() => toggleBoleto(n)}
                className={`rounded-full w-10 h-10 flex items-center justify-center font-bold border transition-all duration-200 text-sm ${
                  seleccionados.includes(n)
                    ? "bg-gradient-to-br from-orange-500 to-yellow-300 text-white border-orange-400"
                    : "bg-transparent text-white border-white hover:bg-white hover:text-indigo-800"
                }`}
              >
                {n.toString().padStart(padLength, "0")}
              </button>
            ))}
          </div>
        </div>

        {/* Ventana de selección + botones */}
        <div className="w-full flex flex-col gap-4 lg:h-[80vh] lg:flex-1">
          <h2 className="text-lg font-extrabold text-center text-white-400">
            Tus boletos seleccionados:
          </h2>

          <div className="bg-white bg-opacity-10 backdrop-blur-md p-4 rounded-xl shadow-md min-h-[200px] max-h-[400px] overflow-y-auto">

            <div className="flex flex-wrap gap-[4px] justify-center">
              {seleccionados.map((n) => (
                <div
                  key={n}
                  className="bg-gradient-to-br from-orange-500 to-yellow-300 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm"
                >
                  {n.toString().padStart(padLength, "0")}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={borrarSeleccion}
              className="flex-1 bg-pink-600 text-white font-semibold py-2 rounded-xl hover:bg-pink-700 transition"
            >
              Borrar
            </button>

            <div className="flex flex-col lg:flex-row gap-2 items-center">
              <input
                type="number"
                min="1"
                max={boletosDisponibles.length}
                value={cantidadSuerte}
                onChange={(e) => setCantidadSuerte(e.target.value)}
                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full lg:w-auto px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none text-base text-center"
                placeholder="Cantidad"
              />

              <button
                onClick={pruebaSuerte}
                className="w-full lg:w-auto bg-yellow-400 text-indigo-900 font-semibold py-2 px-4 rounded-xl hover:bg-yellow-500 transition text-sm"
              >
                🍀 Prueba tu suerte
              </button>
            </div>
          </div>

          {/* Código promocional */}
          <div className="text-center text-sm font-bold text-white/80 cursor-pointer hover:text-yellow-300 transition" onClick={() => setMostrarCampoPromo(!mostrarCampoPromo)}>
            {mostrarCampoPromo ? "Ocultar código promocional" : "¿Tienes un código promocional?"}
          </div>

          {mostrarCampoPromo && (
            <input
              type="text"
              value={codigoPromo}
              onChange={(e) => setCodigoPromo(e.target.value)}
              placeholder="Ingresa tu código aquí"
              className="w-full px-4 py-2 rounded-xl bg-white/20 text-white border backdrop-blur-md border-white/30 focus:outline-none text-sm"
            />
          )}
          {mostrarModal && (
  <div className="bg-white/10 text-white p-4 rounded-xl border border-yellow-400 shadow-xl text-center text-base backdrop-blur-md">
    <p className="font-bold text-yellow-300 mb-2">Código promocional</p>
    {codigoValido ? (
      <>
        <p>{modalMensaje}</p>
        {!infoCodigo?.cumple_minimo && (
          <p className="mt-1 text-red-300">
            ⚠️ Aún no cumples el mínimo requerido para que el código sea válido.
          </p>
        )}
      </>
    ) : (
      <p className="text-red-300">{modalMensaje}</p>
    )}
  </div>
)}



          <button
            onClick={continuar}
            className="bg-green-500 text-white font-bold py-2 rounded-xl hover:bg-green-600 transition w-full"
          >
            💰 Comprar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionBoletos;
