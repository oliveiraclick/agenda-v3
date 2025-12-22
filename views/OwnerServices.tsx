
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatCurrency, parseCurrency } from '../lib/currency';

interface OwnerServicesProps {
    onBack: () => void;
}

const OwnerServices: React.FC<OwnerServicesProps> = ({ onBack }) => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newService, setNewService] = useState({ name: '', duration: 30, price: 0, description: '' });
    const [editingService, setEditingService] = useState<any>(null);

    const [establishmentId, setEstablishmentId] = useState<string | null>(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: est } = await supabase
            .from('establishments')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle();

        if (est) {
            setEstablishmentId(est.id);
            const { data } = await supabase.from('services').select('*').eq('establishment_id', est.id);
            if (data) setServices(data);
        }
        setLoading(false);
    };

    const handleSaveService = async () => {
        if (!newService.name || !newService.price) return alert('Preencha nome e preço');
        if (!establishmentId) return alert('Estabelecimento não encontrado.');

        let error;

        if (editingService) {
            // Update
            const { error: updateError } = await supabase.from('services').update({
                name: newService.name,
                duration: newService.duration,
                price: newService.price,
                description: newService.description
            }).eq('id', editingService.id);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase.from('services').insert([
                {
                    name: newService.name,
                    duration: newService.duration,
                    price: newService.price,
                    description: newService.description,
                    establishment_id: establishmentId
                }
            ]);
            error = insertError;
        }

        if (error) {
            alert('Erro ao salvar serviço');
        } else {
            setShowModal(false);
            setNewService({ name: '', duration: 30, price: 0, description: '' });
            setEditingService(null);
            fetchServices();
        }
    };

    const handleEditClick = (service: any) => {
        setEditingService(service);
        setNewService({
            name: service.name,
            duration: service.duration,
            price: service.price,
            description: service.description || ''
        });
        setShowModal(true);
    };

    const handleNewClick = () => {
        setEditingService(null);
        setNewService({ name: '', duration: 30, price: 0, description: '' });
        setShowModal(true);
    };

    const handleDeleteService = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (!error) fetchServices();
        }
    };

    return (
        <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto relative view-transition">
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="material-symbols-outlined text-slate-500">arrow_back</button>
                    <h1 className="text-xl font-bold">Serviços</h1>
                </div>
                <button onClick={handleNewClick} className="size-10 bg-primary-brand text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"><span className="material-symbols-outlined">add</span></button>
            </header>

            <main className="p-4 space-y-4 pb-24 overflow-y-auto">
                {loading ? <p className="text-center text-slate-400">Carregando serviços...</p> : services.map((s) => (
                    <article key={s.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-base text-slate-900">{s.name}</h3>
                                <p className="text-xs text-slate-500">{s.description || 'Sem descrição'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEditClick(s)} className="text-primary-brand hover:text-rose-700 bg-rose-50 p-2 rounded-full transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                <button onClick={() => handleDeleteService(s.id)} className="text-slate-300 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                            <div className="flex items-center gap-2 text-slate-500">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span className="text-xs font-bold">{s.duration} min</span>
                            </div>
                            <span className="text-sm font-bold text-primary-brand">R$ {s.price.toFixed(2)}</span>
                        </div>
                    </article>
                ))}
            </main>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
                        <h2 className="text-lg font-bold mb-4">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                        <div className="space-y-4">
                            <input
                                placeholder="Nome do Serviço"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary-brand"
                                value={newService.name}
                                onChange={e => setNewService({ ...newService, name: e.target.value })}
                            />
                            <textarea
                                placeholder="Descrição (opcional)"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary-brand resize-none h-20"
                                value={newService.description}
                                onChange={e => setNewService({ ...newService, description: e.target.value })}
                            />
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">Preço (R$)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary-brand"
                                        value={formatCurrency(newService.price.toFixed(2).replace('.', ''))}
                                        onFocus={(e) => e.target.select()}
                                        onChange={e => {
                                            const val = parseCurrency(e.target.value);
                                            setNewService({ ...newService, price: val });
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">Duração (min)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-primary-brand"
                                        value={newService.duration}
                                        onChange={e => setNewService({ ...newService, duration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <button onClick={handleSaveService} className="w-full bg-primary-brand text-white font-bold py-4 rounded-xl shadow-red-glow active:scale-95 transition-all">
                                {editingService ? 'Salvar Alterações' : 'Salvar Serviço'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerServices;
