import React, { useState, useEffect } from 'react';
import { CustomerView } from '../types';
import { supabase } from '../lib/supabase';

interface CustomerPortalProps {
   onNavigate: (view: CustomerView) => void;
   onSelectSalon?: (salon: any) => void;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ onNavigate, onSelectSalon }) => {
   const [lastVisit, setLastVisit] = useState<any>(null);
   const [user, setUser] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [establishments, setEstablishments] = useState<any[]>([]);
   const [favorites, setFavorites] = useState<string[]>([]);
   const [notifications, setNotifications] = useState<any[]>([]);
   const [appointments, setAppointments] = useState<any[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [searchResults, setSearchResults] = useState<any[]>([]);
   const [showNotifications, setShowNotifications] = useState(false);

   // Initialize Data
   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      setLoading(true);
      try {
         // 1. Get User
         const { data: { user } } = await supabase.auth.getUser();

         if (user) {
            // Fetch Profile Name and Avatar explicitly to avoid stale auth data
            const { data: profile } = await supabase
               .from('profiles')
               .select('name, avatar_url')
               .eq('id', user.id)
               .maybeSingle();

            if (profile) {
               // Merge profile data into user metadata for display
               user.user_metadata = {
                  ...user.user_metadata,
                  name: profile.name,
                  avatar_url: profile.avatar_url
               };
            }
         }

         setUser(user);

         // 2. Get Establishments
         const { data: dbEstablishments, error } = await supabase
            .from('establishments')
            .select('*');

         if (error) {
            console.error('Error fetching establishments:', error);
            throw error;
         }

         console.log('Fetched establishments:', dbEstablishments);

         let mappedEstablishments: any[] = [];
         if (dbEstablishments && dbEstablishments.length > 0) {
            // Map DB columns to UI props
            mappedEstablishments = dbEstablishments.map(item => ({
               ...item,
               // FIXED: Prioritize Profile Name (Owner) over Establishment Name
               name: item.profiles?.name || item.name || 'Meu Negócio',
               image_url: item.image_url || 'https://picsum.photos/seed/shop/400/200',
               image: item.image_url || 'https://picsum.photos/seed/shop/400/200',
               rating: item.rating || 5.0,
               type: item.category || 'Serviços'
            }));
            setEstablishments(mappedEstablishments);
         } else {
            setEstablishments([]);
         }

         // 3. Get Favorites, Notifications & Appointments from DB if user exists
         if (user) {
            // Favorites
            const { data: favs } = await supabase
               .from('favorites')
               .select('establishment_id')
               .eq('user_id', user.id);

            if (favs) {
               setFavorites(favs.map(f => f.establishment_id));
            }

            // Notifications
            const { data: notifs } = await supabase
               .from('notifications')
               .select('*')
               .eq('user_id', user.id)
               .order('created_at', { ascending: false });

            if (notifs) setNotifications(notifs);

            // Appointments
            const { data: appts } = await supabase
               .from('appointments')
               .select('*')
               .eq('user_id', user.id)
               .order('date', { ascending: true })
               .gte('date', new Date().toISOString().split('T')[0]); // Only future/today

            if (appts) setAppointments(appts);

            // Fetch Last Appointment for Rebooking Logic
            const { data: lastAppt } = await supabase
               .from('appointments')
               .select('establishment_id, service_name, date')
               .eq('user_id', user.id)
               .order('created_at', { ascending: false })
               .limit(1)
               .single();

            if (lastAppt && mappedEstablishments.length > 0) {
               // Find the salon details for this appointment
               const salon = mappedEstablishments.find(e => e.id === lastAppt.establishment_id);
               if (salon) {
                  setLastVisit({ ...lastAppt, salon });
               }
            }
         }
      } catch (e) {
         console.error('Error fetching data:', e);
      } finally {
         setLoading(false);
      }
   };

   const handleSearch = (term: string) => {
      setSearchTerm(term);
      if (term.length > 0 && establishments) {
         const lowerTerm = term.toLowerCase();
         const filtered = establishments.filter(est => {
            const name = est.name ? String(est.name).toLowerCase() : '';
            const type = est.type ? String(est.type).toLowerCase() : '';
            return name.includes(lowerTerm) || type.includes(lowerTerm);
         });
         setSearchResults(filtered);
      } else {
         setSearchResults([]);
      }
   };

   const toggleFavorite = async (id: string) => {
      if (!user) return alert('Faça login para favoritar');

      // Optimistic Update
      const isFav = favorites.includes(id);
      const newFavs = isFav ? favorites.filter(fid => fid !== id) : [...favorites, id];
      setFavorites(newFavs);

      // Persist
      if (isFav) {
         await supabase.from('favorites').delete().match({ user_id: user.id, establishment_id: id });
      } else {
         await supabase.from('favorites').insert({ user_id: user.id, establishment_id: id });
      }
   };

   const clearSearch = () => {
      setSearchTerm('');
      setSearchResults([]);
   };

   const markAsRead = async () => {
      if (!user) return;
      const unread = notifications.filter(n => !n.read);
      if (unread.length > 0) {
         await supabase.from('notifications').update({ read: true }).in('id', unread.map(n => n.id));
         setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
   };

   const toggleNotifications = () => {
      if (!showNotifications) {
         markAsRead();
      }
      setShowNotifications(!showNotifications);
   };

   const favoriteItems = establishments.filter(est => favorites.map(String).includes(String(est.id)));
   const unreadCount = notifications.filter(n => !n.read).length;

   return (
      <div className="min-h-screen bg-background-light text-slate-900 flex flex-col pb-32 view-transition relative">
         <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md p-6 pt-12 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-full border-2 border-primary-brand bg-cover bg-center shadow-sm" style={{ backgroundImage: `url("${user?.user_metadata?.avatar_url || 'https://picsum.photos/seed/user/100'}")` }}></div>
               <div><p className="text-sm text-slate-400 font-medium">Bom dia,</p><h2 className="text-xl font-bold text-slate-900">{user?.user_metadata?.name || 'Visitante'}</h2></div>
            </div>
            <button
               onClick={toggleNotifications}
               className="size-11 bg-slate-50 rounded-full flex items-center justify-center relative border border-slate-100 hover:bg-slate-100 transition-colors"
            >
               <span className="material-symbols-outlined text-slate-600">notifications</span>
               {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 size-2.5 bg-primary-brand rounded-full ring-2 ring-white animate-pulse" />
               )}
            </button>
         </header>

         {/* Notifications Panel */}
         {showNotifications && (
            <>
               <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifications(false)} />
               <div className="absolute top-24 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                     <h3 className="font-bold text-slate-900">Notificações</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                     {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                           <span className="material-symbols-outlined text-3xl mb-2 opacity-50">notifications_off</span>
                           <p>Nenhuma notificação</p>
                        </div>
                     ) : (
                        notifications.map(notif => (
                           <div key={notif.id} className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                              <div className="flex gap-3">
                                 <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <span className="material-symbols-outlined text-sm">{notif.type === 'success' ? 'check_circle' : 'info'}</span>
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-900">{notif.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </>
         )}

         <main className="flex-1 p-6 overflow-y-auto">
            {/* Busca */}
            <form className="w-full relative group mb-8" onSubmit={e => { e.preventDefault(); }}>
               <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors">search</span>
               <input
                  type="text"
                  placeholder="Buscar novo lugar..."
                  className="w-full bg-white py-4 pl-14 pr-6 rounded-[2rem] shadow-sm border border-slate-100 text-base font-medium focus:ring-4 focus:ring-primary-brand/10 transition-all"
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
               />
            </form>

            {!searchTerm ? (
               <div className="space-y-8 animate-fade-in">
                  {/* Seção 1: Meus Agendamentos (Prioridade) */}
                  <section>
                     <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="font-bold text-lg text-slate-900">Meus Agendamentos</h3>
                        <span onClick={() => onNavigate('history')} className="text-xs font-bold text-primary-brand cursor-pointer">Ver todos</span>
                     </div>

                     {appointments.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
                           {appointments.map(appt => (
                              <div key={appt.id} className="min-w-[280px] bg-white p-5 rounded-[2rem] border border-slate-100 shadow-card relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="material-symbols-outlined text-6xl text-primary-brand">calendar_clock</span>
                                 </div>
                                 <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div>
                                       <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full mb-2">Confirmado</span>
                                       <h4 className="font-black text-slate-900 text-lg">{appt.service_name}</h4>
                                       <p className="text-xs text-slate-500 font-medium">{appt.professional_name || 'Profissional'}</p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-3 relative z-10">
                                    <div className="flex-1 bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
                                       <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                          <p className="text-center font-black text-slate-900 leading-none">{appt.date.split('-')[2]}</p>
                                          <p className="text-center text-[10px] font-bold text-slate-400 uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</p>
                                       </div>
                                       <div>
                                          <p className="font-bold text-slate-900 text-sm">{appt.time}</p>
                                          <p className="text-[10px] text-slate-400 font-bold">Terça-feira</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
                           <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">event_busy</span>
                           <p className="text-slate-500 font-medium text-sm">Nenhum agendamento futuro.</p>
                        </div>
                     )}
                  </section>

                  {/* Seção 2: Lembretes Inteligentes (Smart Rebooking) - Sugestão Útil */}
                  <section>
                     <h3 className="font-bold text-lg text-slate-900 mb-4 px-1">Lembretes & Fidelidade</h3>
                     <div className="grid grid-cols-2 gap-3">
                        {/* Card de Reagendamento */}
                        <div
                           onClick={() => {
                              if (lastVisit?.salon) {
                                 if (onSelectSalon) onSelectSalon(lastVisit.salon);
                                 onNavigate('booking');
                              } else {
                                 const element = document.querySelector('input[type="text"]') as HTMLInputElement;
                                 if (element) element.focus();
                              }
                           }}
                           className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-[2rem] text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden group cursor-pointer"
                        >
                           <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                              <span className="material-symbols-outlined text-5xl">update</span>
                           </div>
                           <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider mb-1">
                              {lastVisit ? lastVisit.service_name : 'Novo Agendamento'}
                           </p>
                           <h4 className="font-black text-xl mb-4 leading-tight">
                              {lastVisit ? 'Agendar Novamente!' : 'Encontre um lugar'}
                           </h4>
                           <button className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white/30 transition-colors">
                              {lastVisit ? 'Reagendar' : 'Buscar'} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                           </button>
                        </div>

                        {/* Card de Fidelidade */}
                        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-card relative overflow-hidden">
                           <div className="flex items-center justify-between mb-2">
                              <span className="material-symbols-outlined text-amber-500">local_activity</span>
                              <span className="font-black text-2xl text-slate-900">350</span>
                           </div>
                           <p className="text-slate-400 text-xs font-medium">Pontos acumulados</p>
                           <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                              <div className="bg-amber-500 h-full w-[70%] rounded-full"></div>
                           </div>
                           <p className="text-[10px] text-slate-400 mt-2 font-bold text-right">Faltam 150 p/ prêmio</p>
                        </div>
                     </div>
                  </section>

                  {/* Seção 3: Meus Favoritos (Substitui Sugestões) */}
                  <section>
                     <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="font-bold text-lg text-slate-900">Meus Favoritos</h3>
                        <button onClick={fetchData} className="text-xs font-bold text-primary-brand flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px]">refresh</span> Atualizar
                        </button>
                     </div>
                     {favoriteItems.length > 0 ? (
                        <div className="space-y-3">
                           {favoriteItems.map((fav) => (
                              <div key={fav.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex gap-4 items-center cursor-pointer hover:border-primary-brand/30 transition-colors" onClick={() => {
                                 if (onSelectSalon) onSelectSalon(fav);
                                 onNavigate('booking');
                              }}>
                                 <div className="size-16 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url("${fav.image}")` }}></div>
                                 <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 text-base">{fav.name}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{fav.type}</p>
                                 </div>
                                 <button className="size-10 rounded-full bg-rose-50 text-primary-brand flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
                                 </button>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-10">
                           <p className="text-slate-400 text-sm mb-4">Você ainda não tem favoritos.</p>
                           <p className="text-xs text-slate-300 max-w-[200px] mx-auto">Use a busca para encontrar e favoritar seus lugares preferidos.</p>
                        </div>
                     )}
                  </section>
               </div>
            ) : (
               /* Resultados da Busca */
               <div className="space-y-4 animate-fade-in pb-10">
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="font-bold text-lg text-slate-900">Resultados para "{searchTerm}"</h3>
                     <button onClick={clearSearch} className="text-xs font-bold text-primary-brand">Limpar</button>
                  </div>
                  {searchResults.length === 0 ? (
                     <p className="text-center text-slate-400 py-10">Nenhum resultado encontrado.</p>
                  ) : (
                     searchResults.map(est => (
                        <div key={est.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex gap-4 items-center group cursor-pointer" onClick={() => {
                           if (onSelectSalon) onSelectSalon(est);
                           onNavigate('booking');
                        }}>
                           <div className="size-20 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url("${est.image}")` }}></div>
                           <div className="flex-1">
                              <h4 className="font-bold text-slate-900 text-base">{est.name}</h4>
                              <p className="text-xs text-slate-400 mb-2 font-medium">{est.type}</p>
                              <div className="flex items-center gap-1">
                                 <span className="material-symbols-outlined text-amber-500 text-[14px] material-symbols-filled">star</span>
                                 <span className="text-xs font-bold text-slate-900">{est.rating}</span>
                              </div>
                           </div>
                           <button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(est.id); }}
                              className={`size-12 rounded-full flex items-center justify-center transition-all ${favorites.includes(est.id) ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/30' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                           >
                              <span className={`material-symbols-outlined ${favorites.includes(est.id) ? 'material-symbols-filled' : ''}`}>check</span>
                           </button>
                        </div>
                     ))
                  )}
               </div>
            )}
         </main>
      </div>
   );
};

export default CustomerPortal;