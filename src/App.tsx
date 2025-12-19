import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, BookmarkCheck } from 'lucide-react';

// Estructura de datos para las citas
interface Appointment {
  id: number;
  name: string;
  service: string;
  time: string;
}

export default function BarberCastel() {
  const [view, setView] = useState<'client' | 'owner'>('client');
  const [isLogged, setIsLogged] = useState(false);
  const ADMIN_PASSWORD = "000001"; // Tu clave de acceso

  // Cargar citas guardadas al iniciar
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('barber_appointments');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Guardar citas automáticamente cuando cambian
  useEffect(() => {
    localStorage.setItem('barber_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleAdminAccess = () => {
    if (isLogged) {
      setView('owner');
    } else {
      const pass = prompt("Introduce la clave de acceso para Barber Castel:");
      if (pass === ADMIN_PASSWORD) {
        setIsLogged(true);
        setView('owner');
      } else {
        alert("Contraseña incorrecta.");
      }
    }
  };

  const addAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newApp: Appointment = {
      id: Date.now(),
      name: (formData.get('clientName') as string) || 'Sin nombre',
      service: (formData.get('service') as string) || 'Corte Clásico',
      time: (formData.get('time') as string) || '--:--',
    };
    setAppointments([...appointments, newApp]);
    alert(`¡Cita agendada para ${newApp.name}!`);
    e.currentTarget.reset();
  };

  const removeAppointment = (id: number) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-24 text-left">
      
      {/* HEADER CON EL NUEVO LOGOTIPO COMPLETO */}
      <header className="p-6 border-b border-amber-900/30 bg-black sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          
          {/* LOGOTIPO BC: TIJERAS, NAVAJA Y BARBER POLE */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.5)] border border-amber-300/20 overflow-visible">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Poste de Barbería central */}
              <rect x="10.5" y="3" width="3" height="18" rx="1.5" fill="white" />
              <path d="M10.5 7h3M10.5 12h3M10.5 17h3" stroke="#ef4444" strokeWidth="2" />
              <path d="M10.5 9.5h3M10.5 14.5h3M10.5 19.5h3" stroke="#3b82f6" strokeWidth="2" />
              
              {/* Tijeras Cruzadas */}
              <g stroke="black" strokeWidth="1" strokeLinecap="round">
                <circle cx="5" cy="5" r="2" fill="#262626" stroke="#fbbf24" strokeWidth="0.5" />
                <circle cx="5" cy="19" r="2" fill="#262626" stroke="#fbbf24" strokeWidth="0.5" />
                <line x1="19" y1="5" x2="8" y2="16" stroke="black" strokeWidth="2.5" />
                <line x1="19" y1="19" x2="8" y2="8" stroke="black" strokeWidth="2.5" />
                <line x1="19" y1="5" x2="8" y2="16" stroke="#fbbf24" strokeWidth="1" />
                <line x1="19" y1="19" x2="8" y2="8" stroke="#fbbf24" strokeWidth="1" />
              </g>
              
              {/* Navaja */}
              <path d="M15 4l5 4-8 8-2-2 5-10z" fill="black" />
              <path d="M15 4l5 4-8 8" stroke="#fbbf24" strokeWidth="0.5" />
            </svg>
            {/* Iniciales BC */}
            <span className="absolute -bottom-2 -right-1 bg-amber-500 text-black text-[10px] font-black px-1.5 rounded border border-black italic">BC</span>
          </div>
          
          <div className="text-left">
            <h1 className="text-xl font-black tracking-tighter text-amber-500 italic uppercase leading-none">Barber Castel</h1>
            <p className="text-[9px] text-amber-700 font-bold uppercase tracking-widest leading-none mt-1 italic text-left">Programmed by JAM</p>
          </div>
        </div>
        
        <button onClick={view === 'client' ? handleAdminAccess : () => setView('client')} className="text-[10px] font-black px-4 py-2 rounded-lg border border-amber-600/50 bg-amber-600/10 text-amber-500 hover:bg-amber-600 hover:text-black transition-all uppercase">
          {view === 'client' ? 'DUEÑO' : 'VOLVER'}
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="p-6 max-w-md mx-auto">
        {view === 'client' ? (
          /* VISTA PARA CLIENTES */
          <section className="animate-in zoom-in-95 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Reserva tu turno</h2>
              <p className="text-neutral-500 text-xs uppercase tracking-widest font-semibold italic underline decoration-amber-900">Exclusivo Caballeros</p>
            </div>
            
            <form onSubmit={addAppointment} className="space-y-4 bg-neutral-900/40 p-6 rounded-3xl border border-neutral-800 shadow-2xl backdrop-blur-md">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-700 uppercase ml-1 block">Tu Nombre</label>
                <input name="clientName" required className="w-full bg-neutral-950/50 border border-neutral-800 p-4 rounded-xl focus:border-amber-500 outline-none text-white transition-all placeholder:text-neutral-700" placeholder="Ej. Juan Pérez" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-700 uppercase ml-1 block">Servicio</label>
                <select name="service" className="w-full bg-neutral-950/50 border border-neutral-800 p-4 rounded-xl focus:border-amber-500 outline-none text-white">
                  <option>Corte Castel (Fondo)</option>
                  <option>Barba & Navaja</option>
                  <option>Combo Imperial (Todo)</option>
                  <option>Corte de Niño</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-amber-700 uppercase ml-1 block">Hora</label>
                <input name="time" type="time" required className="w-full bg-neutral-950/50 border border-neutral-800 p-4 rounded-xl focus:border-amber-500 outline-none text-white" />
              </div>

              <button className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-4 rounded-xl transition-all mt-4 flex justify-center items-center gap-2 shadow-lg shadow-amber-600/20 active:scale-95">
                <BookmarkCheck size={20} /> CONFIRMAR CITA
              </button>
            </form>
          </section>
        ) : (
          /* VISTA PARA EL DUEÑO */
          <section className="animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
              <div className="text-left">
                <h2 className="text-xl font-black text-amber-500 italic uppercase leading-none">Agenda BC</h2>
                <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">Panel Interno</p>
              </div>
              <div className="bg-amber-600/20 border border-amber-600/40 px-3 py-1 rounded-lg">
                <span className="text-amber-500 font-black">{appointments.length} Citas</span>
              </div>
            </div>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-neutral-900 rounded-3xl opacity-30">
                  <p className="text-neutral-600 font-bold uppercase text-xs tracking-widest italic text-center w-full">No hay citas para hoy</p>
                </div>
              ) : (
                appointments.map((app) => (
                  <div key={app.id} className="bg-neutral-900 border-l-4 border-amber-600 p-5 rounded-xl flex justify-between items-center group hover:border-amber-500/40 transition-all shadow-md">
                    <div className="flex gap-4 items-center">
                      <div className="bg-amber-600/10 p-3 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                        <Clock size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg text-white capitalize leading-tight underline decoration-amber-900/30">{app.name}</p>
                        <p className="text-xs text-neutral-500 uppercase mt-1">
                          {app.time} <span className="text-amber-800 mx-1">/</span> {app.service}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeAppointment(app.id)} className="p-2 text-neutral-800 hover:text-green-500 transition-colors">
                      <CheckCircle size={28} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER CON FIRMA JAM */}
      <footer className="fixed bottom-0 w-full p-5 bg-black/95 border-t border-neutral-900 text-center backdrop-blur-md z-50">
        <p className="text-[10px] text-neutral-600 tracking-[0.4em] font-black uppercase">
          BARBER CASTEL — <span className="text-amber-600 italic underline underline-offset-4 decoration-amber-900/50">PROGRAMMED BY JAM</span>
        </p>
      </footer>
    </div>
  );
}