import React, { useState, useEffect } from 'react';
import { CustomerView } from '../types';
import { supabase } from '../lib/supabase';

interface CustomerPortalProps {
   onNavigate: (view: CustomerView) => void;
   onSelectSalon?: (salon: any) => void; // New prop for selecting salon
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ onNavigate, onSelectSalon }) => {
   const [favorites, setFavorites] = useState<(string | number)[]>([]);
   const [establishments, setEstablishments] = useState<any[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [searchResults, setSearchResults] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [user, setUser] = useState<any>(null);

   // Notifications
   const [notifications, setNotifications] = useState<any[]>([]);
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
               .single();

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

         if (dbEstablishments && dbEstablishments.length > 0) {
            // Map DB columns to UI props
            const mapped = dbEstablishments.map(item => ({
               ...item,
               image: item.image_url || 'https://picsum.photos/seed/shop/400/200', // Fallback image
               rating: item.rating || 5.0,
               type: item.category || 'Serviços'
            }));
            setEstablishments(mapped);
         } else {
            setEstablishments([]);
         }

         // 3. Get Favorites & Notifications from DB if user exists
         if (user) {
            const { data: favs } = await supabase
               .from('favorites')
               .select('establishment_id')
               .eq('user_id', user.id);

            if (favs) {
               setFavorites(favs.map(f => f.establishment_id));
            }

            const { data: notifs } = await supabase
               .from('notifications')
               .select('*')
               .eq('user_id', user.id)
               .order('created_at', { ascending: false });

            if (notifs) setNotifications(notifs);
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

   const hasFavorites = favorites.length > 0;
   const favoriteItems = establishments.filter(est => favorites.includes(est.id));
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

            {/* Barra de Busca Sempre Visível (se tiver favoritos ou na home vazia) */}
            {!searchResults.length && (
               <form className="w-full relative group mb-8" onSubmit={e => { e.preventDefault(); }}>
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary-brand transition-colors">search</span>
                  <input
                     type="text"
                     placeholder="Buscar salão, pet shop..."
                     className="w-full bg-white py-5 pl-14 pr-6 rounded-[2rem] shadow-card border border-slate-100 text-lg font-medium focus:ring-4 focus:ring-primary-brand/10 transition-all"
                     value={searchTerm}
                     onChange={e => handleSearch(e.target.value)}
                  />
               </form>
            )}

            {/* Home Vazia - Estado Inicial */}
            {!hasFavorites && !searchTerm && (
               <div className="h-full flex flex-col items-center space-y-8 mt-10 animate-fade-in">
                  <div className="text-center space-y-2">
                     <span className="material-symbols-outlined text-6xl text-slate-200">storefront</span>
                     <h3 className="text-xl font-black text-slate-900">Encontre seu lugar</h3>
                     <p className="text-slate-400 max-w-[250px] mx-auto text-sm">Busque e favorite para ter acesso rápido.</p>
                  </div>

                  {/* Show all establishments if no favorites */}
                  <div className="w-full space-y-4">
                     <h3 className="font-bold text-lg text-slate-900 text-left px-1">Sugestões para você</h3>
                     {establishments.map(est => (
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
                              <span className={`material-symbols-outlined ${favorites.includes(est.id) ? 'material-symbols-filled' : ''}`}>favorite</span>
                           </button>
                        </div>
                     ))}
                     {establishments.length === 0 && <p className="text-center text-slate-400 text-sm">Nenhum estabelecimento encontrado.</p>}
                  </div>
               </div>
            )}

            {/* Resultados da Busca */}
            {searchTerm.length > 0 && (
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
                              <span className={`material-symbols-outlined ${favorites.includes(est.id) ? 'material-symbols-filled' : ''}`}>favorite</span>
                           </button>
                        </div>
                     ))
                  )}
               </div>
            )}

            {/* Home com Favoritos */}
            {hasFavorites && !searchTerm && (
               <div className="space-y-8 animate-fade-in">
                  <section>
                     <div className="flex justify-between items-center mb-5 px-1">
                        <h3 className="font-bold text-lg text-slate-900">Seus Favoritos</h3>
                        <span className="text-sm text-primary-brand font-bold cursor-pointer hover:underline">Ver todos</span>
                     </div>
                     <div className="space-y-4">
                        {favoriteItems.map((fav) => (
                           <div key={fav.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex gap-4 items-center cursor-pointer" onClick={() => {
                              if (onSelectSalon) onSelectSalon(fav); // Note: verify fav has all salon props
                              onNavigate('booking');
                           }}>
                              <div className="size-20 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url("${fav.image}")` }}></div>
                              <div className="flex-1">
                                 <h4 className="font-bold text-slate-900 text-base">{fav.name}</h4>
                                 <p className="text-xs text-slate-400 mb-2 font-medium">{fav.type}</p>
                                 <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-amber-500 text-[14px] material-symbols-filled">star</span>
                                    <span className="text-xs font-bold text-slate-900">{fav.rating}</span>
                                 </div>
                              </div>
                              <button className="size-12 rounded-full bg-rose-50 text-primary-brand flex items-center justify-center hover:bg-primary-brand hover:text-white transition-all">
                                 <span className="material-symbols-outlined">calendar_add_on</span>
                              </button>
                           </div>
                        ))}
                     </div>
                  </section>
               </div>
            )}
         </main>
      </div>
   );
};

export default CustomerPortal;