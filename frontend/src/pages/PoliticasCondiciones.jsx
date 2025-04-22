import React from "react";

const PoliticasCondiciones = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] text-white p-6 flex justify-center items-start pt-20">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-8 w-full max-w-5xl space-y-8">
        <h1 className="text-4xl font-bold text-yellow-400 text-center">Términos y Condiciones</h1>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Objeto</h2>
          <p className="text-white/90">El presente documento establece los términos y condiciones que regulan el uso de la plataforma "Rifando Ando", así como la participación en los sorteos organizados a través de la misma.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Aceptación de los Términos</h2>
          <p className="text-white/90">Al acceder y utilizar la plataforma, el usuario acepta y se obliga a cumplir con los presentes términos y condiciones.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Participación en Sorteos</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Para participar en los sorteos, el usuario deberá adquirir boletos a través de los medios autorizados por "Rifando Ando".</li>
            <li>Los pagos realizados a través de Oxxo incluirán una comisión adicional de $12.00 MXN por transacción.</li>
            <li>La participación está sujeta a la validación del pago correspondiente. Pagos no confirmados, realizados fuera del plazo, o con comprobantes alterados o falsificados, anularán el boleto.</li>
            <li>Los boletos apartados se liberarán automáticamente después de 2 horas si no han sido pagados.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Requisitos para la Entrega de Premios</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>El ganador deberá ser mayor de edad y presentar una identificación oficial vigente (INE o pasaporte) que coincida con los datos proporcionados al registrarse.</li>
            <li>Si no cumple con los requisitos o no se le localiza en un plazo de 7 días naturales, el premio será reasignado mediante un nuevo sorteo.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Condiciones del Sorteo</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>El sorteo se llevará a cabo solo si se ha vendido al menos el 50% de los boletos disponibles. De lo contrario, la fecha será reprogramada.</li>
            <li>Si el boleto ganador no fue vendido, no tiene dueño o incumple con los términos, el premio será reasignado mediante un nuevo sorteo.</li>
            <li>Se publicará un video como evidencia del sorteo.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">6. Responsabilidad</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>"Rifando Ando" no se hace responsable por errores del usuario al realizar pagos o transferencias, incluyendo montos incorrectos o pagos a cuentas no autorizadas.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">7. Reembolsos</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Los boletos adquiridos no son reembolsables.</li>
            <li>Solo se realizará devolución si la rifa es cancelada por el organizador.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">8. Modificaciones</h2>
          <p className="text-white/90">"Rifando Ando" se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones serán publicadas en la plataforma y entrarán en vigor a partir de su publicación.</p>
        </section>

        <h1 className="text-4xl font-bold text-yellow-400 text-center pt-10">Aviso de Privacidad</h1>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Identidad y Domicilio del Responsable</h2>
          <p className="text-white/90">"Rifando Ando", es responsable del tratamiento de sus datos personales.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Finalidades del Tratamiento</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Gestionar su participación en los sorteos.</li>
            <li>Validar y confirmar pagos.</li>
            <li>Contactarlo en caso de resultar ganador.</li>
            <li>Cumplir con obligaciones legales.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Datos Personales Recabados</h2>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Nombre completo.</li>
            <li>Edad.</li>
            <li>Correo electrónico.</li>
            <li>Número telefónico.</li>
            <li>Identificación oficial.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Derechos ARCO</h2>
          <p className="text-white/90">Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, deberá enviar una solicitud al correo electrónico [Insertar correo electrónico], incluyendo:</p>
          <ul className="list-disc pl-6 space-y-1 text-white/90">
            <li>Nombre completo.</li>
            <li>Domicilio.</li>
            <li>Teléfono.</li>
            <li>Correo electrónico utilizado en la plataforma.</li>
            <li>Copia de una identificación oficial.</li>
            <li>Descripción clara y precisa del derecho que desea ejercer.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Transferencias de Datos</h2>
          <p className="text-white/90">Sus datos personales no serán transferidos a terceros sin su consentimiento, salvo en los casos previstos por la ley.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">6. Uso de Cookies</h2>
          <p className="text-white/90">Nuestra plataforma utiliza cookies y otras tecnologías para mejorar su experiencia de usuario. Puede deshabilitar estas tecnologías en la configuración de su navegador.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">7. Cambios al Aviso de Privacidad</h2>
          <p className="text-white/90">Nos reservamos el derecho de realizar modificaciones al presente aviso de privacidad. Cualquier cambio será publicado en nuestra plataforma.</p>
        </section>

        <p className="text-sm text-white/50 border-t pt-4 border-white/10 text-center">
          Última actualización: {new Date().toLocaleDateString("es-MX")}
        </p>
      </div>
    </div>
  );
};

export default PoliticasCondiciones;
