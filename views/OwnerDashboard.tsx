
import React from 'react';
import { MOCK_APPOINTMENTS, DAYS_OF_WEEK } from '../constants';
import { Appointment } from '../types';

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  if (appointment.status === 'free') {
    return (
      <div className="group flex gap-3">
        <div className="flex flex-col items-end w-12 pt-2 shrink-0">
          <span className="text-sm font-semibold text-slate-500">{appointment.time}</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-3 hover:border-primary-brand/50 transition-colors cursor-pointer flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-rose-50 text-primary-brand group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">add</span>
            </div>
            <div>
              <p className="text-slate-900 font-medium">Horário Livre</p>
              <p className="text-xs text-slate-400">Toque para agendar</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appointment.status === 'blocked') {
    return (
      <div className="flex gap-3">
        <div className="flex flex-col items-end w-12 pt-2 shrink-0">
          <span className="text-sm font-semibold text-slate-500">{appointment.time}</span>
          <span className="text-[10px] text-slate-400">{appointment.duration}</span>
        </div>
        <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 flex items-center gap-4 opacity-80">
          <div className="flex items-center justify-center size-10 rounded-full bg-white text-slate-400">
            <span className="material-symbols-outlined">{appointment.type === 'lunch' ? 'coffee' : 'block'}</span>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold text-base">{appointment.clientName || 'Bloqueio'}</h3>
            <p className="text-slate-400 text-xs">Indisponível</p>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = appointment.status === 'confirmed';

  return (
    <div className="flex gap-3 relative">
      <div className="flex flex-col items-end w-12 pt-2 shrink-0">
        <span className="text-sm font-semibold text-slate-900">{appointment.time}</span>
        <span className="text-[10px] text-slate-400">{appointment.duration}</span>
      </div>
      <div className={`flex-1 bg-white rounded-2xl p-4 border-l-4 shadow-card relative overflow-hidden group ${isConfirmed ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${isConfirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {isConfirmed ? 'Confirmado' : 'Pendente'}
          </span>
        </div>
        <h3 className="text-slate-900 font-bold text-lg leading-tight mb-1">{appointment.clientName}</h3>
        <p className="text-slate-500 text-sm mb-3">{appointment.service}</p>
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-cover bg-center border border-slate-100" style={{ backgroundImage: `url('https://i.pravatar.cc/100?u=${appointment.professional}')` }}></div>
            <span className="text-xs font-medium text-slate-600">Com {appointment.professional}</span>
          </div>
          <span className="text-sm font-bold text-slate-900">R$ {appointment.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const OwnerDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light pb-24 view-transition">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between p-5 max-w-md mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="bg-center bg-no-repeat bg-cover rounded-full size-11 ring-2 ring-primary-brand/20 border-2 border-white shadow-sm" style={{ backgroundImage: 'url("https://picsum.photos/seed/owner/200")' }}></div>
              <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-slate-900 text-lg font-bold leading-tight">Minha Agenda</h1>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Seu Negócio</p>
            </div>
          </div>
          <button className="flex items-center justify-center size-11 rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:text-primary-brand transition-colors">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
          </button>
        </div>
        
        <div className="pb-5 max-w-md mx-auto">
          <div className="flex items-center justify-between px-5 mb-4">
            <div className="flex items-center gap-2 text-slate-900">
              <span className="text-lg font-black tracking-tight">Outubro 2023</span>
              <span className="material-symbols-outlined text-sm pt-1 cursor-pointer opacity-40">expand_more</span>
            </div>
            <button className="text-primary-brand text-xs font-black uppercase tracking-tighter bg-rose-50 px-3 py-1.5 rounded-full">Hoje</button>
          </div>
          <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar snap-x">
            {DAYS_OF_WEEK.map((d, i) => (
              <button 
                key={i}
                className={`flex flex-col h-20 min-w-[64px] items-center justify-center gap-1 rounded-2xl snap-start transition-all ${
                  d.active 
                    ? 'bg-primary-brand text-white shadow-red-glow scale-105' 
                    : 'bg-white border border-slate-100 text-slate-400'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase ${d.active ? 'text-white/70' : 'text-slate-300'}`}>{d.short}</span>
                <span className="text-xl font-black">{d.day}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 relative w-full max-w-md mx-auto px-5 pt-6 pb-10">
        <div className="mb-6">
          <h2 className="text-slate-900 text-xl font-black">24 de Outubro</h2>
          <p className="text-slate-400 text-sm font-medium">8 agendamentos previstos para hoje</p>
        </div>

        <div className="flex flex-col gap-5">
          {MOCK_APPOINTMENTS.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}

          {/* Current Time Indicator Line */}
          <div className="flex items-center gap-3 my-2">
            <div className="w-12 text-right">
              <span className="text-xs font-black text-primary-brand">10:15</span>
            </div>
            <div className="flex-1 h-0.5 bg-primary-brand relative opacity-40">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary-brand ring-2 ring-white"></div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-24 right-6 z-40">
        <button className="flex items-center justify-center size-16 rounded-full bg-primary-brand text-white shadow-red-glow hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
    </div>
  );
};

export default OwnerDashboard;
