import React, { useState, useEffect } from 'react';
// IMPORTACIÓN CORREGIDA DE ICONOS
import { 
  CheckCircle, 
  BookmarkCheck, 
  CalendarDays, 
  Wallet, 
  AlertCircle, 
  Scissors, 
  Trash2 
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  updateDoc 
} from "firebase/firestore";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCHiVFoSC1XTVdkNLG8-PXBIzupSEv1xVI",
  authDomain: "barber-castel.firebaseapp.com",
  projectId: "barber-castel",
  storageBucket: "barber-castel.firebasestorage.app",
  messagingSenderId: "803253641824",
  appId: "1:803253641824:web:901d7a4907b59245ced905",
  measurementId: "G-N8NX7YB5J7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Appointment {
  id: string;
  name: string;
  service: string;
  time: string;
  status: 'pendiente' | 'confirmada';
}

export default function BarberCastel() {
  const [view, setView] = useState<'client' | 'owner'>('client');
  const [isLogged, setIsLogged] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const ADMIN_PASSWORD = "000001";

  const availableHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

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

  const addAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const selectedTime = formData.get('time') as string;
    const clientName = formData.get('clientName') as string;
    const service = formData.get('service') as string;

    if (!selectedTime) return alert("Por favor, selecciona un horario.");

    try {
      await addDoc(collection(db, "citas"), {
        name: clientName,
        service: service,
        time: selectedTime,
        status: 'pendiente',
        createdAt: new Date()
      });

      const mensaje = `*BARBER CASTEL - RESERVA*%0A%0A👤 *Cliente:* ${clientName}%0A💈 *Servicio:* ${service}%0A⏰ *Hora:* ${selectedTime}%0A%0A_Adjunto comprobante del Banco de Loja para confirmación._`;
      window.open(`https://wa.me/593991604987?text=${mensaje}`, '_blank');
      
      alert("¡Reserva enviada! Envía el comprobante por WhatsApp.");
      e.currentTarget.reset();
    } catch (error) {
      alert("Error de conexión con la nube.");
    }
  };

  const confirmAppointment = async (id: string) => {
    await updateDoc(doc(db, "citas", id), { status: 'confirmada' });
  };

  const removeAppointment = async (id: string) => {
    if(confirm("¿Eliminar esta cita?")) {
      await deleteDoc(doc(db, "citas", id));
    }
  };

  const freeHours = availableHours.filter(hour => !appointments.some(app => app.time === hour));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 font-sans pb-28 text-left">
      <header className="p-5 border-b border-amber-900/20 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <Scissors size={24} color="black" />
          </div>
          <div>
            <h1 className="text-lg font-black text-amber-500 italic uppercase leading-none">Barber Castel</h1>
            <p className="text-[8px] text-amber-700 font-bold uppercase mt-1 tracking-widest leading-none">Macará - JAM</p>
          </div>
        </div>
        <button 
          onClick={() => {
            if(isLogged) setView(view === 'client' ? 'owner' : 'client');
            else {
              const p = prompt("Clave:");
              if(p === ADMIN_PASSWORD) { setIsLogged(true); setView('owner'); }
            }
          }}
          className="text-[9px] font-black px-4 py-2 rounded-lg border border-amber-600/30 text-amber-500 uppercase"
        >
          {view === 'client' ? 'Admin' : 'Volver'}
        </button>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {view === 'client' ? (
          <section className="space-y-8">
            <div className="bg-amber-600/5 border border-amber-600/20 p-5 rounded-2xl flex gap-4 items-center">
              <Wallet className="text-amber-500" size={28} />
              <div className="text-left">
                <p className="font-black text-amber-500 uppercase text-[10px] italic">Pago para confirmar</p>
                <p className="text-white font-bold text-sm leading-tight">Banco de Loja - Ahorros</p>
                <p className="text-amber-200/80 font-mono text-xs">2904263162</p>
                <p className="text-neutral-400 text-[10px] uppercase mt-0.5 leading-none">Jhon David Castillo P.</p>
              </div>
            </div>

            <form onSubmit={addAppointment} className="space-y-6">
              <h2 className="text-3xl font-black italic uppercase leading-none">Agendar Turno</h2>
              <div className="space-y-4">
                <input name="clientName" required className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl outline-none focus:border-amber-600 text-sm" placeholder="Tu nombre" />
                <select name="service" className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl outline-none text-sm">
                  <option>Corte Castel ($7.00)</option>
                  <option>Barba ($5.00)</option>
                  <option>Combo Premium ($12.00)</option>
                </select>
                <div className="grid grid-cols-3 gap-2">
                  {freeHours.map(hour => (
                    <label key={hour} className="cursor-pointer">
                      <input type="radio" name="time" value={hour} className="peer sr-only" required />
                      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-center text-xs font-bold peer-checked:bg-amber-600 peer-checked:text-black transition-all">{hour}</div>
                    </label>
                  ))}
                </div>
              </div>
              <button className="w-full bg-amber-600 text-black font-black py-4 rounded-2xl shadow-lg uppercase text-sm italic tracking-tighter">
                <BookmarkCheck size={20} className="inline mr-2" /> CONFIRMAR RESERVA
              </button>
            </form>
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="text-xl font-black text-amber-500 uppercase italic">Validación de Pagos</h2>
            {appointments.map((app) => (
              <div key={app.id} className={`bg-neutral-900/50 border-l-4 p-4 rounded-xl flex justify-between items-center ${app.status === 'pendiente' ? 'border-red-600' : 'border-green-500'}`}>
                <div className="text-left">
                  <p className="font-bold text-white uppercase text-xs">{app.name}</p>
                  <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase leading-none">{app.time} — {app.service}</p>
                </div>
                <div className="flex gap-2">
                  {app.status === 'pendiente' && (
                    <button onClick={() => confirmAppointment(app.id)} className="text-green-500 p-1">
                      <CheckCircle size={24} />
                    </button>
                  )}
                  <button onClick={() => removeAppointment(app.id)} className="text-neutral-700">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <CalendarDays size={48} className="mx-auto" />
                <p className="text-xs font-bold uppercase mt-2">Sin citas hoy</p>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 w-full p-6 bg-black/90 border-t border-neutral-900 text-center">
        <p className="text-[9px] text-neutral-600 tracking-[0.4em] font-black uppercase">
          Barber Castel — <span className="text-amber-600 italic underline">By JAM 2024</span>
        </p>
      </footer>
    </div>
  );
}