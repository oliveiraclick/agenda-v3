
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DAYS_OF_WEEK } from '../constants';

const OwnerDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedPro, setSelectedPro] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [newAppointment, setNewAppointment] = useState({
    client_name: '',
    service_id: '',
    professional_id: '',
    time: '',
    price: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData);

      // Fetch establishment for name
      const { data: est } = await supabase.from('establishments').select('name').eq('owner_id', user.id).maybeSingle();
      if (est) {
        setProfile(prev => ({ ...prev, company_name: est.name }));
      }
    }

    const { data: pros } = await supabase.from('professionals').select('*');
    if (pros) setProfessionals(pros);

    const { data: servs } = await supabase.from('services').select('*');
    if (servs) setServices(servs);

    fetchAppointments();
  };

  const fetchAppointments = async () => {
    const { data: appts } = await supabase.from('appointments').select('*').order('date', { ascending: true });
    if (appts) setAppointments(appts);
    setLoading(false);
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
  };

  const handleAddAppointment = async () => {
    if (!newAppointment.client_name || !newAppointment.service_id || !newAppointment.professional_id || !newAppointment.time) {
      return alert('Preencha todos os campos obrigatórios');
    }

    const dateStr = currentDate.toLocaleDateString('en-CA');
    const service = services.find(s => s.id === newAppointment.service_id);

    const { error } = await supabase.from('appointments').insert([
      {
        client_name: newAppointment.client_name,
        service_id: newAppointment.service_id,
        service_name: service?.name,
        professional_id: newAppointment.professional_id,
        date: dateStr,
        time: newAppointment.time,
        price: newAppointment.price,
        status: 'pending'
      }
    ]);

    if (error) {
      alert('Erro ao agendar: ' + error.message);
    } else {
      setShowModal(false);
      setNewAppointment({
        client_name: '',
        service_id: '',
        professional_id: '',
        time: '',
        price: 0
      });
      fetchAppointments();
    }
  };

  // --- Logic for Available Slots ---
  const generateTimeSlots = () => {
    const slots = [];
    let start = 8 * 60; // 08:00 in minutes
    const end = 20 * 60; // 20:00 in minutes
    const interval = 30; // 30 minutes

    while (start < end) {
      const h = Math.floor(start / 60);
      const m = start % 60;
      const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push(timeString);
      start += interval;
    }
    return slots;
  };

  const getAvailableSlots = () => {
    if (!newAppointment.professional_id) return [];

    const allSlots = generateTimeSlots();
    const dateStr = currentDate.toLocaleDateString('en-CA');

    const proAppts = appointments.filter(a =>
      a.date === dateStr &&
      a.professional_id === newAppointment.professional_id &&
      a.status !== 'cancelled'
    );

    return allSlots.filter(slot => {
      const [h, m] = slot.split(':').map(Number);
      const slotStart = h * 60 + m;

      const selectedService = services.find(s => s.id === newAppointment.service_id);
      const newDuration = selectedService ? selectedService.duration : 30;
      const slotEnd = slotStart + newDuration;

      const hasCollision = proAppts.some(appt => {
        const [ah, am] = appt.time.split(':').map(Number);
        const apptStart = ah * 60 + am;

        const apptService = services.find(s => s.id === appt.service_id);
        const apptDuration = apptService ? apptService.duration : 30;
        const apptEnd = apptStart + apptDuration;

        return (slotStart < apptEnd && slotEnd > apptStart);
      });

      return !hasCollision;
    });
  };

  const availableSlots = getAvailableSlots();

  // --- Render Helpers ---
  const getCalendarDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - 2);
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const dateStr = currentDate.toLocaleDateString('en-CA');

  const filteredAppointments = appointments.filter(a => {
    const matchDate = a.date === dateStr;
    const matchPro = selectedPro === 'all' || a.professional_id === selectedPro;
    return matchDate && matchPro;
  });

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekDaysShort = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  return (
    <div className="min-h-screen bg-background-light pb-24 view-transition">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between p-5 max-w-md mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="bg-center bg-no-repeat bg-cover rounded-full size-11 ring-2 ring-primary-brand/20 border-2 border-white shadow-sm" style={{ backgroundImage: `url("${profile?.avatar_url || 'https://picsum.photos/seed/owner/200'}")` }}></div>
              <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-slate-900 text-lg font-bold leading-tight">{profile?.company_name || profile?.name || 'Agenda Mestra'}</h1>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Visão Geral</p>
            </div>
          </div>
          <button className="flex items-center justify-center size-11 rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:text-primary-brand transition-colors">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
          </button>
        </div>

        <div className="pb-5 max-w-md mx-auto">
          {/* Visual Professional Filter */}
          <div className="flex gap-4 px-5 overflow-x-auto no-scrollbar mb-6 pt-2">
            {/* "Todos" Option */}
            <div
              onClick={() => setSelectedPro('all')}
              className="flex flex-col items-center gap-2 cursor-pointer group min-w-[60px]"
            >
              <div className={`size-14 rounded-full flex items-center justify-center transition-all ${selectedPro === 'all' ? 'bg-slate-900 text-white shadow-lg scale-110' : 'bg-white border border-slate-200 text-slate-400'}`}>
                <span className="material-symbols-outlined">groups</span>
              </div>
              <span className={`text-[10px] font-bold ${selectedPro === 'all' ? 'text-slate-900' : 'text-slate-400'}`}>Todos</span>
            </div>

            {professionals.map(pro => (
              <div
                key={pro.id}
                onClick={() => setSelectedPro(pro.id)}
                className="flex flex-col items-center gap-2 cursor-pointer group min-w-[60px]"
              >
                <div className={`size-14 rounded-full p-0.5 transition-all ${selectedPro === pro.id ? 'bg-primary-brand ring-2 ring-primary-brand ring-offset-2 scale-110' : 'bg-slate-100 border border-slate-200 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                  <img src={pro.image} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className={`text-[10px] font-bold text-center truncate w-full ${selectedPro === pro.id ? 'text-primary-brand' : 'text-slate-400'}`}>
                  {pro.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-5 mb-4">
            <div className="flex items-center gap-2 text-slate-900">
              <span className="text-lg font-black tracking-tight">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
              <span className="material-symbols-outlined text-sm pt-1 cursor-pointer opacity-40">expand_more</span>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-primary-brand text-xs font-black uppercase tracking-tighter bg-rose-50 px-3 py-1.5 rounded-full"
            >
              Hoje
            </button>
          </div>
          <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar snap-x">
            {calendarDays.map((d, i) => {
              const isActive = d.toDateString() === currentDate.toDateString();
              return (
                <button
                  key={i}
                  onClick={() => handleDateClick(d)}
                  className={`flex flex-col h-20 min-w-[64px] items-center justify-center gap-1 rounded-2xl snap-start transition-all ${isActive
                    ? 'bg-primary-brand text-white shadow-red-glow scale-105'
                    : 'bg-white border border-slate-100 text-slate-400'
                    }`}
                >
                  <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-white/70' : 'text-slate-300'}`}>{weekDaysShort[d.getDay()]}</span>
                  <span className="text-xl font-black">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 relative w-full max-w-md mx-auto px-5 pt-6 pb-10">
        <div className="mb-6">
          <h2 className="text-slate-900 text-xl font-black">Agendamentos</h2>
          <p className="text-slate-400 text-sm font-medium">{filteredAppointments.length} agendamentos listados</p>
        </div>

        <div className="flex flex-col gap-5">
          {loading ? <p className="text-center text-slate-400">Carregando agenda...</p> : (
            filteredAppointments.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                <p>Nenhum agendamento para este dia.</p>
              </div>
            ) : filteredAppointments.map((apt) => (
              <div key={apt.id} className="flex gap-3 relative">
                <div className="flex flex-col items-end w-12 pt-2 shrink-0">
                  <span className="text-sm font-semibold text-slate-900">{apt.time?.substring(0, 5)}</span>
                </div>
                <div className={`flex-1 bg-white rounded-2xl p-4 border-l-4 shadow-card relative overflow-hidden group ${apt.status === 'confirmed' ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {apt.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg leading-tight mb-1">{apt.client_name || 'Cliente'}</h3>
                  <p className="text-slate-500 text-sm mb-3">{apt.service_name || 'Serviço'}</p>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const pro = professionals.find(p => p.id === apt.professional_id);
                        return pro ? (
                          <>
                            <img src={pro.image} className="size-6 rounded-full border border-slate-100" />
                            <span className="text-xs font-medium text-slate-600">Com {pro.name}</span>
                          </>
                        ) : <span className="text-xs font-medium text-slate-400">Profissional não encontrado</span>
                      })()}
                    </div>
                    <span className="text-sm font-bold text-slate-900">R$ {apt.price?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )))}
        </div>
      </main>

      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center size-16 rounded-full bg-primary-brand text-white shadow-red-glow hover:scale-105 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      {showModal && (
        <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <h2 className="text-lg font-bold mb-4">Novo Agendamento</h2>
            <div className="space-y-4">
              <input
                placeholder="Nome do Cliente"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium border-none outline-none ring-0 focus:ring-0"
                value={newAppointment.client_name}
                onChange={e => setNewAppointment({ ...newAppointment, client_name: e.target.value })}
              />

              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium border-none outline-none ring-0 focus:ring-0"
                value={newAppointment.service_id}
                onChange={e => {
                  const service = services.find(s => s.id === e.target.value);
                  setNewAppointment({
                    ...newAppointment,
                    service_id: e.target.value,
                    price: service ? service.price : 0
                  });
                }}
              >
                <option value="">Selecione Serviço</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              {/* Visual Professional Selector */}
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-2 block uppercase">Profissional</label>
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {professionals.map(pro => (
                    <div
                      key={pro.id}
                      onClick={() => setNewAppointment({ ...newAppointment, professional_id: pro.id })}
                      className="flex flex-col items-center gap-2 cursor-pointer group min-w-[70px]"
                    >
                      <div className={`size-16 rounded-full p-1 transition-all ${newAppointment.professional_id === pro.id ? 'bg-primary-brand ring-2 ring-primary-brand ring-offset-2' : 'bg-slate-100 border border-slate-200 group-hover:border-primary-brand'}`}>
                        <img src={pro.image} className="w-full h-full rounded-full object-cover" />
                      </div>
                      <span className={`text-xs font-bold text-center ${newAppointment.professional_id === pro.id ? 'text-primary-brand' : 'text-slate-500'}`}>
                        {pro.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Time Selection */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-500 mb-3 uppercase">Horários Disponíveis</p>
                {!newAppointment.professional_id ? (
                  <p className="text-xs text-slate-400 text-center py-2">Selecione um profissional para ver os horários.</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-red-400 text-center py-2">Agenda lotada para hoje!</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setNewAppointment({ ...newAppointment, time: slot })}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${newAppointment.time === slot
                          ? 'bg-primary-brand text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-brand'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                <span className="text-sm text-slate-500">Valor (R$)</span>
                <input
                  type="number"
                  className="flex-1 bg-transparent text-right font-bold border-none outline-none ring-0 focus:ring-0"
                  value={newAppointment.price}
                  onChange={e => setNewAppointment({ ...newAppointment, price: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="p-6 pt-2 bg-white border-t border-slate-50">
            <button onClick={handleAddAppointment} className="w-full bg-primary-brand text-white font-bold py-4 rounded-2xl shadow-red-glow active:scale-95 transition-all">
              Confirmar Agendamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
