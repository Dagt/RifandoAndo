import React from "react";

const PoliticasCondiciones = () => {
  return (
    <div className="min-h-screen bg-[url('/fondo-galaxia.jpg')] bg-cover bg-center text-white p-6 flex justify-center items-start pt-20">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-8 w-full max-w-5xl space-y-8">
        <h1 className="text-4xl font-bold text-yellow-400 text-center">Políticas y Condiciones</h1>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Requisitos para Participar</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Debes ser mayor de 18 años al momento de participar.</li>
            <li>Se requiere proporcionar nombre completo, correo, teléfono y fecha de nacimiento válidos.</li>
            <li>La participación implica la aceptación total de estas condiciones.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Proceso de Compra</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Los boletos se consideran apartados al completar el formulario y seleccionar un método de pago.</li>
            <li>El tiempo máximo para pagar es de <strong>5 minutos</strong>. Después, los boletos se liberan automáticamente.</li>
            <li>No se garantiza disponibilidad si el pago se realiza fuera del tiempo indicado.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Veracidad de la Información</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Si los datos proporcionados no son reales o presentan errores, el boleto podrá invalidarse.</li>
            <li>En caso de resultar ganador, se solicitará una identificación oficial para reclamar el premio.</li>
            <li>No se entregarán premios a terceros ni a datos falsos o incompletos.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Resultados y Premiación</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Los resultados se publicarán en la página de ganadores y se notificará por SMS y correo.</li>
            <li>Si el ganador no responde en 72 horas, se podrá realizar un nuevo sorteo o seguir las condiciones particulares de la rifa.</li>
            <li>Se publicará un video como evidencia del sorteo.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Reembolsos y Cancelaciones</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>No se realizarán reembolsos una vez confirmada la compra.</li>
            <li>Solo se realizará devolución si la rifa es cancelada por parte del organizador.</li>
            <li>El monto se reembolsará por el mismo medio en el que fue recibido.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">6. Legalidad y Cambios</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Rifando Ando se reserva el derecho de modificar estas políticas en cualquier momento.</li>
            <li>Las modificaciones entrarán en vigor una vez publicadas en este sitio.</li>
            <li>Participar en una rifa implica aceptar todos los términos vigentes.</li>
          </ul>
        </section>

        <p className="text-sm text-white/50 border-t pt-4 border-white/10 text-center">
          Última actualización: {new Date().toLocaleDateString("es-MX")}
        </p>
      </div>
    </div>
  );
};

export default PoliticasCondiciones;
