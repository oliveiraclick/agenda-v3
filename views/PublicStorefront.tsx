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
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStoreData();
    }, [slug]);

    const fetchStoreData = async () => {
        try {
            // 1. Busca os dados do salão
            const { data: store, error: storeError } = await supabase
                .from('establishments')
                .select('*')
                .eq('slug', slug)
                .single();

            if (storeError) throw new Error('Salão não encontrado.');

            if (store) {
                setSalon(store);

                // 2. Busca Serviços
                const { data: svcs } = await supabase
                    .from('services')
                    .select('*')
                    .eq('establishment_id', store.id);
                if (svcs) setServices(svcs);

                // 3. Busca Profissionais
                const { data: pros } = await supabase
                    .from('professionals')
                    .select('*')
                    .eq('establishment_id', store.id);
                if (pros) setProfessionals(pros);

                // 4. Busca Produtos
                const { data: prods } = await supabase
                    .from('products')
                    .select('*')
                    .eq('establishment_id', store.id);
                if (prods) setProducts(prods);
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

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = 'https://placehold.co/400?text=Imagem+Indisponível';
        e.currentTarget.onerror = null; // prevents looping
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
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary-brand/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
            </div>

            {/* Banner */}
            <div className="relative h-72 bg-slate-900 overflow-hidden">
                <img
                    src={salon?.cover_url || salon?.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000'}
                    className="w-full h-full object-cover opacity-60"
                    alt="Capa do Salão"
                    onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent"></div>
            </div>

            {/* Header Info */}
            <div className="px-6 -mt-24 relative z-10">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 text-center">
                    <div className="size-28 rounded-[2rem] bg-white p-2 shadow-lg mx-auto -mt-24 overflow-hidden border-4 border-white/50">
                        {salon?.logo_url || salon?.image_url ? (
                            <img
                                src={salon.logo_url || salon.image_url}
                                className="w-full h-full object-cover rounded-[1.5rem]"
                                alt="Logo"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-brand/5 rounded-[1.5rem]">
                                <Logo size={40} />
                            </div>
                        )}
                    </div>
                    <h1 className="text-3xl font-black mt-4 tracking-tighter text-slate-900">{salon?.name}</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-widest">{salon?.category || 'Salão Premium'}</p>

                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="flex bg-amber-50 px-3 py-1 rounded-full gap-1 items-center">
                            <span className="material-symbols-outlined text-amber-500 text-sm">star</span>
                            <span className="text-sm font-bold text-amber-900">{salon?.rating || '5.0'}</span>
                        </div>
                        {salon?.address_city && (
                            <div className="flex bg-slate-100 px-3 py-1 rounded-full gap-1 items-center">
                                <span className="material-symbols-outlined text-slate-500 text-sm">location_on</span>
                                <span className="text-sm font-bold text-slate-600 truncate max-w-[150px]">{salon.address_city}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        {salon?.phone && (
                            <button onClick={handleWhatsApp} className="size-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all">
                                <span className="material-symbols-outlined">chat</span>
                            </button>
                        )}
                        <button onClick={handleShare} className="size-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-all">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* História */}
            {salon?.history && (
                <div className="px-6 py-8 relative z-10">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-4">Nossa História</h3>
                    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50">
                        <p className="text-slate-600 leading-relaxed font-medium">
                            {salon.history}
                        </p>
                    </div>
                </div>
            )}

            {/* Profissionais */}
            {professionals.length > 0 && (
                <div className="px-6 py-4 relative z-10">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-4">Time de Estrelas</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        {professionals.map(pro => (
                            <div key={pro.id} className="min-w-[140px] snap-center bg-white/80 p-3 rounded-[2rem] text-center border border-white/50 shadow-sm">
                                <div className="size-24 mx-auto mb-3 rounded-[1.5rem] overflow-hidden bg-slate-100">
                                    <img
                                        src={pro.image || 'https://i.pravatar.cc/150'}
                                        className="w-full h-full object-cover"
                                        onError={handleImageError}
                                    />
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm">{pro.name}</h4>
                                <p className="text-xs text-primary-brand font-bold uppercase mt-1">{pro.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Serviços */}
            <div className="px-6 py-4 relative z-10">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Serviços</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{services.length} OPÇÕES</span>
                </div>
                <div className="grid gap-3">
                    {services.map((svc) => (
                        <div key={svc.id} className="bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] border border-white/50 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                            <div className="flex gap-4 items-center">
                                <div className="size-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined">content_cut</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{svc.name}</h4>
                                    <p className="text-xs text-slate-400 font-bold mt-0.5">
                                        {svc.duration} • R$ {parseFloat(svc.price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onBookService?.(svc.id)}
                                className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-primary-brand transition-colors"
                            >
                                <span className="material-symbols-outlined">calendar_add_on</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Produtos (Vitrine) */}
            {products.length > 0 && (
                <div className="px-6 py-6 relative z-10 bg-white/40 my-4 backdrop-blur-sm">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-4 px-2">Produtos Exclusivos</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {products.map(prod => (
                            <div key={prod.id} className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
                                <div className="aspect-square rounded-[1.5rem] bg-slate-100 mb-3 overflow-hidden">
                                    {prod.image ? (
                                        <img
                                            src={prod.image}
                                            className="w-full h-full object-cover"
                                            onError={handleImageError}
                                        />
                                    ) : null}
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm leading-tight">{prod.name}</h4>
                                <p className="text-xs text-slate-400 mt-1">{prod.description || prod.brand}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mapa */}
            {salon?.address_full && (
                <div className="px-6 pb-8 relative z-10">
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-4">Localização</h3>
                    <div className="bg-white/80 p-2 rounded-[2.5rem] shadow-lg border border-white/50 h-64 overflow-hidden">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0, borderRadius: '2rem' }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(salon.address_full)}`}
                        ></iframe>
                        {/* Note: Google Maps Embed API requires a key. 
                             If no key, maybe use simple maps link or static image fallback.
                             For now using the q param directly might strictly require API Key for embed mode.
                             Alternative: Use simple link button if embed fails.
                         */}
                    </div>
                    <div className="mt-4 text-center">
                        <p className="text-slate-500 text-sm font-medium mb-3">{salon.address_full}</p>
                        <button
                            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(salon.address_full)}`, '_blank')}
                            className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">map</span>
                            Abrir no GPS
                        </button>
                    </div>
                </div>
            )}

            {/* Footer Fixo */}
            {services.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-white/50 z-50">
                    <button
                        onClick={() => {
                            if (services[0]) onBookService?.(services[0].id);
                        }}
                        className="w-full h-16 bg-gradient-to-r from-primary-brand to-rose-600 rounded-[1.5rem] text-white font-black text-lg shadow-xl shadow-primary-brand/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined">calendar_month</span>
                        AGENDAR TUDO AGORA
                    </button>
                </div>
            )}
        </div>
    );
};

export default PublicStorefront;
