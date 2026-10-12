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
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative">
          
          {/* Espacio a la izquierda para balancear el botón de la derecha */}
          <div className="w-24 sm:w-36 hidden sm:block"></div>

          {/* Nombre Centrado */}
          <div className="flex-1 text-center min-w-0 px-2 sm:px-4">
            <h1 className="text-lg sm:text-2xl font-bold font-church text-indigo-900 tracking-wider truncate">
              {nombreIglesia}
            </h1>
          </div>

          {/* Botón Descargar App a la derecha */}
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
                  <div 
                    key={act.id} 
                    className="bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Cabecera del Día */}
                    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white px-5 py-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 block">Culto Congregacional</span>
                        <h3 className="text-xl font-bold font-church tracking-wide">{act.dia}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 text-white font-semibold text-xs shadow-inner">
                        <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{act.hora}</span>
                      </div>
                    </div>

                    {/* Detalles con Iconos Coloridos */}
                    <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-gray-50/40">
                      
                      {/* Lugar */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/70 border border-rose-100 hover:bg-rose-50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Lugar del Culto</p>
                          <p className="text-sm font-semibold text-gray-800 break-words leading-snug mt-0.5">{act.lugar}</p>
                        </div>
                      </div>

                      {/* Director */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-100 hover:bg-amber-50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Director de Culto</p>
                          <p className="text-sm font-semibold text-gray-800 break-words leading-snug mt-0.5">{act.director}</p>
                        </div>
                      </div>

                      {/* Predicador */}
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 hover:bg-indigo-50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Predicador de la Palabra</p>
                          <p className="text-sm font-bold text-indigo-950 break-words leading-snug mt-0.5">{act.predicador}</p>
                        </div>
                      </div>

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
