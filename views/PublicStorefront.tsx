import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';

interface PublicStorefrontProps {
    slug: string;
    onBookService?: (serviceId: string) => void;
}

const PublicStorefront: React.FC<PublicStorefrontProps> = ({ slug, onBookService }) => {
    const [salon, setSalon] = useState<any>(null);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStoreData();
    }, [slug]);

    const fetchStoreData = async () => {
        try {
            // 1. Busca os dados do salão pela slug
            const { data: store, error: storeError } = await supabase
                .from('establishments')
                .select('*')
                .eq('slug', slug)
                .single();

            if (storeError) throw new Error('Salão não encontrado.');

            if (store) {
                setSalon(store);

                // 2. Busca os serviços deste salão específico
                const { data: svcs, error: svcsError } = await supabase
                    .from('services')
                    .select('*')
                    .eq('establishment_id', store.id);

                if (!svcsError && svcs) {
                    setServices(svcs);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar salão.');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => {
        if (salon?.phone) {
            const cleanPhone = salon.phone.replace(/\D/g, '');
            window.open(`https://wa.me/55${cleanPhone}`, '_blank');
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: salon?.name,
                    text: `Confira ${salon?.name}! Agende seu horário agora.`,
                    url: url,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copiado!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="size-20 bg-white/70 rounded-full mb-4 backdrop-blur-xl"></div>
                    <div className="h-4 w-32 bg-white/70 rounded backdrop-blur-xl"></div>
                </div>
            </div>
        );
    }

    if (error || !salon) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 p-8 text-center max-w-md">
                    <div className="inline-flex p-4 bg-red-50 rounded-3xl mb-6">
                        <span className="material-symbols-outlined text-5xl text-red-500">error</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Salão não encontrado</h1>
                    <p className="text-slate-500 font-medium text-sm mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-gradient-to-r from-primary-brand to-rose-600 py-4 rounded-2xl text-white font-black shadow-lg"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary-brand/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
            </div>

            {/* Banner de Capa Premium */}
            <div className="relative h-64 bg-slate-900 overflow-hidden">
                <img
                    src={salon?.cover_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000'}
                    className="w-full h-full object-cover opacity-60"
                    alt="Capa do Salão"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent"></div>
            </div>

            {/* Info do Salão (Card Flutuante) */}
            <div className="px-6 -mt-20 relative z-10">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="size-24 rounded-[2rem] bg-white p-2 shadow-lg mx-auto -mt-20 overflow-hidden border-4 border-white/50">
                        {salon?.logo_url ? (
                            <img src={salon.logo_url} className="w-full h-full object-cover rounded-[1.5rem]" alt="Logo" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-brand/5 rounded-[1.5rem]">
                                <Logo size={40} />
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl font-black mt-4 tracking-tighter text-slate-900">{salon?.name}</h1>
                    {salon?.type && (
                        <p className="text-sm text-slate-500 font-medium mt-1">{salon.type}</p>
                    )}
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                        <span className="text-sm font-bold text-slate-700">{salon?.rating || '5.0'}</span>
                        {salon?.address_city && (
                            <>
                                <span className="text-slate-300">•</span>
                                <span className="text-sm font-medium text-slate-500">{salon.address_city}</span>
                            </>
                        )}
                    </div>

                    {salon?.description && (
                        <p className="text-sm text-slate-600 mt-4 leading-relaxed">{salon.description}</p>
                    )}

                    {/* Botões de Contato Rápidos */}
                    <div className="flex justify-center gap-4 mt-6">
                        {salon?.phone && (
                            <button
                                onClick={handleWhatsApp}
                                className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 hover:scale-110 transition-all"
                                title="WhatsApp"
                            >
                                <span className="material-symbols-outlined">chat</span>
                            </button>
                        )}
                        {salon?.address_full && (
                            <button
                                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(salon.address_full)}`, '_blank')}
                                className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 hover:scale-110 transition-all"
                                title="Ver no Mapa"
                            >
                                <span className="material-symbols-outlined">location_on</span>
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            className="size-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 hover:scale-110 transition-all"
                            title="Compartilhar"
                        >
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu de Serviços */}
            <div className="p-6 space-y-4 relative z-10">
                <h3 className="text-lg font-black tracking-tight text-slate-900 ml-2">Escolha seu serviço</h3>
                <div className="grid gap-3">
                    {services.length > 0 ? (
                        services.map((svc) => (
                            <div
                                key={svc.id}
                                className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] border border-white/50 shadow-sm flex items-center justify-between group hover:shadow-lg hover:border-primary-brand/30 active:scale-[0.98] transition-all"
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-brand/5 group-hover:text-primary-brand transition-all">
                                        <span className="material-symbols-outlined">content_cut</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{svc.name}</h4>
                                        <p className="text-xs text-slate-400 font-bold">
                                            {svc.duration} • R$ {parseFloat(svc.price).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onBookService?.(svc.id)}
                                    className="h-10 px-5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary-brand hover:scale-105 transition-all"
                                >
                                    Agendar
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 text-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">sentiment_dissatisfied</span>
                            <p className="text-slate-500 font-medium">Nenhum serviço disponível no momento.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Fixo de Conversão */}
            {services.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-white/50 z-50">
                    <button
                        onClick={() => {
                            // Scroll to services or trigger first service booking
                            if (services[0]) {
                                onBookService?.(services[0].id);
                            }
                        }}
                        className="w-full h-16 bg-gradient-to-r from-primary-brand to-rose-600 rounded-2xl text-white font-black text-lg shadow-xl shadow-primary-brand/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined">calendar_month</span>
                        AGENDAMENTO RÁPIDO
                    </button>
                </div>
            )}
        </div>
    );
};

export default PublicStorefront;
