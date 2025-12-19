import React, { useState, useEffect } from 'react';
import { CustomerView } from '../types';
import { supabase } from '../lib/supabase';

interface CustomerPortalProps {
   onNavigate: (view: CustomerView) => void;
}

const MOCK_ESTABLISHMENTS = [
   { id: 1, name: 'Studio Beauty Elite', type: 'Cabelo • Hidratação', rating: 4.9, image: 'https://picsum.photos/seed/shop1/400/200', category: 'salao' },
   { id: 2, name: 'Don Barbearia', type: 'Corte • Barba', rating: 4.8, image: 'https://picsum.photos/seed/barber/400/200', category: 'salao' },
   { id: 3, name: 'Pet Shop Amigo Fiel', type: 'Banho • Tosa', rating: 5.0, image: 'https://picsum.photos/seed/pet1/400/200', category: 'pet' },
   { id: 4, name: 'Lava Rápido Jet', type: 'Lavagem • Polimento', rating: 4.7, image: 'https://picsum.photos/seed/car/400/200', category: 'li' },
   { id: 5, name: 'Cantinho do Pet', type: 'Veterinário • Banho', rating: 4.9, image: 'https://picsum.photos/seed/pet2/400/200', category: 'pet' }
];

const CustomerPortal: React.FC<CustomerPortalProps> = ({ onNavigate }) => {
   const [favorites, setFavorites] = useState<(string | number)[]>([]);
   const [establishments, setEstablishments] = useState<any[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [searchResults, setSearchResults] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [user, setUser] = useState<any>(null);

   // Initialize Data
   useEffect(() => {
      fetchData();
   }, []);

   const fetchData = async () => {
      setLoading(true);
      try {
         // 1. Get User
         const { data: { user } } = await supabase.auth.getUser();
         setUser(user);

         // 2. Get Establishments
         const { data: dbEstablishments, error } = await supabase
            .from('establishments')
            .select('*');

         if (error || !dbEstablishments || dbEstablishments.length === 0) {
            // Fallback to Mock
            console.log('Using Mock Data (DB empty or error)');
            setEstablishments(MOCK_ESTABLISHMENTS);

            // Load local favorites for mock
            const saved = localStorage.getItem('customer_favorites');
            if (saved) setFavorites(JSON.parse(saved));

         } else {
            // Map DB columns to UI props
            const mapped = dbEstablishments.map(item => ({
               ...item,
               image: item.image_url || item.image // Handle different column names
            }));
            setEstablishments(mapped);

            // 3. Get Favorites from DB if user exists
            if (user) {
               const { data: favs } = await supabase
                  .from('favorites')
                  .select('establishment_id')
                  .eq('user_id', user.id);

               if (favs) {
                  setFavorites(favs.map(f => f.establishment_id));
               }
            }
         }
      } catch (e) {
         console.error(e);
         setEstablishments(MOCK_ESTABLISHMENTS);
      } finally {
         setLoading(false);
      }
   };

   const handleSearch = (term: string) => {
      setSearchTerm(term);
      if (term.length > 2) {
         const filtered = establishments.filter(est =>
            est.name.toLowerCase().includes(term.toLowerCase()) ||
            est.type.toLowerCase().includes(term.toLowerCase()) ||
            est.category.toLowerCase().includes(term.toLowerCase())
         );
         setSearchResults(filtered);
      } else {
         setSearchResults([]);
      }
   };

   const toggleFavorite = async (id: string | number) => {
      // Optimistic Update
      const isFav = favorites.includes(id);
      let newFavs;
      if (isFav) {
         newFavs = favorites.filter(fid => fid !== id);
      } else {
         newFavs = [...favorites, id];
      }
      setFavorites(newFavs);

      // Persist
      if (user && typeof id === 'string') { // DB UUIDs are strings
         if (isFav) {
            await supabase.from('favorites').delete().match({ user_id: user.id, establishment_id: id });
         } else {
            await supabase.from('favorites').insert({ user_id: user.id, establishment_id: id });
         }
      } else {
         // Local Storage Fallback (Mock IDs are numbers)
         localStorage.setItem('customer_favorites', JSON.stringify(newFavs));
      }
   };

   const clearSearch = () => {
      setSearchTerm('');
      setSearchResults([]);
   };

   const hasFavorites = favorites.length > 0;
   const favoriteItems = establishments.filter(est => favorites.includes(est.id));

   return (
      <div className="min-h-screen bg-background-light text-slate-900 flex flex-col pb-32 view-transition">
         <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md p-6 pt-12 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-full border-2 border-primary-brand bg-cover bg-center shadow-sm" style={{ backgroundImage: 'url("https://picsum.photos/seed/user/100")' }}></div>
               <div><p className="text-sm text-slate-400 font-medium">Bom dia,</p><h2 className="text-xl font-bold text-slate-900">{user?.user_metadata?.name || 'Visitante'}</h2></div>
            </div>
            <button className="size-11 bg-slate-50 rounded-full flex items-center justify-center relative border border-slate-100">
               <span className="material-symbols-outlined text-slate-600">notifications</span>
               <span className="absolute top-2.5 right-2.5 size-2.5 bg-primary-brand rounded-full ring-2 ring-white" />
            </button>
         </header>

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

                  <div className="flex flex-wrap justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                     <button onClick={() => handleSearch('Salao')} className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors text-slate-600">Salão</button>
                     <button onClick={() => handleSearch('Pet')} className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors text-slate-600">Pet Shop</button>
                     <button onClick={() => handleSearch('Lava')} className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors text-slate-600">Lava Rápido</button>
                  </div>
               </div>
            )}

            {/* Resultados da Busca - Com botão de Favoritar */}
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
                        <div key={est.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex gap-4 items-center group">
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
                              onClick={() => toggleFavorite(est.id)}
                              className={`size-12 rounded-full flex items-center justify-center transition-all ${favorites.includes(est.id) ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/30' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                           >
                              <span className={`material-symbols-outlined ${favorites.includes(est.id) ? 'material-symbols-filled' : ''}`}>favorite</span>
                           </button>
                        </div>
                     ))
                  )}
               </div>
            )}

            {/* Home com Favoritos - Só aparece se tiver favoritos e não estiver buscando */}
            {hasFavorites && !searchTerm && (
               <div className="space-y-8 animate-fade-in">

                  {/* Favoritos */}
                  <section>
                     <div className="flex justify-between items-center mb-5 px-1">
                        <h3 className="font-bold text-lg text-slate-900">Seus Favoritos</h3>
                        <span className="text-sm text-primary-brand font-bold cursor-pointer hover:underline">Ver todos</span>
                     </div>
                     <div className="space-y-4">
                        {favoriteItems.map((fav) => (
                           <div key={fav.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex gap-4 items-center">
                              <div className="size-20 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url("${fav.image}")` }}></div>
                              <div className="flex-1">
                                 <h4 className="font-bold text-slate-900 text-base">{fav.name}</h4>
                                 <p className="text-xs text-slate-400 mb-2 font-medium">{fav.type}</p>
                                 <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-amber-500 text-[14px] material-symbols-filled">star</span>
                                    <span className="text-xs font-bold text-slate-900">{fav.rating}</span>
                                 </div>
                              </div>
                              <button onClick={() => onNavigate('booking')} className="size-12 rounded-full bg-rose-50 text-primary-brand flex items-center justify-center hover:bg-primary-brand hover:text-white transition-all">
                                 <span className="material-symbols-outlined">calendar_add_on</span>
                              </button>
                           </div>
                        ))}
                     </div>
                  </section>

                  {/* Card Fidelidade - Aparece como exemplo para quem tem favoritos (simulando uso) */}
                  <section onClick={() => onNavigate('loyalty')} className="cursor-pointer">
                     <div className="relative overflow-hidden rounded-[2.5rem] bg-primary-brand p-7 shadow-red-glow transition-transform active:scale-95">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                           <div className="flex items-center gap-4">
                              <div className="size-12 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
                                 <span className="material-symbols-outlined text-2xl">stars</span>
                              </div>
                              <div>
                                 <p className="font-extrabold text-lg text-white">Fidelidade</p>
                                 <p className="text-[11px] text-white/70 uppercase font-bold tracking-widest">Don Barbearia</p>
                              </div>
                           </div>
                           <span className="text-3xl font-black text-white">08/10</span>
                        </div>
                        <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/10 relative z-10">
                           <div className="h-full bg-white rounded-full shadow-[0_0_10px_white]" style={{ width: '80%' }} />
                        </div>
                     </div>
                  </section>
               </div>
            )}
         </main>
      </div>
   );
};

export default CustomerPortal;