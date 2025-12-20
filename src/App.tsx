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

  // Horarios de atención
  const availableHours = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // LEER CITAS EN TIEMPO REAL DESDE FIREBASE
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
      const pass = prompt("Acceso Administrativo Barber Castel:");
      if (pass === ADMIN_PASSWORD) {
        setIsLogged(true);
        setView('owner');
      } else {
        alert("Clave incorrecta.");
      }
    }
  };

  const addAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedTime = formData.get('time') as string;
    const clientName = formData.get('clientName') as string;
    const service = formData.get('service') as string;

    if (!selectedTime) {
      alert("Por favor, selecciona un horario.");
      return;
    }

    try {
      // 1. GUARDAR EN FIREBASE
      await addDoc(collection(db, "citas"), {
        name: clientName || 'Cliente',
        service: service || 'Corte Castel',
        time: selectedTime,
        createdAt: new Date()
      });

      // 2. INTEGRACIÓN CON WHATSAPP
      const telefonoBarbero = "593991604987"; 
      const mensaje = `*BARBER CASTEL*%0A¡Hola! Acabo de agendar una cita: %0A%0A👤 *Nombre:* ${clientName}%0A💈 *Servicio:* ${service}%0A⏰ *Hora:* ${selectedTime}%0A%0A_Confirmado desde la App_`;
      
      const whatsappUrl = `https://wa.me/${telefonoBarbero}?text=${mensaje}`;

      alert(`¡Cita confirmada! Redirigiendo a WhatsApp...`);
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');

      e.currentTarget.reset();
    } catch (error) {
      alert("Error de conexión con la nube.");
    }
  };

  const removeAppointment = async (id: string) => {
    await deleteDoc(doc(db, "citas", id));
  };

  const freeHours = availableHours.filter(hour => 
    !appointments.some(app => app.time === hour)
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-24 text-left">
      <header className="p-6 border-b border-amber-900/30 bg-black sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(217,119,6,0.5)] border border-amber-300/20">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/></svg>
            <span className="absolute -bottom-2 -right-1 bg-amber-500 text-black text-[10px] font-black px-1.5 rounded border border-black italic">BC</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-amber-500 italic uppercase leading-none">Barber Castel</h1>
            <p className="text-[9px] text-amber-700 font-bold uppercase mt-1 italic tracking-widest">Cloud - JAM</p>
          </div>
        </div>
        <button onClick={view === 'client' ? handleAdminAccess : () => setView('client')} className="text-[10px] font-black px-4 py-2 rounded-lg border border-amber-600/50 bg-amber-600/10 text-amber-500 uppercase">
          {view === 'client' ? 'DUEÑO' : 'VOLVER'}
        </button>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {view === 'client' ? (
          <section className="animate-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-bold mb-8 italic">Agenda tu Cita</h2>
            <form onSubmit={addAppointment} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] text-amber-600 font-black uppercase ml-1">Tu Nombre</label>
                <input name="clientName" required className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl focus:border-amber-500 outline-none" placeholder="Escribe tu nombre" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-amber-600 font-black uppercase ml-1">Servicio</label>
                <select name="service" className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl outline-none">
                  <option>Corte Castel</option>
                  <option>Barba & Navaja</option>
                  <option>Limpieza Facial</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] text-amber-600 font-black uppercase ml-1">Horas Disponibles</label>
                <div className="grid grid-cols-3 gap-2">
                  {freeHours.map(hour => (
                    <label key={hour} className="cursor-pointer">
                      <input type="radio" name="time" value={hour} className="peer sr-only" required />
                      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-center text-sm font-bold peer-checked:bg-amber-600 peer-checked:text-black transition-all">
                        {hour}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <button className="w-full bg-amber-600 text-black font-black py-4 rounded-2xl flex justify-center items-center gap-2 mt-4 active:scale-95 transition-all">
                <BookmarkCheck size={20} /> AGENDAR Y ENVIAR WHATSAPP
              </button>
            </form>
          </section>
        ) : (
          <section className="animate-in slide-in-from-bottom duration-500">
            <h2 className="text-xl font-black text-amber-500 mb-6 uppercase italic">Monitor Real-Time</h2>
            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className="bg-neutral-900 border-l-4 border-amber-600 p-5 rounded-xl flex justify-between items-center shadow-lg">
                  <div className="text-left">
                    <p className="font-bold text-white uppercase text-sm">{app.name}</p>
                    <p className="text-[11px] text-neutral-500 mt-1 uppercase">
                      <span className="text-amber-500 font-bold">{app.time}</span> — {app.service}
                    </p>
                  </div>
                  <button onClick={() => removeAppointment(app.id)} className="text-neutral-700 hover:text-green-500 transition-colors">
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
          BARBER CASTEL — <span className="text-amber-600 italic underline">PROGRAMMED BY JAM</span>
        </p>
      </footer>
    </div>
  );
}