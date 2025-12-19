import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, BookmarkCheck } from 'lucide-react';

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
    const newApp: Appointment = {
      id: Date.now(),
      name: (formData.get('clientName') as string) || 'Cliente',
      service: (formData.get('service') as string) || 'Corte',
      time: (formData.get('time') as string) || '00:00',
    };
    setAppointments([...appointments, newApp]);
    alert(`Cita agendada para ${newApp.name}`);
    e.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-24 text-left">
      <header className="p-6 border-b border-amber-900/30 bg-black sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          {/* LOGOTIPO BC: TIJERAS, NAVAJA Y POSTE */}
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
            <p className="text-[9px] text-amber-700 font-bold uppercase tracking-widest leading-none mt-1 italic">Programmed by JAM</p>
          </div>
        </div>
        <button onClick={view === 'client' ? handleAdminAccess : () => setView('client')} className="text-[10px] font-black px-4 py-2 rounded-lg border border-amber-600/50 bg-amber-600/10 text-amber-500 uppercase">
          {view === 'client' ? 'DUEÑO' : 'VOLVER'}
        </button>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {view === 'client' ? (
          <section className="animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-bold mb-6">Reserva tu turno</h2>
            <form onSubmit={addAppointment} className="space-y-4 bg-neutral-900/40 p-6 rounded-3xl border border-neutral-800 backdrop-blur-md">
              <input name="clientName" required className="w-full bg-neutral-950/50 border border-neutral-800 p-4 rounded-xl focus:border-amber-500 outline-none" placeholder="Tu Nombre" />
              <select name="service" className="w-full bg-neutral-950/50 border border-neutral-800 p-4 rounded-xl outline-none">
                <option>Corte Castel</option>
                <option>Barba & Navaja</option>
                <option>Combo Imperial</option>
              </select>
              <input name="time" type="time" required className="w-full bg-neutral-950/50 border border-neutral-800 p-4 rounded-xl" />
              <button className="w-full bg-amber-600 text-black font-black py-4 rounded-xl flex justify-center items-center gap-2">
                <BookmarkCheck size={20} /> CONFIRMAR
              </button>
            </form>
          </section>
        ) : (
          <section className="animate-in slide-in-from-bottom duration-500">
            <h2 className="text-xl font-black text-amber-500 mb-6 uppercase">Agenda BC</h2>
            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className="bg-neutral-900 border-l-4 border-amber-600 p-5 rounded-xl flex justify-between items-center">
                  <div className="text-left">
                    <p className="font-bold text-white uppercase">{app.name}</p>
                    <p className="text-xs text-neutral-500">{app.time} - {app.service}</p>
                  </div>
                  <button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="text-neutral-700 hover:text-green-500">
                    <CheckCircle size={28} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 w-full p-5 bg-black/95 border-t border-neutral-900 text-center">
        <p className="text-[10px] text-neutral-600 tracking-[0.4em] font-black uppercase">
          BARBER CASTEL — <span className="text-amber-600 italic underline underline-offset-4">PROGRAMMED BY JAM</span>
        </p>
      </footer>
    </div>
  );
}