
import React, { useState } from 'react';
import { BookingStep, Service, Professional, Product } from '../types';
import { MOCK_SERVICES, MOCK_PROFESSIONALS, MOCK_PRODUCTS, DAYS_OF_WEEK, TIME_SLOTS } from '../constants';

interface CustomerBookingWizardProps {
  onLoyalty: () => void;
  onBack: () => void;
}

const CustomerBookingWizard: React.FC<CustomerBookingWizardProps> = ({ onLoyalty, onBack }) => {
  const [step, setStep] = useState<BookingStep>(BookingStep.Service);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const totalPrice = (selectedService?.price || 0) + selectedProducts.reduce((acc, p) => acc + p.price, 0);

  const toggleProduct = (product: Product) => {
    setSelectedProducts(prev => 
      prev.find(p => p.id === product.id) 
        ? prev.filter(p => p.id !== product.id) 
        : [...prev, product]
    );
  };

  const nextStep = () => {
    if (step < BookingStep.Summary) setStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (step > BookingStep.Service) setStep(prev => prev - 1);
    else onBack();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light text-slate-900 pb-32 view-transition">
      {/* Hero Header */}
      <section className="relative w-full">
        <div className="relative h-[240px] w-full overflow-hidden rounded-b-[2.5rem] shadow-xl">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://picsum.photos/seed/barbershop/800/400")' }}></div>
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
              <span className="material-symbols-outlined text-[14px]">star</span> 4.9 (1.2k)
            </span>
            <h2 className="text-3xl font-black text-white leading-tight mb-1 tracking-tighter">Barbearia Elite</h2>
            <p className="text-gray-300 text-sm flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px] text-primary-brand">location_on</span>
              Av. Paulista, 1230 - São Paulo
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
              {MOCK_SERVICES.map(service => (
                <div 
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`group relative flex items-center p-5 rounded-[2rem] bg-white border-2 transition-all cursor-pointer shadow-sm ${selectedService?.id === service.id ? 'border-primary-brand shadow-card' : 'border-slate-50'}`}
                >
                  <div className="flex-1">
                    <h4 className="text-slate-900 font-black text-base">{service.name}</h4>
                    <p className="text-slate-400 text-xs mt-1 font-medium">{service.description}</p>
                    <p className="text-slate-500 text-[10px] font-bold mt-2 flex items-center gap-1.5 uppercase">
                      <span className="material-symbols-outlined text-[14px] text-primary-brand">schedule</span> {service.duration}
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
            </div>
          </section>
        )}

        {/* Demais steps seguem a mesma padronização... */}
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
                     <span className="text-xs font-black">24 Out • {selectedTime || '--:--'}</span>
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
            onClick={nextStep}
            disabled={step === BookingStep.Service && !selectedService}
            className={`flex-1 h-16 rounded-[2rem] flex items-center justify-center gap-2 text-white font-black text-lg shadow-red-glow transition-all active:scale-95 disabled:opacity-50 ${step === BookingStep.Summary ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-primary-brand'}`}
          >
            {step === BookingStep.Summary ? 'Confirmar' : 'Continuar'}
            <span className="material-symbols-outlined font-black">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingWizard;
