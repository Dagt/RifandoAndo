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
          <h2 className="text-2xl font-semibold text-white">3. Requisitos para Participar</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>El usuario debe ser mayor de edad (18 años o más) para participar en cualquier sorteo.</li>
            <li>Debe proporcionar información verídica y completa al registrarse y participar.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">4. Participación en Sorteos</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>Los boletos deben ser adquiridos exclusivamente a través de los medios autorizados por la plataforma.</li>
            <li>Cada transacción conlleva una comisión adicional de $4.00 MXN para cubrir los gastos de procesamiento de pago.</li>
            <li>Boletos no pagados en un plazo de 24 horas desde su apartado serán automáticamente liberados.</li>
            <li>Boletos alterados, falsificados o con información errónea serán anulados sin derecho a reembolso.</li>
            <li>No se realizarán reembolsos por pagos fuera de plazo, errores en el monto o pagos hechos a cuentas distintas.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">5. Mecanismo de Selección de Ganadores</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>El ganador será definido mediante los resultados oficiales de la Lotería Nacional Mexicana, tomando como referencia los últimos dígitos del número ganador.</li>
            <li>Los detalles específicos de cada sorteo serán publicados junto con el número base para transparencia.</li>
            <li>Se documentará y publicará el resultado del sorteo como evidencia.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">6. Entrega de Premios</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>El ganador deberá presentar una identificación oficial vigente para reclamar el premio.</li>
            <li>Si el ganador no cumple los requisitos o no responde en un plazo de 7 días naturales, el premio será reasignado mediante nuevo sorteo.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">7. Condiciones del Sorteo</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>Los sorteos solo se realizarán si se ha alcanzado un mínimo del 60% de boletos vendidos.</li>
            <li>Si el boleto ganador no fue vendido o resulta inválido, se sorteará nuevamente.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">8. Uso de Códigos Promocionales y Referidos</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>Los códigos promocionales son de uso personal, único e intransferible, salvo indicación expresa.</li>
            <li>El uso fraudulento o malicioso de códigos, links de referidos u otros mecanismos promocionales podrá anular boletos del usuario.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">9. Uso Inadecuado de la Plataforma</h2>
          <p className="text-white/90">
            Cualquier uso indebido del sistema, intento de manipulación, hackeo o vulneración de las reglas será motivo de suspensión permanente y, en su caso, acciones legales.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">10. Reembolsos</h2>
          <ul className="list-disc pl-6 text-white/90 space-y-1">
            <li>No se realizarán reembolsos, salvo en el caso de que la rifa sea cancelada por el organizador.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">11. Modificaciones</h2>
          <p className="text-white/90">
            "Rifando Ando" se reserva el derecho de modificar estos términos, condiciones o mecánicas en cualquier momento, sin previo aviso. Las modificaciones serán publicadas en esta misma sección.
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
            Para ejercer sus derechos de acceso, rectificación, cancelación u oposición, envíe un correo a <a href="mailto:contacto@rifandoando.club" className="text-yellow-300 underline">contacto@rifandoando.club</a> con los siguientes datos:
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
