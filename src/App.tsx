import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  BookmarkCheck, 
  CalendarDays, 
  Wallet, 
  Scissors, 
  Trash2,
  AlertTriangle
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

    if (!selectedTime) return alert("Por favor, selecciona una hora.");

    try {
      const docRef = await addDoc(collection(db, "citas"), {
        name: clientName,
        service: service,
        time: selectedTime,
        status: 'pendiente',
        createdAt: new Date()
      });

      if (docRef.id) {
        alert("¡Cita registrada con éxito!");
        const mensaje = `*BARBER CASTEL - RESERVA*%0A%0A👤 *Cliente:* ${clientName}%0A💈 *Servicio:* ${service}%0A⏰ *Hora:* ${selectedTime}%0A%0A_Adjunto comprobante de $1.00 (Banco de Loja). Entiendo que si no asisto, pierdo el depósito._`;
        window.open(`https://wa.me/593991604987?text=${mensaje}`, '_blank');
        e.currentTarget.reset();
      }
    } catch (error) {
      console.error("Error en proceso:", error);
    }
  };

  const confirmAppointment = async (id: string) => {
    await updateDoc(doc(db, "citas", id), { status: 'confirmada' });
  };

  const removeAppointment = async (id: string) => {
    if(confirm("¿Eliminar cita?")) {
      await deleteDoc(doc(db, "citas", id));
    }
  };

  const freeHours = availableHours.filter(hour => !appointments.some(app => app.time === hour));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 font-sans pb-28 text-left">
      <header className="p-5 border-b border-amber-900/20 bg-black/50 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.3)]">
            <Scissors size={24} color="black" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-black text-amber-500 italic uppercase leading-none tracking-tighter">Barber Castel</h1>
            <p className="text-[8px] text-amber-700 font-bold uppercase mt-1 tracking-widest leading-none">Macará - JAM</p>
          </div>
        </div>
        <button onClick={() => { if(isLogged) setView(view === 'client' ? 'owner' : 'client'); else { const p = prompt("Clave:"); if(p === ADMIN_PASSWORD) { setIsLogged(true); setView('owner'); } } }} className="text-[9px] font-black px-4 py-2 rounded-lg border border-amber-600/30 text-amber-500 uppercase tracking-widest">
          {view === 'client' ? 'Admin' : 'Volver'}
        </button>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {view === 'client' ? (
          <section className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-amber-600/5 border border-amber-600/20 p-5 rounded-2xl space-y-4 shadow-inner">
              <div className="flex gap-4 items-center">
                <Wallet className="text-amber-500" size={28} />
                <div className="text-left">
                  <p className="font-black text-amber-500 uppercase text-[10px] italic">Reserva con $1.00</p>
                  <p className="text-white font-bold text-sm leading-tight">Banco de Loja - Ahorros</p>
                  <p className="text-amber-200/80 font-mono text-xs">2904263162</p>
                  <p className="text-neutral-400 text-[10px] uppercase mt-0.5 leading-none font-bold">Jhon David Castillo P.</p>
                </div>
              </div>
              <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-xl flex gap-3 items-center">
                <AlertTriangle className="text-red-500 shrink-0" size={18} />
                <p className="text-[9px] text-red-200 leading-tight uppercase font-black">Nota: Si no asiste, pierde el depósito de $1.00.</p>
              </div>
            </div>

            <form onSubmit={addAppointment} className="space-y-6">
              <h2 className="text-3xl font-black italic uppercase leading-none tracking-tighter">Agendar Turno</h2>
              <div className="space-y-4">
                <input name="clientName" required className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl outline-none focus:border-amber-600 transition-all text-sm" placeholder="Tu nombre" />
                <select name="service" className="w-full bg-neutral-900 border border-neutral-800 p-4 rounded-xl outline-none text-sm font-bold text-amber-500 appearance-none">
                  <option>Corte Castel ($4.00)</option>
                </select>
                <div className="grid grid-cols-3 gap-2">
                  {freeHours.map(hour => (
                    <label key={hour} className="cursor-pointer group">
                      <input type="radio" name="time" value={hour} className="peer sr-only" required />
                      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-center text-xs font-bold peer-checked:bg-amber-600 peer-checked:text-black transition-all group-active:scale-90">{hour}</div>
                    </label>
                  ))}
                </div>
              </div>
              <button className="w-full bg-amber-600 text-black font-black py-4 rounded-2xl shadow-xl shadow-amber-600/10 uppercase text-sm italic tracking-tighter active:scale-95 transition-transform">
                <BookmarkCheck size={20} className="inline mr-2" /> Reservar con $1.00
              </button>
            </form>
          </section>
        ) : (
          <section className="space-y-4 animate-in slide-in-from-bottom duration-500">
            <h2 className="text-xl font-black text-amber-500 uppercase italic">Gestión de Turnos</h2>
            <div className="space-y-3">
              {appointments.map((app) => (
                <div key={app.id} className={`bg-neutral-900/50 border-l-4 p-4 rounded-xl flex justify-between items-center ${app.status === 'pendiente' ? 'border-red-600' : 'border-green-500'}`}>
                  <div className="text-left">
                    <p className="font-black text-white uppercase text-xs tracking-tight">{app.name} {app.status === 'pendiente' && <span className="text-[7px] bg-red-600 text-white px-1 ml-1 rounded">PENDIENTE $1</span>}</p>
                    <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase leading-none">{app.time} — {app.service}</p>
                  </div>
                  <div className="flex gap-2">
                    {app.status === 'pendiente' && (
                      <button onClick={() => confirmAppointment(app.id)} className="text-green-500 p-2 bg-green-500/10 rounded-lg border border-green-500/20"><CheckCircle size={20} /></button>
                    )}
                    <button onClick={() => removeAppointment(app.id)} className="text-neutral-700 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 w-full p-6 bg-black/95 border-t border-neutral-900 text-center z-50">
        <p className="text-[9px] text-neutral-600 tracking-[0.4em] font-black uppercase">
          Barber Castel — <span className="text-amber-600 italic underline underline-offset-4 decoration-amber-900/30">By JAM 2026</span>
        </p>
      </footer>
    </div>
  );
}