// src/pages/PoliticasCondiciones.jsx
import React from "react";
import { ShieldCheck, Info } from "lucide-react";

const PoliticasCondiciones = () => {
  return (
    <div className="min-h-screen p-6 text-white flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-5xl shadow-lg space-y-10">
        <h1 className="text-4xl font-bold text-yellow-400 text-center">
          Términos y Condiciones
        </h1>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">1. Objeto</h2>
          <p className="text-white/90">
            El presente documento establece los términos y condiciones que regulan el uso de la plataforma "Rifando Ando", así como la participación en los sorteos organizados a través de la misma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">2. Aceptación de los Términos</h2>
          <p className="text-white/90">
            Al acceder y utilizar la plataforma, el usuario acepta y se obliga a cumplir con los presentes términos y condiciones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">3. Participación en Sorteos</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>Para participar en los sorteos, el usuario deberá adquirir boletos a través de los medios autorizados por "Rifando Ando".</li>
            <li>Los pagos realizados a través de Oxxo incluirán una comisión adicional de $12.00 MXN por transacción.</li>
            <li>Pagos no confirmados, fuera de plazo o con comprobantes alterados anularán el boleto.</li>
            <li>Los boletos apartados se liberarán automáticamente después de 2 horas si no han sido pagados.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">4. Requisitos para la Entrega de Premios</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>El ganador deberá ser mayor de edad y presentar una identificación oficial vigente.</li>
            <li>Si no cumple con los requisitos o no se le localiza en 7 días, el premio será reasignado mediante nuevo sorteo.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">5. Condiciones del Sorteo</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>El sorteo se realizará solo si se ha vendido al menos el 50% de los boletos.</li>
            <li>Si el boleto ganador no fue vendido o incumple con los términos, se sorteará de nuevo.</li>
            <li>Se publicará un video como evidencia del sorteo.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">6. Responsabilidad</h2>
          <p className="text-white/90">
            "Rifando Ando" no se hace responsable por errores del usuario al realizar pagos o transferencias, incluyendo pagos incorrectos o a cuentas no autorizadas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">7. Reembolsos</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>Los boletos adquiridos no son reembolsables.</li>
            <li>Solo se realizará devolución si la rifa es cancelada por el organizador.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">8. Modificaciones</h2>
          <p className="text-white/90">
            "Rifando Ando" se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones se publicarán en la plataforma y serán efectivas de inmediato.
          </p>
        </section>

        <h1 className="text-4xl font-bold text-yellow-400 text-center pt-10">
          Aviso de Privacidad
        </h1>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">1. Responsable</h2>
          <p className="text-white/90">
            "Rifando Ando", es responsable del tratamiento de sus datos personales.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">2. Finalidades del Tratamiento</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>Gestionar su participación en los sorteos.</li>
            <li>Validar pagos y contactar en caso de resultar ganador.</li>
            <li>Cumplir con obligaciones legales.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">3. Datos Personales Recabados</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>Nombre completo, edad, correo, teléfono e identificación oficial.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">4. Derechos ARCO</h2>
          <p className="text-white/90">
            Para ejercer sus derechos de acceso, rectificación, cancelación u oposición, envíe un correo a{" "}
            <a href="mailto:contacto@rifandoando.club" className="text-yellow-300 underline">contacto@rifandoando.club</a> con los siguientes datos:
          </p>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>Nombre completo, domicilio, teléfono y correo.</li>
            <li>Copia de identificación oficial.</li>
            <li>Descripción clara del derecho que desea ejercer.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">5. Transferencias de Datos</h2>
          <p className="text-white/90">
            Sus datos no serán transferidos sin su consentimiento, salvo disposición legal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">6. Uso de Cookies</h2>
          <p className="text-white/90">
            Utilizamos cookies para mejorar su experiencia. Puede desactivarlas desde su navegador.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">7. Cambios al Aviso</h2>
          <p className="text-white/90">
            Nos reservamos el derecho a modificar este aviso de privacidad. Cualquier cambio será publicado en la plataforma.
          </p>
        </section>

        <p className="text-sm text-white/60 text-center border-t border-white/20 pt-4 flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-yellow-300" />
          Última actualización: {new Date().toLocaleDateString("es-MX")}
        </p>
      </div>
    </div>
  );
};

export default PoliticasCondiciones;
