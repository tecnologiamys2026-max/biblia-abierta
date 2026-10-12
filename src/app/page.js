import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import InstallAppButton from '@/components/InstallAppButton';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let actividades = [];
  let directiva = [];
  let extras = [];
  let nombreIglesia = "Iglesia";

  try {
    const [actRes, dirRes, extRes, cfgRes] = await Promise.all([
      prisma.actividad.findMany(),
      prisma.directiva.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.actividadExtra.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.configuracion.findUnique({ where: { id: 'global' } })
    ]);
    actividades = actRes;
    directiva = dirRes;
    extras = extRes;
    if (cfgRes?.nombre) {
      nombreIglesia = cfgRes.nombre;
    }
  } catch (e) {
    console.error("Error BD:", e);
  }

  const ordenDias = { "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, "Viernes": 5, "Sábado": 6, "Domingo": 7 };
  actividades.sort((a, b) => ordenDias[a.dia] - ordenDias[b.dia]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* Navbar Superior */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <img 
              src="/logo.jpeg" 
              alt={`Logo ${nombreIglesia}`} 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-sm border border-indigo-100 flex-shrink-0" 
            />
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-base sm:text-xl font-bold font-church text-indigo-900 tracking-wide truncate leading-tight">
                {nombreIglesia}
              </h1>
              <span className="text-[10px] sm:text-xs text-indigo-500 font-medium tracking-wider uppercase hidden xs:block">
                Portal de Actividades
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <InstallAppButton />
          </div>
        </div>
      </nav>

      {/* Contenedor Principal (Sidebar + Contenido) */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row">
        
        {/* SIDEBAR (Portal Menu) */}
        <aside className="w-full lg:w-64 bg-indigo-900 text-white lg:min-h-[calc(100vh-4rem)] p-4 sm:p-6 shadow-inner">
          <div className="lg:sticky lg:top-24">
            
            {/* Cabecera / Banner para móviles con logo y nombre estilizado */}
            <div className="flex lg:hidden items-center gap-3.5 p-3.5 mb-4 bg-indigo-950/70 rounded-xl border border-indigo-800/60 shadow-sm">
              <img
                src="/logo.jpeg"
                alt={`Logo ${nombreIglesia}`}
                className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-indigo-300/40 p-0.5 bg-white flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold font-church text-white tracking-wide truncate">{nombreIglesia}</p>
                <p className="text-[11px] text-indigo-300">Comunidad de Fe y Adoración</p>
              </div>
            </div>

            <h2 className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-3">Secciones</h2>
            <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              <a href="#semana" className="flex-shrink-0 bg-indigo-800 hover:bg-indigo-700 px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">Programación Semanal</a>
              <a href="#directiva" className="flex-shrink-0 hover:bg-indigo-800 px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">Directiva</a>
              <a href="#extras" className="flex-shrink-0 hover:bg-indigo-800 px-4 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">Actividades Extras</a>
            </nav>

            {/* Logo destacado en el menú lateral (Versión Escritorio) */}
            <div className="hidden lg:flex flex-col items-center justify-center mt-10 p-5 bg-indigo-950/60 rounded-2xl border border-indigo-700/40 text-center shadow-inner">
              <div className="relative group">
                <img
                  src="/logo.jpeg"
                  alt={`Emblema ${nombreIglesia}`}
                  className="w-28 h-28 rounded-full object-cover shadow-xl border-2 border-indigo-300/60 p-0.5 bg-white transition-transform duration-300 hover:scale-105"
                />
              </div>
              <p className="mt-3.5 text-sm font-bold font-church uppercase tracking-wider text-indigo-200">{nombreIglesia}</p>
            </div>
          </div>
        </aside>

        {/* CONTENIDO CENTRAL */}
        <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
          
          {/* SECCIÓN: SEMANA */}
          <section id="semana" className="mb-20 scroll-mt-24">
            <header className="mb-8 border-b pb-4">
              <h2 className="text-3xl font-extrabold text-gray-900">Actividades de la Semana</h2>
              <p className="mt-2 text-gray-600">Horarios y servicios regulares del templo.</p>
            </header>
            
            {actividades.length === 0 ? (
              <p className="text-gray-500 italic">No hay actividades cargadas.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {actividades.map((act) => (
                  <div key={act.id} className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition">
                    <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50/30">
                      <h3 className="text-lg font-bold text-indigo-900">{act.dia}</h3>
                      <p className="text-sm font-semibold text-gray-600">{act.hora}</p>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      <div><p className="text-xs text-gray-400 uppercase">Lugar</p><p className="text-sm text-gray-800">{act.lugar}</p></div>
                      <div><p className="text-xs text-gray-400 uppercase">Director</p><p className="text-sm text-gray-800">{act.director}</p></div>
                      <div><p className="text-xs text-gray-400 uppercase">Predicador</p><p className="text-sm font-bold text-indigo-700">{act.predicador}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECCIÓN: DIRECTIVA */}
          <section id="directiva" className="mb-20 scroll-mt-24">
            <header className="mb-8 border-b pb-4">
              <h2 className="text-3xl font-extrabold text-gray-900">Directiva de la Iglesia</h2>
              <p className="mt-2 text-gray-600">Líderes y pastores al servicio.</p>
            </header>
            
            {directiva.length === 0 ? (
              <p className="text-gray-500 italic">Información no disponible.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {directiva.map(miembro => (
                  <div key={miembro.id} className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                      {miembro.nombre.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{miembro.nombre}</h4>
                      <p className="text-indigo-600 font-medium text-sm">{miembro.cargo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECCIÓN: EXTRAS */}
          <section id="extras" className="scroll-mt-24">
            <header className="mb-8 border-b pb-4">
              <h2 className="text-3xl font-extrabold text-gray-900">Eventos y Actividades Extras</h2>
              <p className="mt-2 text-gray-600">Congresos, ayunos, células y más.</p>
            </header>

            {extras.length === 0 ? (
              <p className="text-gray-500 italic">No hay eventos extraordinarios próximos.</p>
            ) : (
              <div className="space-y-4">
                {extras.map(extra => (
                  <div key={extra.id} className="bg-white p-6 rounded-xl border shadow-sm hover:border-indigo-200 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{extra.titulo}</h3>
                      <span className="inline-block mt-2 sm:mt-0 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                        {extra.fecha}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mt-3">{extra.descripcion}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
