
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SalonDiscoveryProps {
  onSelectSalon: (salon: any) => void;
  onProfile: () => void;
}

const SalonDiscovery: React.FC<SalonDiscoveryProps> = ({ onSelectSalon, onProfile }) => {
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [selectedCategory, searchTerm, establishments]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch Establishments
      const { data, error } = await supabase
        .from('establishments')
        .select('*');

      if (error) throw error;

      if (data) {
        const mappedData = data.map(item => ({
          ...item,
          avatar_url: item.image_url || item.avatar_url || 'https://picsum.photos/seed/business/400/250',
          address: item.address || 'Localização não informada'
        }));
        setEstablishments(mappedData);
        setFilteredEstablishments(mappedData);
      }

      // 2. Fetch Favorites if user is logged in
      if (user) {
        const { data: favs } = await supabase
          .from('favorites')
          .select('establishment_id')
          .eq('user_id', user.id);

        if (favs) {
          setFavorites(favs.map(f => f.establishment_id));
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = establishments;

    // Filter by Category
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(est =>
        est.category && est.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(est =>
        (est.name && est.name.toLowerCase().includes(lowerTerm)) ||
        (est.category && est.category.toLowerCase().includes(lowerTerm))
      );
    }

    setFilteredEstablishments(filtered);
  };

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();

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

  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto view-transition">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <button className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100"><span className="material-symbols-outlined">menu</span></button>
          <h2 className="font-bold text-lg flex-1 text-center">Explorar Serviços</h2>
          <button onClick={onProfile} className="size-10 rounded-full border border-slate-100 overflow-hidden">
            <img src="https://picsum.photos/seed/customer/100" className="w-full h-full object-cover" />
          </button>
        </div>
        <div className="relative mb-2">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full h-12 pl-12 rounded-xl bg-slate-50 border-none focus:ring-1 focus:ring-primary-brand text-sm"
            placeholder="O que você procura hoje?"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {['Todos', 'Estética', 'Bem-estar', 'Cabelo', 'Pet', 'Saúde'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary-brand text-white shadow-red-glow' : 'bg-white text-slate-400 border border-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-6 pb-24">
        <h3 className="font-bold text-lg px-1 text-slate-900">Salões em Destaque</h3>

        {loading ? (
          <div className="text-center py-10 text-slate-400">Carregando...</div>
        ) : filteredEstablishments.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">storefront_off</span>
            <p>Nenhum salão encontrado.</p>
          </div>
        ) : (
          filteredEstablishments.map((shop) => (
            <article key={shop.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-card group relative">
              <div onClick={() => onSelectSalon(shop)} className="w-full h-40 rounded-xl overflow-hidden relative mb-3 cursor-pointer">
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 z-10">
                  <span className="material-symbols-outlined text-amber-500 text-sm material-symbols-filled">star</span>
                  <span className="text-[10px] font-bold text-slate-900">5.0</span>
                </div>
                <img src={shop.avatar_url || 'https://picsum.photos/seed/business/400/250'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />

                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(shop.id, e)}
                  className="absolute top-2 left-2 size-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 active:scale-95 transition-transform"
                >
                  <span className={`material-symbols-outlined text-[18px] ${favorites.includes(shop.id) ? 'text-red-500 material-symbols-filled' : 'text-slate-400'}`}>favorite</span>
                </button>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-base text-slate-900">{shop.name || 'Sem Nome'}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {shop.address || 'Localização não informada'}</p>
                </div>
                <button onClick={() => onSelectSalon(shop)} className="bg-primary-brand text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-red-glow active:scale-95 transition-all">Agendar</button>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
};

export default SalonDiscovery;
