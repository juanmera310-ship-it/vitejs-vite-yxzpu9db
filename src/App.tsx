import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, BookmarkCheck, CalendarDays } from 'lucide-react';

interface Appointment {
  id: number;
  name: string;
  service: string;
  time: string;
}

export default function BarberCastel() {
  const [view, setView] = useState<'client' | 'owner'>('client');
  const [isLogged, setIsLogged] = useState(false);
  const ADMIN_PASSWORD = "000001";

  // Generar lista de horarios (de 09:00 a 19:00 cada 1 hora o 30 min)
  const availableHours = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('barber_appointments');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('barber_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleAdminAccess = () => {
    if (isLogged) {
      setView('owner');
    } else {
      const pass = prompt("Introduce la clave de acceso:");
      if (pass === ADMIN_PASSWORD) {
        setIsLogged(true);
        setView('owner');
      } else {
        alert("Incorrecto");
      }
    }
  };

  const addAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedTime = formData.get('time') as string;

    if (!selectedTime) {
      alert("Por favor, selecciona un horario disponible.");
      return;
    }

    const newApp: Appointment = {
      id: Date.now(),
      name: (formData.get('clientName') as string) || 'Cliente',
      service: (formData.get('service') as string) || 'Corte Castel',
      time: selectedTime,
    };

    setAppointments([...appointments, newApp]);
    alert(`¡Confirmado! Te esperamos a las ${selectedTime}, ${newApp.name}.`);
    e.currentTarget.reset();
  };

  // Filtrar las horas que NO están ocupadas
  const freeHours = availableHours.filter(hour => 
    !appointments.some(app => app.time === hour)
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-24 text-left">
      <header className="p-6 border-b border-amber-900/30 bg-black sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.5)] border border-amber-300/20">
            <svg width="45" height="45" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10.5" y="3" width="3" height="18" rx="1.5" fill="white" stroke="black" strokeWidth="0.2" />
              <path d="M10.5 6h3M10.5 10h3M10.5 14h3M10.5 18h3" stroke="#ef4444" strokeWidth="1.5" />
              <path d="M10.5 8h3M10.5 12h3M10.5 16h3M10.5 20h3" stroke="#3b82f6" strokeWidth="1.5" />
              <g stroke="black" strokeWidth="1.2" strokeLinecap="round">
                <circle cx="5" cy="5" r="2.2" fill="#171717" stroke="#fbbf24" strokeWidth="0.5" />
                <circle cx="5" cy="19" r="2.2" fill="#171717" stroke="#fbbf24" strokeWidth="0.5" />
                <line x1="19" y1="5" x2="8" y2="16" stroke="black" strokeWidth="2.5" />
                <line x1="19" y1="19" x2="8" y2="8" stroke="black" strokeWidth="2.5" />
                <line x1="19" y1="5" x2="8" y2="16" stroke="#fbbf24" strokeWidth="1" />
                <line x1="19" y1="19" x2="8" y2="8" stroke="#fbbf24" strokeWidth="1" />
              </g>
              <path d="M14 4l6 4-9 9-2-2 5-11z" fill="black" stroke="#fbbf24" strokeWidth="0.3" />
            </svg>
            <span className="absolute -bottom-2 -right-1 bg-amber-500 text-black text-[10px] font-black px-1.5 rounded border border-black italic">BC</span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black tracking-tighter text-amber-500 italic uppercase leading-none">Barber Castel</h1>
            <p className="text-[9px] text-amber-700 font-bold uppercase tracking-widest mt-1 italic leading-none">Programmed by JAM</p>
          </div>
        </div>
        <button onClick={view === 'client' ? handleAdminAccess : () => setView('client')} className="text-[10px] font-black px-4 py-2 rounded-lg border border-amber-600/50 bg-amber-600/10 text-amber-500 uppercase">
          {view === 'client' ? 'DUEÑO' : 'VOLVER'}
        </button>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {view === 'client' ? (
          <section className="animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-bold mb-2">Reserva tu turno</h2>
            <p className="text-neutral-500 text-xs mb-8 italic">Elige una de nuestras horas disponibles.</p>
            
            <form onSubmit={addAppointment} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] text-amber-600 font-black ml-1 uppercase">Nombre Completo</label>
                <input name="clientName" required className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl focus:border-amber-500 outline-none" placeholder="Ej. Juan Pérez" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-amber-600 font-black ml-1 uppercase">Servicio Deseado</label>
                <select name="service" className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl outline-none appearance-none">
                  <option>Corte Castel (Fondo)</option>
                  <option>Barba & Navaja</option>
                  <option>Combo Imperial</option>
                  <option>Limpieza Facial</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-amber-600 font-black ml-1 uppercase">Horas Disponibles Hoy</label>
                <div className="grid grid-cols-3 gap-2">
                  {freeHours.length > 0 ? (
                    freeHours.map(hour => (
                      <label key={hour} className="relative cursor-pointer group">
                        <input type="radio" name="time" value={hour} className="peer sr-only" required />
                        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-center text-sm font-bold peer-checked:bg-amber-600 peer-checked:text-black peer-checked:border-amber-600 transition-all">
                          {hour}
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="col-span-3 text-center text-red-500 text-xs font-bold py-4">¡Agenda llena por hoy!</p>
                  )}
                </div>
              </div>

              <button className="w-full bg-amber-600 text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 mt-4 hover:shadow-[0_0_20px_rgba(217,119,6,0.3)] active:scale-95 transition-all">
                <BookmarkCheck size={20} /> CONFIRMAR CITA
              </button>
            </form>
          </section>
        ) : (
          <section className="animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-end mb-8">
               <h2 className="text-xl font-black text-amber-500 uppercase">Agenda de Hoy</h2>
               <span className="text-[10px] font-bold bg-amber-600/10 text-amber-600 border border-amber-600/20 px-2 py-1 rounded">{appointments.length} Citas</span>
            </div>
            
            <div className="space-y-4">
              {appointments.sort((a,b) => a.time.localeCompare(b.time)).map((app) => (
                <div key={app.id} className="bg-neutral-900 border-l-4 border-amber-600 p-5 rounded-xl flex justify-between items-center shadow-lg">
                  <div className="text-left">
                    <p className="font-bold text-white uppercase text-sm leading-tight underline decoration-amber-900/30">{app.name}</p>
                    <p className="text-[11px] text-neutral-500 mt-1 uppercase tracking-tighter">
                      <span className="text-amber-500 font-bold">{app.time}</span> — {app.service}
                    </p>
                  </div>
                  <button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="p-2 text-neutral-800 hover:text-green-500 transition-colors">
                    <CheckCircle size={28} />
                  </button>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center py-20 opacity-20">
                   <CalendarDays size={48} className="mx-auto mb-2" />
                   <p className="italic text-sm font-bold">Sin citas registradas</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 w-full p-5 bg-black/95 border-t border-neutral-900 text-center backdrop-blur-md">
        <p className="text-[10px] text-neutral-600 tracking-[0.4em] font-black uppercase">
          BARBER CASTEL — <span className="text-amber-600 italic underline underline-offset-4 decoration-amber-900/50">PROGRAMMED BY JAM</span>
        </p>
      </footer>
    </div>
  );
}