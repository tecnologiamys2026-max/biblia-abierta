"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState("semana"); // semana, directiva, extras, ajustes
  const [loading, setLoading] = useState(true);

  // Datos
  const [actividades, setActividades] = useState([]);
  const [directiva, setDirectiva] = useState([]);
  const [extras, setExtras] = useState([]);
  const [nombreIglesia, setNombreIglesia] = useState("Iglesia");
  const [descIglesia, setDescIglesia] = useState("");

  // Estados de Formularios
  const [diaEditando, setDiaEditando] = useState(null);
  const [lugar, setLugar] = useState("");
  const [director, setDirector] = useState("");
  const [predicador, setPredicador] = useState("");
  const [hora, setHora] = useState("7");
  const [minutos, setMinutos] = useState("00");
  const [ampm, setAmpm] = useState("PM");

  const [dirEditando, setDirEditando] = useState(null);
  const [dirNombre, setDirNombre] = useState("");
  const [dirCargo, setDirCargo] = useState("");

  const [extraEditando, setExtraEditando] = useState(null);
  const [extraTitulo, setExtraTitulo] = useState("");
  const [extraDesc, setExtraDesc] = useState("");
  const [extraFecha, setExtraFecha] = useState("");

  useEffect(() => {
    if (localStorage.getItem("biblia_abierta_admin") === "true") {
      setIsAuthenticated(true);
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === "iglesia123") {
      localStorage.setItem("biblia_abierta_admin", "true");
      setIsAuthenticated(true);
      fetchAllData();
      toast.success("¡Sesión iniciada!");
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("biblia_abierta_admin");
    setIsAuthenticated(false);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resAct, resDir, resExt, resCfg] = await Promise.all([
        fetch('/api/actividades'),
        fetch('/api/directiva'),
        fetch('/api/extras'),
        fetch('/api/configuracion')
      ]);
      const [dataAct, dataDir, dataExt, dataCfg] = await Promise.all([
        resAct.json(),
        resDir.json(),
        resExt.json(),
        resCfg.json()
      ]);
      
      if (dataAct.success) setActividades(dataAct.data);
      if (dataDir.success) setDirectiva(dataDir.data);
      if (dataExt.success) setExtras(dataExt.data);
      if (dataCfg.success && dataCfg.data) {
        setNombreIglesia(dataCfg.data.nombre || "Iglesia");
        setDescIglesia(dataCfg.data.descripcion || "");
      }
    } catch (error) {
      toast.error("Error cargando datos");
    }
    setLoading(false);
  };

  const guardarConfiguracion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreIglesia, descripcion: descIglesia })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Nombre de la iglesia actualizado con éxito");
      } else {
        toast.error("Error al guardar configuración");
      }
    } catch (e) {
      toast.error("Error al conectar con el servidor");
    }
  };

  // --- MÉTODOS SEMANA ---
  const iniciarEdicionSemana = (dia) => {
    const act = actividades.find(a => a.dia === dia);
    setDiaEditando(dia);
    if (act) {
      setLugar(act.lugar); setDirector(act.director); setPredicador(act.predicador);
      try {
        const [tiempo, ampmStr] = act.hora.split(' ');
        const [h, m] = tiempo.split(':');
        setHora(h); setMinutos(m); setAmpm(ampmStr);
      } catch (e) { setHora("7"); setMinutos("00"); setAmpm("PM"); }
    } else {
      setLugar(""); setDirector(""); setPredicador("");
      setHora("7"); setMinutos("00"); setAmpm("PM");
    }
  };

  const handleGuardarSemana = async (e) => {
    e.preventDefault();
    const data = { dia: diaEditando, lugar, director, predicador, hora: `${hora}:${minutos} ${ampm}` };
    try {
      const res = await fetch('/api/actividades', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) { toast.success("Actividad guardada"); setDiaEditando(null); fetchAllData(); }
      else toast.error("Error al guardar");
    } catch (e) { toast.error("Error de conexión"); }
  };

  const handleEliminarSemana = async (dia) => {
    if (!confirm(`¿Estás seguro de que deseas dejar el día ${dia} sin actividad?`)) return;
    try {
      const res = await fetch(`/api/actividades?dia=${encodeURIComponent(dia)}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`El día ${dia} ha quedado sin actividad`);
        if (diaEditando === dia) setDiaEditando(null);
        fetchAllData();
      } else {
        toast.error("Error al quitar la actividad");
      }
    } catch (e) {
      toast.error("Error de conexión");
    }
  };

  // --- MÉTODOS DIRECTIVA ---
  const guardarDirectiva = async (e) => {
    e.preventDefault();
    const data = dirEditando ? { id: dirEditando, nombre: dirNombre, cargo: dirCargo } : { nombre: dirNombre, cargo: dirCargo };
    try {
      const res = await fetch('/api/directiva', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) { toast.success("Guardado"); setDirEditando(null); setDirNombre(""); setDirCargo(""); fetchAllData(); }
      else toast.error("Error");
    } catch (e) { toast.error("Error"); }
  };
  const borrarDirectiva = async (id) => {
    if(!confirm("¿Seguro que deseas borrarlo?")) return;
    try {
      await fetch(`/api/directiva?id=${id}`, { method: 'DELETE' });
      toast.success("Borrado"); fetchAllData();
    } catch (e) { toast.error("Error"); }
  };

  // --- MÉTODOS EXTRAS ---
  const guardarExtra = async (e) => {
    e.preventDefault();
    const data = extraEditando 
      ? { id: extraEditando, titulo: extraTitulo, descripcion: extraDesc, fecha: extraFecha } 
      : { titulo: extraTitulo, descripcion: extraDesc, fecha: extraFecha };
    try {
      const res = await fetch('/api/extras', { method: 'POST', body: JSON.stringify(data) });
      if (res.ok) { toast.success("Guardado"); setExtraEditando(null); setExtraTitulo(""); setExtraDesc(""); setExtraFecha(""); fetchAllData(); }
      else toast.error("Error");
    } catch (e) { toast.error("Error"); }
  };
  const borrarExtra = async (id) => {
    if(!confirm("¿Seguro que deseas borrarlo?")) return;
    try {
      await fetch(`/api/extras?id=${id}`, { method: 'DELETE' });
      toast.success("Borrado"); fetchAllData();
    } catch (e) { toast.error("Error"); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <Toaster position="top-right" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Acceso Restringido</h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow sm:rounded-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white" placeholder="Contraseña" />
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md font-bold">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <Toaster position="top-right" />
      <nav className="bg-indigo-700 text-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold">Panel de Administración</h1>
          <button onClick={handleLogout} className="text-sm bg-indigo-800 px-3 py-1 rounded hover:bg-indigo-900">Salir</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Administrador */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-sm p-2 flex flex-col gap-1">
            <button onClick={() => setActiveTab('semana')} className={`text-left px-4 py-3 rounded-md font-medium ${activeTab === 'semana' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Programa Semanal</button>
            <button onClick={() => setActiveTab('directiva')} className={`text-left px-4 py-3 rounded-md font-medium ${activeTab === 'directiva' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Directiva</button>
            <button onClick={() => setActiveTab('extras')} className={`text-left px-4 py-3 rounded-md font-medium ${activeTab === 'extras' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>Actividades Extras</button>
            <button onClick={() => setActiveTab('ajustes')} className={`text-left px-4 py-3 rounded-md font-medium ${activeTab === 'ajustes' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>⚙️ Ajustes del Portal</button>
          </div>
        </div>

        {/* Contenido */}
        <div className="md:w-3/4 text-gray-900">
          {loading ? <p className="text-gray-600">Cargando...</p> : (
            <>
              {/* PESTAÑA AJUSTES */}
              {activeTab === 'ajustes' && (
                <div className="bg-white p-6 shadow-sm rounded-lg border space-y-4">
                  <header className="border-b pb-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">Ajustes Generales del Portal</h2>
                    <p className="text-sm text-gray-500">Configura el nombre visible de la iglesia en la página web y en la app.</p>
                  </header>
                  <form onSubmit={guardarConfiguracion} className="space-y-4 max-w-lg">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la Iglesia</label>
                      <input
                        type="text"
                        value={nombreIglesia}
                        onChange={(e) => setNombreIglesia(e.target.value)}
                        placeholder="Ej: Iglesia Central, Iglesia Bíblica..."
                        required
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción / Subtítulo</label>
                      <input
                        type="text"
                        value={descIglesia}
                        onChange={(e) => setDescIglesia(e.target.value)}
                        placeholder="Ej: Portal oficial de actividades y servicios"
                        className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                </div>
              )}
              {/* PESTAÑA SEMANA */}
              {activeTab === 'semana' && (
                diaEditando ? (
                  <div className="bg-white p-6 shadow-sm rounded-lg border">
                    <div className="border-b pb-3 mb-5 flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Programación: {diaEditando}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {actividades.some(a => a.dia === diaEditando) 
                            ? "Modifica los datos del servicio o déjalo sin actividad." 
                            : "Asigna una nueva actividad para este día."}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-100 text-indigo-800">
                        {diaEditando}
                      </span>
                    </div>

                    <form className="space-y-4" onSubmit={handleGuardarSemana}>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Horario del Servicio</label>
                        <div className="flex gap-2">
                          <select value={hora} onChange={e=>setHora(e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white font-medium">
                            {["1","2","3","4","5","6","7","8","9","10","11","12"].map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                          <select value={minutos} onChange={e=>setMinutos(e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white font-medium">
                            <option value="00">00 min</option>
                            <option value="15">15 min</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                          </select>
                          <select value={ampm} onChange={e=>setAmpm(e.target.value)} className="border border-gray-300 p-2 rounded text-gray-900 bg-white font-bold">
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Lugar</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Templo Central o Dirección" 
                          required 
                          value={lugar} 
                          onChange={e=>setLugar(e.target.value)} 
                          className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Director del Culto</label>
                        <input 
                          type="text" 
                          placeholder="Nombre del director" 
                          required 
                          value={director} 
                          onChange={e=>setDirector(e.target.value)} 
                          className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Predicador</label>
                        <input 
                          type="text" 
                          placeholder="Nombre del predicador o expositor" 
                          required 
                          value={predicador} 
                          onChange={e=>setPredicador(e.target.value)} 
                          className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-900" 
                        />
                      </div>

                      <div className="pt-3 border-t flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex gap-2">
                          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition">
                            Guardar Actividad
                          </button>
                          <button type="button" onClick={()=>setDiaEditando(null)} className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg text-gray-700 transition">
                            Cancelar
                          </button>
                        </div>

                        {actividades.some(a => a.dia === diaEditando) && (
                          <button 
                            type="button" 
                            onClick={()=>handleEliminarSemana(diaEditando)} 
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1.5"
                          >
                            <span>🗑️</span> Dejar este día sin actividad
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-900 flex justify-between items-center">
                      <span>Puedes editar cualquier día o dejarlo libre si no habrá culto.</span>
                    </div>

                    {DIAS_SEMANA.map(dia => {
                      const act = actividades.find(a => a.dia === dia);
                      return (
                        <div key={dia} className={`bg-white border rounded-xl p-4 shadow-sm transition ${act ? 'border-indigo-100' : 'border-gray-200 bg-gray-50/50'}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-gray-900">{dia}</h3>
                                {act ? (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    Con actividad
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                                    Sin actividad
                                  </span>
                                )}
                              </div>

                              {act ? (
                                <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                                  <span>⏰ <strong>{act.hora}</strong></span>
                                  <span>📍 {act.lugar}</span>
                                  <span>👤 Dir: {act.director}</span>
                                  <span className="text-indigo-800 font-semibold">📖 Predica: {act.predicador}</span>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400 italic">No hay actividades programadas para este día.</p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                              <button 
                                onClick={()=>iniciarEdicionSemana(dia)} 
                                className={`font-bold text-sm px-3.5 py-1.5 rounded-lg transition ${act ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                              >
                                {act ? 'Editar' : '+ Programar'}
                              </button>

                              {act && (
                                <button 
                                  onClick={()=>handleEliminarSemana(dia)} 
                                  title="Quitar actividad y dejar este día libre"
                                  className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200 px-2.5 py-1.5 rounded-lg font-medium transition"
                                >
                                  Dejar libre
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* PESTAÑA DIRECTIVA */}
              {activeTab === 'directiva' && (
                <div className="space-y-6">
                  <form onSubmit={guardarDirectiva} className="bg-white p-6 shadow-sm rounded border space-y-4">
                    <h3 className="font-bold text-lg text-gray-900">{dirEditando ? 'Editar Miembro' : 'Agregar Miembro'}</h3>
                    <input type="text" placeholder="Nombre completo" required value={dirNombre} onChange={e=>setDirNombre(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white" />
                    <input type="text" placeholder="Cargo (Ej: Pastor Principal)" required value={dirCargo} onChange={e=>setDirCargo(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white" />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">Guardar</button>
                      {dirEditando && <button type="button" onClick={()=>{setDirEditando(null); setDirNombre(""); setDirCargo("");}} className="border px-4 py-2 rounded text-gray-700">Cancelar</button>}
                    </div>
                  </form>
                  
                  <div className="grid gap-3">
                    {directiva.map(miembro => (
                      <div key={miembro.id} className="bg-white border p-4 rounded flex justify-between items-center shadow-sm">
                        <div>
                          <p className="font-bold text-gray-900">{miembro.nombre}</p>
                          <p className="text-sm text-gray-500">{miembro.cargo}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={()=>{setDirEditando(miembro.id); setDirNombre(miembro.nombre); setDirCargo(miembro.cargo);}} className="text-sm font-bold text-indigo-600">Editar</button>
                          <button onClick={()=>borrarDirectiva(miembro.id)} className="text-sm font-bold text-red-600">Borrar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PESTAÑA EXTRAS */}
              {activeTab === 'extras' && (
                <div className="space-y-6">
                  <form onSubmit={guardarExtra} className="bg-white p-6 shadow-sm rounded border space-y-4">
                    <h3 className="font-bold text-lg text-gray-900">{extraEditando ? 'Editar Actividad' : 'Agregar Actividad'}</h3>
                    <input type="text" placeholder="Título (Ej: Ayuno General)" required value={extraTitulo} onChange={e=>setExtraTitulo(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white" />
                    <input type="text" placeholder="Fecha y Hora (Ej: Sábado 15, 8:00 AM)" required value={extraFecha} onChange={e=>setExtraFecha(e.target.value)} className="w-full border p-2 rounded text-gray-900 bg-white" />
                    <textarea placeholder="Descripción o lugar..." required value={extraDesc} onChange={e=>setExtraDesc(e.target.value)} className="w-full border p-2 rounded h-24 text-gray-900 bg-white" />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">Guardar</button>
                      {extraEditando && <button type="button" onClick={()=>{setExtraEditando(null); setExtraTitulo(""); setExtraDesc(""); setExtraFecha("");}} className="border px-4 py-2 rounded text-gray-700">Cancelar</button>}
                    </div>
                  </form>

                  <div className="grid gap-3">
                    {extras.map(ex => (
                      <div key={ex.id} className="bg-white border p-4 rounded shadow-sm">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-indigo-900">{ex.titulo}</h4>
                          <div className="flex gap-2">
                            <button onClick={()=>{setExtraEditando(ex.id); setExtraTitulo(ex.titulo); setExtraDesc(ex.descripcion); setExtraFecha(ex.fecha);}} className="text-xs font-bold text-indigo-600">Editar</button>
                            <button onClick={()=>borrarExtra(ex.id)} className="text-xs font-bold text-red-600">Borrar</button>
                          </div>
                        </div>
                        <p className="text-sm font-medium mt-1 text-gray-800">{ex.fecha}</p>
                        <p className="text-sm text-gray-600 mt-2">{ex.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
