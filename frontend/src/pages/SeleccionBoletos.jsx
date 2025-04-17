import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SeleccionBoletos = () => {
  const { id } = useParams();
  const [boletosDisponibles, setBoletosDisponibles] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [cantidadSuerte, setCantidadSuerte] = useState(10);
  const [totalBoletos, setTotalBoletos] = useState(1000);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch(`/api/rifas/${id}/boletos-disponibles/`)
      .then((res) => res.json())
      .then((data) => setBoletosDisponibles(data.disponibles));

    fetch(`/api/rifas/${id}/`)
      .then((res) => res.json())
      .then((data) => setTotalBoletos(data.total_boletos));
  }, [id]);

  useEffect(() => {
  fetch(`/api/rifas/${id}/`)
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("precio_boleto", data.precio_boleto);
      localStorage.setItem("nombre_rifa", data.nombre);
    });
  }, [id]);


  const padLength = String(totalBoletos - 1).length;

  const toggleBoleto = (numero) => {
    if (seleccionados.includes(numero)) {
      setSeleccionados(seleccionados.filter((n) => n !== numero));
    } else {
      setSeleccionados([...seleccionados, numero]);
    }
  };

  const borrarSeleccion = () => setSeleccionados([]);

  const pruebaSuerte = () => {
    let cantidad = parseInt(cantidadSuerte, 10);

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
    localStorage.setItem("boletos", JSON.stringify(seleccionados));
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
        <div className="w-full lg:flex-1 flex flex-col gap-4 h-[70vh] lg:h-[80vh]">
          <h2 className="text-lg font-extrabold text-center text-white-400">
            Tus boletos seleccionados:
          </h2>
          <div className="bg-white bg-opacity-10 backdrop-blur-md p-4 rounded-xl shadow-md flex flex-col justify-start overflow-y-auto h-full">
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
                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full lg:w-auto px-3 py-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none text-sm text-center"
                placeholder="Cantidad"
              />

              <button
                onClick={pruebaSuerte}
                className="w-full lg:w-auto bg-yellow-400 text-indigo-900 font-semibold py-2 px-4 rounded-xl hover:bg-yellow-500 transition text-sm"
              >
                🍀 Me siento con suerte
              </button>
            </div>
          </div>

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
