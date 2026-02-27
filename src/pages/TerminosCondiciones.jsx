import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import SmartLink from '../components/SmartLink/SmartLink';

const TerminosCondiciones = () => {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b-2 border-black dark:border-gray-600 pb-6">
        <SmartLink
          to="/registro"
          className="flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-600 bg-white dark:bg-black text-black dark:text-white font-bold shadow-hard hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <ChevronLeft size={20} className="mr-1" /> VOLVER
        </SmartLink>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          TÉRMINOS Y CONDICIONES DE USO
        </h1>
      </div>

      {/* Contenido */}
      <div className="border-2 border-black dark:border-gray-600 bg-white dark:bg-black shadow-hard p-6 mb-8">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-right font-bold mb-8">Última actualización: 05/08/25</p>

          <h2 className="text-xl font-bold mt-6 mb-4">1. Aceptación de los Términos</h2>
          <p>
            Al crear una cuenta y utilizar la plataforma RF PROGRAMS, usted acepta quedar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, por favor no utilice el servicio.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">2. Descripción del Servicio</h2>
          <p>
            RF PROGRAMS es una plataforma digital que permite a los usuarios acceder a planes de entrenamiento personalizados o generales, asignados por entrenadores certificados. La plataforma ofrece:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acceso a planes de entrenamiento (generales y personalizados)</li>
            <li>Comunicación entre clientes y entrenadores mediante comentarios</li>
            <li>Gestión de suscripciones mensuales</li>
          </ul>

          <h2 className="text-xl font-bold mt-6 mb-4">3. Registro y Cuentas</h2>
          <p>
            Para utilizar RF PROGRAMS, debe registrarse con un correo electrónico válido y completar el proceso de verificación. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña.
          </p>
          <p className="mt-2">
            Existen tres tipos de cuentas:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cliente:</strong> Accede a planes generales o personalizados según su suscripción.</li>
            <li><strong>Coach:</strong> Puede crear, asignar y gestionar planes.</li>
            <li><strong>Admin:</strong> Tiene control completo sobre la plataforma.</li>
          </ul>

          <h2 className="text-xl font-bold mt-6 mb-4">4. Suscripciones y Pagos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>El acceso a planes personalizados requiere una suscripción mensual activa.</li>
            <li>Los pagos se procesan mediante plataformas externas (como PayPal o MercadoPago).</li>
            <li>Cada suscripción tiene una duración de 30 días a partir de la fecha de pago.</li>
            <li>Se ofrece un período de prueba de 14 días para nuevos usuarios.</li>
          </ul>
          <p className="mt-2">
            No se realizan reembolsos por tiempo no utilizado, salvo excepciones contempladas por la ley.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">5. Cancelación</h2>
          <p>
            Usted puede cancelar su suscripción en cualquier momento desde su cuenta. El acceso a los planes personalizados se mantendrá activo hasta la fecha de vencimiento del período actual.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">6. Uso Aceptable</h2>
          <p>
            Al usar RF PROGRAMS, usted se compromete a:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Usar la app de manera ética y legal</li>
            <li>No suplantar identidades ni compartir contenido ofensivo o inapropiado</li>
            <li>Respetar a los entrenadores, administradores y demás usuarios</li>
          </ul>
          <p className="mt-2">
            Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estas condiciones.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">7. Propiedad Intelectual</h2>
          <p>
            Todo el contenido de RF PROGRAMS (incluyendo textos, rutinas, diseño, imágenes, código fuente, etc.) es propiedad de RF PROGRAMS o de sus respectivos creadores y no puede ser copiado, modificado ni distribuido sin autorización expresa.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">8. Exención de Responsabilidad</h2>
          <p>
            RF PROGRAMS no se hace responsable por:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Lesiones, accidentes o complicaciones derivadas de la ejecución de ejercicios físicos incluidos en las planificaciones</li>
            <li>Uso inadecuado o sin supervisión profesional de los planes ofrecidos en la plataforma</li>
            <li>Resultados no esperados o frustraciones relacionadas con el progreso físico</li>
          </ul>
          <p className="mt-2">
            Recomendamos consultar con un profesional de la salud antes de iniciar cualquier rutina de ejercicios. Usted utiliza los planes de entrenamiento bajo su propia responsabilidad.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">9. Disponibilidad del Servicio</h2>
          <p>
            RF PROGRAMS trabaja para garantizar un funcionamiento continuo de la plataforma, pero no garantiza que el servicio esté libre de errores, caídas o interrupciones. Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, con o sin previo aviso.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">10. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos Términos y Condiciones. En caso de cambios sustanciales, se notificará a los usuarios mediante la plataforma o por correo electrónico.
          </p>

          <h2 className="text-xl font-bold mt-6 mb-4">11. Contacto</h2>
          <p>
            Para consultas relacionadas con estos términos, puede comunicarse con nosotros por nuestras redes sociales:
            <span className="font-bold"><SmartLink to="https://www.instagram.com/real.forceuy/" target="_blank"> REAL FORCE</SmartLink></span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default TerminosCondiciones;