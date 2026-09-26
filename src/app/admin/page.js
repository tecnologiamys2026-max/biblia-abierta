"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

// Días fijos de la semana
const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  
  const [actividades, setActividades] = useState([]);
  const [diaEditando, setDiaEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [lugar, setLugar] = useState("");
  const [director, setDirector] = useState("");
  const [predicador, setPredicador] = useState("");
  const [hora, setHora] = useState("7");
  const [minutos, setMinutos] = useState("00");
  const [ampm, setAmpm] = useState("PM");

  // Verificar si ya está logueado al cargar
  useEffect(() => {
    const auth = localStorage.getItem("biblia_abierta_admin");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchActividades();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === "iglesia123") { // Contraseña de prueba
      localStorage.setItem("biblia_abierta_admin", "true");
      setIsAuthenticated(true);
      fetchActividades();
      toast.success("¡Sesión iniciada correctamente!");
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("biblia_abierta_admin");
    setIsAuthenticated(false);
  };

  const fetchActividades = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/actividades');
      const data = await res.json();
      if (data.success) {
        setActividades(data.data);
      }
    } catch (error) {
      console.error("Error fetching", error);
    }
    setLoading(false);
  };

  const iniciarEdicion = (dia) => {
    // Buscar si ya hay datos guardados para este día
    const act = actividades.find(a => a.dia === dia);
    
    setDiaEditando(dia);
    if (act) {
      setLugar(act.lugar);
      setDirector(act.director);
      setPredicador(act.predicador);
      
      // Separar la hora (ej: "7:30 PM")
      try {
        const [tiempo, ampmStr] = act.hora.split(' ');
        const [h, m] = tiempo.split(':');
        setHora(h);
        setMinutos(m);
        setAmpm(ampmStr);
      } catch (e) {
        // Fallback si la hora tiene formato viejo
        setHora("7"); setMinutos("00"); setAmpm("PM");
      }
    } else {
      setLugar("");
      setDirector("");
      setPredicador("");
      setHora("7");
      setMinutos("00");
      setAmpm("PM");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const horaFinal = `${hora}:${minutos} ${ampm}`;
    const dataAEnviar = { 
      dia: diaEditando, 
      lugar, 
      director, 
      predicador, 
      hora: horaFinal 
    };

    try {
      const response = await fetch('/api/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataAEnviar),
      });

      if (response.ok) {
        toast.success(`¡Actividad del ${diaEditando} guardada exitosamente!`);
        setDiaEditando(null); // Cerrar formulario
        fetchActividades(); // Recargar lista
      } else {
        toast.error("Hubo un error al guardar.");
      }
    } catch (error) {
      toast.error("Error de conexión.");
    }
  };

  // --- VISTA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <Toaster position="top-right" />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Acceso Restringido</h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña de Administrador</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Introduce la contraseña"
                />
              </div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA PRINCIPAL (LISTA O FORMULARIO) ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <Toaster position="top-right" />
      {/* Navbar Interno */}
      <nav className="bg-indigo-700 text-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold">Panel de Administración</h1>
          <button onClick={handleLogout} className="text-sm bg-indigo-800 px-3 py-1 rounded hover:bg-indigo-900">Salir</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : diaEditando ? (
          // --- FORMULARIO DE EDICIÓN ---
          <div className="bg-white py-8 px-6 shadow sm:rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Editando: {diaEditando}</h2>
              <button onClick={() => setDiaEditando(null)} className="text-gray-500 hover:text-gray-700">Volver</button>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hora</label>
                <div className="mt-1 flex space-x-2">
                  <select value={hora} onChange={(e) => setHora(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white sm:text-sm">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="flex items-center text-gray-500 font-bold">:</span>
                  <select value={minutos} onChange={(e) => setMinutos(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white sm:text-sm">
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                  <select value={ampm} onChange={(e) => setAmpm(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white sm:text-sm">
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lugar (Ej: Templo, Casa de Paz...)</label>
                <input type="text" required value={lugar} onChange={(e) => setLugar(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Director Asignado</label>
                <input type="text" required value={director} onChange={(e) => setDirector(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Predicador</label>
                <input type="text" required value={predicador} onChange={(e) => setPredicador(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 sm:text-sm" />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700">
                  Guardar
                </button>
                <button type="button" onClick={() => setDiaEditando(null)} className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md text-sm font-bold text-gray-700 bg-white hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : (
          // --- LISTA DE LOS 7 DÍAS ---
          <div>
            <p className="mb-6 text-gray-600">Selecciona un día de la semana para configurar su actividad. Si un día no tiene información, no aparecerá en la página principal.</p>
            <div className="space-y-4">
              {DIAS_SEMANA.map((dia) => {
                const act = actividades.find(a => a.dia === dia);
                return (
                  <div key={dia} className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between shadow-sm hover:shadow transition-shadow">
                    <div>
                      <h3 className="text-lg font-bold text-indigo-900">{dia}</h3>
                      {act ? (
                        <p className="text-sm text-gray-500 mt-1">
                          {act.hora} • {act.predicador} ({act.lugar})
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1 italic">Sin actividad programada</p>
                      )}
                    </div>
                    <button 
                      onClick={() => iniciarEdicion(dia)}
                      className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors"
                    >
                      {act ? 'Editar' : 'Configurar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
