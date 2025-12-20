import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, BookmarkCheck, CalendarDays } from 'lucide-react';
// Importamos Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// --- TUS CREDENCIALES REALES DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCHiVFoSC1XTVdkNLG8-PXBIzupSEv1xVI",
  authDomain: "barber-castel.firebaseapp.com",
  projectId: "barber-castel",
  storageBucket: "barber-castel.firebasestorage.app",
  messagingSenderId: "803253641824",
  appId: "1:803253641824:web:901d7a4907b59245ced905",
  measurementId: "G-N8NX7YB5J7"
};

// Inicializamos Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Appointment {
  id: string;
  name: string;
  service: string;
  time: string;
}

export default function BarberCastel() {
  const [view, setView] = useState<'client' | 'owner'>('client');
  const [isLogged, setIsLogged] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const ADMIN_PASSWORD = "000001";

  // Configuración de Horarios (Ecuador Time)
  const availableHours = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // LEER CITAS EN TIEMPO REAL DESDE LA NUBE
  useEffect(() => {
    const q = query(collection(db, "citas"), orderBy("time", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(data);
    });
    return () => unsubscribe();
  }, []);

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

  const addAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedTime = formData.get('time') as string;

    if (!selectedTime) {
      alert("Por favor, selecciona un horario disponible.");
      return;
    }

    try {
      await addDoc(collection(db, "citas"), {
        name: (formData.get('clientName') as string) || 'Sin nombre',
        service: (formData.get('service') as string) || 'Corte Castel',
        time: selectedTime,
        createdAt: new Date()
      });
      alert(`¡Cita confirmada a las ${selectedTime}!`);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al conectar con la nube.");
    }
  };

  const removeAppointment = async (id: string) => {
    try {
      await deleteDoc(doc(db, "citas", id));
    } catch (error) {
      alert("No se pudo eliminar la cita.");
    }
  };

  // Filtrar horas libres comparando con la nube
  const freeHours = availableHours.filter(hour => 
    !appointments.some(app => app.time === hour)
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-24 text-left">
      <header className="p-6 border-b border-amber-900/30 bg-black sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.5)] border border-amber-300/20">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10.5" y="3" width="3" height="18" rx="1.5" fill="white" />
              <path d="M10.5 7h3M10.5 12h3M10.5 17h3" stroke="#ef4444" strokeWidth="2" />
              <path d="M10.5 9.5h3M10.5 14.5h3M10.5 19.5h3" stroke="#3b82f6" strokeWidth="2" />
              <g stroke="black" strokeWidth="1" strokeLinecap="round">
                <circle cx="5" cy="5" r="2" fill="#262626" stroke="#fbbf24" strokeWidth="0.5" />
                <circle cx="5" cy="19" r="2" fill="#262626" stroke="#fbbf24" strokeWidth="0.5" />
                <line x1="19" y1="5" x2="8" y2="16" stroke="black" strokeWidth="2.5" />
                <line x1="19" y1="19" x2="8" y2="8" stroke="black" strokeWidth="2.5" />
                <line x1="19" y1="5" x2="8" y2="16" stroke="#fbbf24" strokeWidth="1" />
                <line x1="19" y1="19" x2="8" y2="8" stroke="#fbbf24" strokeWidth="1" />
              </g>
              <path d="M15 4l5 4-8 8-2-2 5-10z" fill="black" stroke="#fbbf24" strokeWidth="0.5" />
            </svg>
            <span className="absolute -bottom-2 -right-1 bg-amber-500 text-black text-[10px] font-black px-1.5 rounded border border-black italic">BC</span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black tracking-tighter text-amber-500 italic uppercase leading-none">Barber Castel</h1>
            <p className="text-[9px] text-amber-700 font-bold uppercase tracking-widest leading-none mt-1 italic">Cloud - JAM</p>
          </div>
        </div>
        <button onClick={view === 'client' ? handleAdminAccess : () => setView('client')} className="text-[10px] font-black px-4 py-2 rounded-lg border border-amber-600/50 bg-amber-600/10 text-amber-500 uppercase">
          {view === 'client' ? 'DUEÑO' : 'VOLVER'}
        </button>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {view === 'client' ? (
          <section className="animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-bold mb-8">Reserva tu turno</h2>
            <form onSubmit={addAppointment} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] text-amber-600 font-black ml-1 uppercase">Tu Nombre</label>
                <input name="clientName" required className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl outline-none focus:border-amber-500" placeholder="Ej. Juan Pérez" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-amber-600 font-black ml-1 uppercase">Servicio</label>
                <select name="service" className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl outline-none">
                  <option>Corte Castel (Fondo)</option>
                  <option>Barba & Navaja</option>
                  <option>Combo Imperial</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] text-amber-600 font-black ml-1 uppercase">Horas Disponibles</label>
                <div className="grid grid-cols-3 gap-2">
                  {freeHours.map(hour => (
                    <label key={hour} className="cursor-pointer">
                      <input type="radio" name="time" value={hour} className="peer sr-only" required />
                      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-center text-sm font-bold peer-checked:bg-amber-600 peer-checked:text-black transition-all">
                        {hour}
                      </div>
                    </label>
                  ))}
                  {freeHours.length === 0 && <p className="col-span-3 text-red-500 text-xs text-center py-4">Agenda llena hoy.</p>}
                </div>
              </div>
              <button className="w-full bg-amber-600 text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 mt-4 active:scale-95 transition-all">
                <BookmarkCheck size={20} /> CONFIRMAR EN NUBE
              </button>
            </form>
          </section>
        ) : (
          <section className="animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-amber-500 uppercase italic">Monitor Real-Time</h2>
              <span className="bg-amber-600 text-black text-[10px] px-2 py-1 rounded font-bold">{appointments.length} CITAS</span>
            </div>
            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className="bg-neutral-900 border-l-4 border-amber-600 p-5 rounded-xl flex justify-between items-center shadow-lg">
                  <div className="text-left">
                    <p className="font-bold text-white uppercase text-sm leading-tight underline decoration-amber-900/30">{app.name}</p>
                    <p className="text-[11px] text-neutral-500 mt-1 uppercase tracking-tighter">
                      <span className="text-amber-500 font-bold">{app.time}</span> — {app.service}
                    </p>
                  </div>
                  <button onClick={() => removeAppointment(app.id)} className="text-neutral-700 hover:text-green-500">
                    <CheckCircle size={28} />
                  </button>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-center py-20 opacity-20">
                  <CalendarDays size={48} className="mx-auto mb-2" />
                  <p className="italic text-sm font-bold">Esperando citas...</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 w-full p-5 bg-black/95 border-t border-neutral-900 text-center">
        <p className="text-[10px] text-neutral-600 tracking-[0.4em] font-black uppercase">
          BARBER CASTEL — <span className="text-amber-600 italic underline underline-offset-4 decoration-amber-900/50">PROGRAMMED BY JAM</span>
        </p>
      </footer>
    </div>
  );
}