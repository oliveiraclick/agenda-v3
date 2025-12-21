
import React, { useState, useEffect } from 'react';
import { BookingStep, Service, Professional, Product } from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../constants';
import { supabase } from '../lib/supabase';

interface CustomerBookingWizardProps {
  salon: any; // Recebe o salão selecionado
  initialServiceId?: string;
  onLoyalty: () => void;
  onBack: () => void;
}

const CustomerBookingWizard: React.FC<CustomerBookingWizardProps> = ({ salon, initialServiceId, onLoyalty, onBack }) => {
  // Safe guard: If salon is null/undefined (e.g. direct nav or refresh without persistence), show error/loading or redirect
  if (!salon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <p className="text-slate-500 mb-4">Selecione um salão para continuar.</p>
        <button onClick={onBack} className="text-primary-brand font-bold">Voltar</button>
      </div>
    );
  }
  const [step, setStep] = useState<BookingStep>(BookingStep.Service);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Services
        const { data: svcs } = await supabase.from('services').select('*').eq('establishment_id', salon.id);
        if (svcs) {
          setServices(svcs);
          // Auto-select initial service if provided
          if (initialServiceId) {
            const found = svcs.find((s: any) => s.id === initialServiceId);
            if (found) setSelectedService(found);
          }
        }

        // 2. Fetch Professionals
        const { data: pros } = await supabase.from('professionals').select('*').eq('establishment_id', salon.id);
        if (pros) setProfessionals(pros);

        // 3. Fetch Products
        const { data: prods } = await supabase.from('products').select('*').eq('establishment_id', salon.id);
        if (prods) setProducts(prods);

      } catch (err) {
        console.error('Error fetching wizard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [salon.id, initialServiceId]);

  // Fetch Availability when Date or Pro changes
  useEffect(() => {
    const fetchAvailability = async () => {
      // Simple logic: Fetch all appointments for the date and disable slots
      // In a real app, this should filter by professional if selected, or check any pro if none selected (complex)
      // For MVP: We will filter by professional IF selected, otherwise show all slots (or check all pros availability - complex)
      // MVP Simplification: If no pro selected, we show slots available for ANY pro (hard to do without backend logic).
      // Let's enforce Pro selection? Or just fetch appointments for that salon on that date.

      let query = supabase
        .from('appointments')
        .select('time')
        .eq('establishment_id', salon.id)
        .eq('date', selectedDate)
        .neq('status', 'cancelled'); // Don't count cancelled

      if (selectedPro) {
        query = query.eq('professional_name', selectedPro.name); // Using name as foreign key in this MVP schema is risky but consistent with current insert
      }

      const { data } = await query;
      if (data) {
        setBookedSlots(data.map(a => a.time));
      }
    };

    fetchAvailability();
  }, [salon.id, selectedDate, selectedPro]);

  const totalPrice = (selectedService?.price || 0) + selectedProducts.reduce((acc, p) => acc + p.price, 0);

  const nextStep = () => {
    if (step === BookingStep.Service && selectedService) setStep(BookingStep.Professional);
    else if (step === BookingStep.Professional) setStep(BookingStep.DateTime);
    else if (step === BookingStep.DateTime && selectedDate && selectedTime) setStep(BookingStep.AddOns);
    else if (step === BookingStep.AddOns) setStep(BookingStep.Summary);
  };

  const prevStep = () => {
    if (step === BookingStep.Summary) setStep(BookingStep.AddOns);
    else if (step === BookingStep.AddOns) setStep(BookingStep.DateTime);
    else if (step === BookingStep.DateTime) setStep(BookingStep.Professional);
    else if (step === BookingStep.Professional) setStep(BookingStep.Service);
    else if (step === BookingStep.Service) onBack();
  };

  const toggleProduct = (product: Product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleBooking = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        establishment_id: salon.id,
        service_name: selectedService?.name,
        professional_name: selectedPro?.name, // Ideally use ID, but schema uses name temporarily? Checked schema, uses names or IDs? Checked types.ts: professional_id is optional? View file shows professional_name insert. Sticking to current working schema.
        professional_id: selectedPro?.id,
        service_id: selectedService?.id,
        date: selectedDate,
        time: selectedTime,
        price: totalPrice,
        status: 'scheduled'
      });

      if (error) throw error;

      // Show success modal
      setLoading(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Erro ao agendar:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Erro ao realizar agendamento: ${errorMessage}`);
      setLoading(false);
    }
  };

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="size-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 shadow-lg shadow-emerald-100 animate-in zoom-in duration-500 delay-100">
              <span className="material-symbols-outlined text-5xl text-emerald-600">check_circle</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Agendamento Confirmado!</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
              Seu horário foi reservado com sucesso no <strong>{salon?.name}</strong>.
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Data</span>
                <span className="text-sm font-black text-slate-900">{selectedDate.split('-').reverse().join('/')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Horário</span>
                <span className="text-sm font-black text-slate-900">{selectedTime}</span>
              </div>
            </div>

            <button
              onClick={onBack}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Loading State
  if (loading && !services.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary-brand border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light text-slate-900 pb-40 view-transition">
      {/* Hero Header */}
      <section className="relative w-full">
        <div className="relative h-[240px] w-full overflow-hidden rounded-b-[2.5rem] shadow-xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${salon?.avatar_url || salon?.cover_url || 'https://picsum.photos/seed/barbershop/800/400'}")` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#111722] via-[#111722]/60 to-transparent"></div>
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <button onClick={prevStep} className="size-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          </div>
          <button onClick={onLoyalty} className="absolute top-4 right-4 z-20 h-10 px-4 rounded-full bg-primary-brand text-white font-bold text-xs flex items-center gap-2 shadow-red-glow active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[18px]">loyalty</span>
            Meu Cartão
          </button>
          <div className="absolute bottom-0 left-0 w-full p-6">
            <span className="inline-flex items-center gap-1 bg-primary-brand/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-white mb-2 shadow-lg">
              <span className="material-symbols-outlined text-[14px]">star</span> 5.0
            </span>
            <h2 className="text-3xl font-black text-white leading-tight mb-1 tracking-tighter">{salon?.name || 'Salão'}</h2>
            <p className="text-gray-300 text-sm flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-primary-brand">location_on</span>
              {salon?.address || 'Endereço não informado'}
            </p>
          </div>
        </div>
      </section>

      {/* Progress Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            {step === BookingStep.Service && 'Escolha o Serviço'}
            {step === BookingStep.Professional && 'Profissional'}
            {step === BookingStep.DateTime && 'Horário'}
            {step === BookingStep.AddOns && 'Produtos'}
            {step === BookingStep.Summary && 'Resumo'}
          </h3>
          <span className="text-[10px] font-black text-primary-brand uppercase">Passo {step}/5</span>
        </div>
        <div className="flex w-full gap-1.5">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary-brand shadow-[0_0_8px_rgba(225,29,72,0.4)]' : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>

      <main className="w-full max-w-md mx-auto flex flex-col pt-4">
        {step === BookingStep.Service && (
          <section className="px-5 space-y-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {['Todos', 'Cabelo', 'Barba', 'Combos'].map((cat, i) => (
                <button key={cat} className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${i === 0 ? 'bg-primary-brand text-white shadow-red-glow' : 'bg-white text-slate-400 border border-slate-100'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {services.map(service => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`group relative flex items-center p-5 rounded-[2rem] bg-white border-2 transition-all cursor-pointer shadow-sm ${selectedService?.id === service.id ? 'border-primary-brand shadow-card' : 'border-slate-50'}`}
                >
                  <div className="flex-1">
                    <h4 className="text-slate-900 font-black text-base">{service.name}</h4>
                    <p className="text-slate-400 text-xs mt-1 font-medium">{service.description}</p>
                    <p className="text-slate-500 text-[10px] font-bold mt-2 flex items-center gap-1.5 uppercase">
                      <span className="material-symbols-outlined text-[14px] text-primary-brand">schedule</span> {service.duration} min
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3 pl-4">
                    <span className="text-slate-900 font-black text-lg tracking-tighter">R${service.price}</span>
                    <div className={`size-6 rounded-full flex items-center justify-center transition-all ${selectedService?.id === service.id ? 'bg-primary-brand text-white' : 'bg-slate-50 border border-slate-200'}`}>
                      {selectedService?.id === service.id && <span className="material-symbols-outlined text-[18px]">check</span>}
                    </div>
                  </div>
                </div>
              ))}
              {services.length === 0 && !loading && (
                <div className="text-center p-8 text-slate-400">Nenhum serviço disponível.</div>
              )}
            </div>
          </section>
        )}

        {/* Professional Step */}
        {step === BookingStep.Professional && (
          <section className="px-5 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Escolha o Profissional</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Option to select 'Any Professional' could be added here */}
              {professionals.map(pro => (
                <div
                  key={pro.id}
                  onClick={() => setSelectedPro(pro)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedPro?.id === pro.id ? 'border-primary-brand bg-rose-50/30' : 'border-slate-100 bg-white'}`}
                >
                  <img src={pro.image || 'https://i.pravatar.cc/150'} alt={pro.name} onError={(e: any) => e.target.src = 'https://i.pravatar.cc/150'} className="w-16 h-16 rounded-full object-cover mb-3 mx-auto" />
                  <div className="text-center">
                    <h4 className="font-bold text-slate-900">{pro.name}</h4>
                    <p className="text-xs text-slate-500">{pro.role}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {/* Performance could be calculated from reviews in future */}
                      <span className="material-symbols-outlined text-amber-500 text-[14px] material-symbols-filled">star</span>
                      <span className="text-xs font-bold">{pro.performance || '5.0'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {professionals.length === 0 && (
                <div className="col-span-2 text-center p-8 text-slate-400">Nenhum profissional disponível.</div>
              )}
            </div>
          </section>
        )}

        {/* Date & Time Step */}
        {step === BookingStep.DateTime && (
          <section className="px-5 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-3">Escolha o Dia</h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {(() => {
                  const days = [];
                  const today = new Date();
                  for (let i = 0; i < 14; i++) {
                    const d = new Date(today);
                    d.setDate(today.getDate() + i);
                    const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
                    const dayNum = d.getDate();
                    const weekDay = d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().slice(0, 3);

                    days.push({ date: dateStr, day: dayNum, short: weekDay });
                  }

                  return days.map(d => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`min-w-[4.5rem] h-20 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${selectedDate === d.date ? 'bg-primary-brand text-white border-primary-brand shadow-red-glow' : 'bg-white text-slate-400 border-slate-100'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider">{d.short}</span>
                      <span className="text-2xl font-black">{d.day}</span>
                    </button>
                  ));
                })()}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-3">Horários Disponíveis</h3>
              <div className="grid grid-cols-4 gap-3">
                {TIME_SLOTS.map(time => {
                  const isBlocked = bookedSlots.includes(time);
                  return (
                    <button
                      key={time}
                      disabled={isBlocked}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${isBlocked
                        ? 'bg-slate-100 text-slate-300 border-transparent cursor-not-allowed decoration-slice line-through'
                        : selectedTime === time
                          ? 'bg-primary-brand text-white border-primary-brand'
                          : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'
                        }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Add-ons Step */}
        {step === BookingStep.AddOns && (
          <section className="px-5 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Produtos & Adicionais</h3>
            <div className="space-y-3">
              {products.map(product => (
                <div
                  key={product.id}
                  onClick={() => toggleProduct(product)}
                  className={`flex items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedProducts.find(p => p.id === product.id) ? 'border-primary-brand bg-rose-50/10' : 'border-slate-50 bg-white'}`}
                >
                  <img src={product.image} className="size-16 rounded-xl object-cover" />
                  <div className="flex-1 px-3">
                    <h4 className="font-bold text-slate-900">{product.name}</h4>
                    <p className="text-xs text-slate-400">{product.brand}</p>
                    <p className="text-primary-brand font-black text-sm mt-1">R$ {product.price}</p>
                  </div>
                  <div className={`size-6 rounded-full border-2 flex items-center justify-center ${selectedProducts.find(p => p.id === product.id) ? 'bg-primary-brand border-primary-brand text-white' : 'border-slate-200'}`}>
                    {selectedProducts.find(p => p.id === product.id) && <span className="material-symbols-outlined text-sm">check</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {step === BookingStep.Summary && (
          <section className="px-5 py-4">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-card">
              <h3 className="text-slate-900 font-black text-lg mb-4 border-b border-slate-50 pb-4">Conferir Agendamento</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-900 text-sm font-black">{selectedService?.name || 'Nenhum serviço'}</p>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Profissional: {selectedPro?.name || 'Qualquer'}</p>
                  </div>
                  <span className="text-slate-900 text-sm font-black">R$ {selectedService?.price.toFixed(2)}</span>
                </div>
                {selectedProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-700 text-sm font-bold">{p.name}</p>
                      <p className="text-slate-400 text-[10px] font-bold uppercase">Produto Adicional</p>
                    </div>
                    <span className="text-slate-900 text-sm font-bold">R$ {p.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-6 mt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-primary-brand bg-rose-50 px-4 py-2 rounded-2xl">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span className="text-xs font-black">{selectedDate} • {selectedTime || '--:--'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer Fixo */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-5 py-5 pb-8">
        <div className="max-w-md mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Valor Total</span>
            <span className="text-slate-900 text-2xl font-black tracking-tighter">R$ {totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={step === BookingStep.Summary ? handleBooking : nextStep}
            disabled={(step === BookingStep.Service && !selectedService) || loading}
            className={`flex-1 h-16 rounded-[2rem] flex items-center justify-center gap-2 text-white font-black text-lg shadow-red-glow transition-all active:scale-95 disabled:opacity-50 ${step === BookingStep.Summary ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-primary-brand'}`}
          >
            {step === BookingStep.Summary ? (loading ? 'Agendando...' : 'Confirmar') : 'Continuar'}
            <span className="material-symbols-outlined font-black">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingWizard;
