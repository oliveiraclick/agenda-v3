
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../lib/upload';
import { formatCurrency, parseCurrency } from '../lib/currency';

interface OwnerInventoryProps {
  onBack: () => void;
}

const OwnerInventory: React.FC<OwnerInventoryProps> = ({ onBack }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', price: 0, cost: 0, stock: 0, image: '' });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const [establishmentId, setEstablishmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchEstablishmentAndProducts();
  }, []);

  const fetchEstablishmentAndProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Establishment ID
      const { data: est, error: estError } = await supabase
        .from('establishments')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (estError) {
        console.error('Error fetching establishment:', estError);
      }

      if (est) {
        setEstablishmentId(est.id);
        // 2. Fetch Products for this Establishment
        const { data } = await supabase.from('products').select('*').eq('establishment_id', est.id);
        if (data) setProducts(data);
      } else {
        console.log('Nenhum estabelecimento encontrado para este usuário.');
      }
    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) return alert('Preencha nome e preço');
    if (!establishmentId) return alert('Estabelecimento não encontrado.');

    let error;

    if (editingProduct) {
      // Update existing
      const { error: updateError } = await supabase.from('products').update({
        name: newProduct.name,
        description: newProduct.brand,
        price: newProduct.price,
        image: newProduct.image
      }).eq('id', editingProduct.id);
      error = updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabase.from('products').insert([
        {
          name: newProduct.name,
          description: newProduct.brand,
          price: newProduct.price,
          image: newProduct.image || 'https://via.placeholder.com/150',
          establishment_id: establishmentId // Link to current salon
        }
      ]);
      error = insertError;
    }

    if (error) {
      alert('Erro ao salvar produto');
    } else {
      setShowModal(false);
      setNewProduct({ name: '', brand: '', price: 0, cost: 0, stock: 0, image: '' });
      setEditingProduct(null);
      fetchEstablishmentAndProducts();
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      brand: product.description || '',
      price: product.price,
      cost: product.cost || 0,
      stock: product.stock || 0,
      image: product.image || ''
    });
    setShowModal(true);
  };

  const handleNewClick = () => {
    setEditingProduct(null);
    setNewProduct({ name: '', brand: '', price: 0, cost: 0, stock: 0, image: '' });
    setShowModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const { publicUrl: url } = await uploadFile(file, 'products');
      if (url) setNewProduct({ ...newProduct, image: url });
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto relative view-transition">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="material-symbols-outlined text-slate-500">arrow_back</button>
            <h1 className="text-xl font-bold">Estoque</h1>
          </div>
          <button onClick={handleNewClick} className="size-10 bg-primary-brand text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"><span className="material-symbols-outlined">add</span></button>
        </div>
        <div className="flex w-full items-center rounded-xl bg-slate-50 border border-slate-200 h-12 px-4 focus-within:ring-1 focus-within:ring-primary-brand transition-all">
          <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none" placeholder="Buscar produto..." />
        </div>
      </header>

      <main className="p-4 space-y-4 pb-24 overflow-y-auto">
        {loading ? <p className="text-center text-slate-400">Carregando estoque...</p> : products.map((p) => (
          <article key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
            <div className="flex gap-4">
              <div className="size-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">inventory_2</span>}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm leading-tight text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500">{p.description}</p>
                <div className="flex items-center gap-2 mt-2 justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600">
                    Em estoque
                  </span>
                  <button onClick={() => handleEditClick(p)} className="text-primary-brand hover:text-rose-700 bg-rose-50 p-2 rounded-full transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase">Preço</p>
                <p className="font-bold text-sm text-primary-brand">R$ {p.price.toFixed(2)}</p>
              </div>
            </div>
          </article>
        ))}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-lg font-bold mb-4">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <label className="relative cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <div className="size-20 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-primary-brand transition-colors overflow-hidden">
                    {newProduct.image ? <img src={newProduct.image} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">add_photo_alternate</span>}
                  </div>
                  {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><span className="text-xs font-bold">...</span></div>}
                </label>
              </div>
              <input
                placeholder="Nome do Produto"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-primary-brand"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <input
                placeholder="Marca / Descrição"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-primary-brand"
                value={newProduct.brand}
                onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
              />
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                <span className="text-sm text-slate-500">Preço (R$)</span>
                <input
                  type="text"
                  className="flex-1 bg-transparent text-right font-bold border-none outline-none ring-0 focus:ring-0 placeholder:text-slate-300"
                  placeholder="0,00"
                  value={formatCurrency(newProduct.price.toFixed(2).replace('.', ''))}
                  onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                  onClick={(e) => {
                    const len = e.currentTarget.value.length;
                    e.currentTarget.setSelectionRange(len, len);
                  }}
                  onChange={e => {
                    const val = parseCurrency(e.target.value);
                    setNewProduct({ ...newProduct, price: val });
                  }}
                />
              </div>
              <button onClick={handleSaveProduct} className="w-full bg-primary-brand text-white font-bold py-4 rounded-2xl shadow-red-glow active:scale-95 transition-all">
                {editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerInventory;
