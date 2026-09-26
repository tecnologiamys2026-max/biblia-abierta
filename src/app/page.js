import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function Home() {
  // Obtenemos las actividades desde la base de datos
  let actividades = [];
  try {
    actividades = await prisma.actividad.findMany({
      orderBy: { createdAt: 'asc' }
    });
  } catch (e) {
    console.error("No se pudo conectar a la base de datos aún:", e);
  }

  // Orden del día de la semana para ordenarlos lógicamente
  const ordenDias = {
    "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, 
    "Viernes": 5, "Sábado": 6, "Domingo": 7
  };

  // Ordenar actividades por día de la semana
  actividades.sort((a, b) => ordenDias[a.dia] - ordenDias[b.dia]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Navbar Simple */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-700">Biblia Abierta</h1>
            </div>
            <div>
              <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                Administración
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Cabecera / Hero Section */}
      <header className="bg-indigo-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Actividades de la Semana
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-indigo-100">
          Mantente informado sobre los horarios, directores y predicadores de nuestros servicios semanales.
        </p>
      </header>

      {/* Lista de Actividades */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {actividades.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay actividades cargadas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Pídele al administrador que cargue la programación de esta semana.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {actividades.map((act) => (
              <div 
                key={act.id} 
                className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="px-6 py-5 border-b border-gray-100 bg-indigo-50/50">
                  <h3 className="text-lg leading-6 font-bold text-indigo-900">
                    {act.dia}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {act.hora}
                  </p>
                </div>
                <div className="px-6 py-5">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lugar</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {act.lugar}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Director</dt>
                      <dd className="mt-1 text-sm text-gray-900">{act.director}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Predicador</dt>
                      <dd className="mt-1 text-sm font-medium text-indigo-700">{act.predicador}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}
