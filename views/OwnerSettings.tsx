
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../lib/upload';

interface OwnerSettingsProps {
  onBack: () => void;
}

const OwnerSettings: React.FC<OwnerSettingsProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState(''); // New State
  const [avatarUrl, setAvatarUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [establishment, setEstablishment] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setName(data.name || '');
        setAddress(data.address || '');
        setDescription(data.description || '');
        setAvatarUrl(data.avatar_url || '');
      }

      // Fetch establishment data
      const { data: est } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (est) {
        setEstablishment(est);
        setSlug(est.slug || '');
        setHistory(est.history || ''); // Fetch history
        // Prioritize establishment address, then profile address
        if (est.address_full) {
          setAddress(est.address_full);
        }
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const updates = {
      name,
      // address: address, // Removed: Address belongs to Establishment
      description,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);

    // Update or create establishment with slug
    if (slug && !slugError) {
      const estUpdates = {
        slug,
        description,
        history, // Save history
        logo_url: avatarUrl,
        address_full: address,
        owner_id: profile.id,
        name: name // Updated name
      };

      if (establishment) {
        await supabase.from('establishments').update(estUpdates).eq('id', establishment.id);
      } else {
        const { data: newEst } = await supabase.from('establishments').insert(estUpdates).select().single();
        setEstablishment(newEst);
      }
    }

    setSaving(false);
    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      alert('Configurações salvas com sucesso!');
      onBack();
    }
  };

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
  };

  const checkSlugUniqueness = async (newSlug: string) => {
    if (!newSlug) {
      setSlugError('');
      return;
    }

    // Validate format
    if (!/^[a-z0-9-]+$/.test(newSlug)) {
      setSlugError('Use apenas letras minúsculas, números e hífens.');
      return;
    }

    setSlugChecking(true);
    const { data } = await supabase
      .from('establishments')
      .select('id')
      .eq('slug', newSlug)
      .maybeSingle();

    setSlugChecking(false);

    if (data && data.id !== establishment?.id) {
      setSlugError('Este link já está em uso. Tente outro.');
    } else {
      setSlugError('');
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
    checkSlugUniqueness(newSlug);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado!');
  };

  const handleShareLink = async () => {
    const url = `${window.location.origin}/#/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Confira ${name}! Agende seu horário.`,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const { publicUrl } = await uploadFile(file, 'avatars');
      if (publicUrl) {
        setAvatarUrl(publicUrl);
      } else {
        alert('Erro ao fazer upload da imagem.');
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col max-w-md mx-auto view-transition">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md flex items-center p-4 justify-between border-b border-slate-100">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-200">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-lg font-bold">Configurações</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-primary-brand font-bold text-sm disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-6 overflow-y-auto pb-10">
        <section className="px-4 py-4 space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Dados do Negócio</h3>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium mb-1 block text-slate-500">Nome da Empresa / Profissional</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-12 rounded-xl bg-white border-slate-200 focus:ring-primary-brand text-base px-4"
                placeholder="Ex: Barbearia do João"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1 block text-slate-500">Endereço</span>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full h-12 rounded-xl bg-white border-slate-200 focus:ring-primary-brand text-base px-4 pr-12"
                  placeholder="Ex: Av. Paulista, 1000"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
              </div>
            </label>
          </div>
        </section>

        <section className="px-4 space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Personalização</h3>

          <label className="relative w-full h-40 rounded-2xl overflow-hidden group cursor-pointer border-2 border-dashed border-slate-200 hover:border-primary-brand transition-colors block">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            {avatarUrl ? (
              <img src={avatarUrl} className="w-full h-full object-contain bg-slate-50" />
            ) : (
              <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Sem imagem</span>
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 p-2 rounded-full mb-1"><span className="material-symbols-outlined text-white">add_a_photo</span></div>
              <span className="text-white text-xs font-bold drop-shadow-md">Alterar Capa/Logo</span>
            </div>
          </label>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Descrição</span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full h-32 rounded-xl bg-white border-slate-200 focus:ring-primary-brand text-sm p-4 resize-none"
              placeholder="Descreva seu negócio e especialidades..."
            />
          </div>
        </section>

        <section className="px-4 space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Nossa História</h3>
          <textarea
            value={history}
            onChange={e => setHistory(e.target.value)}
            className="w-full h-32 rounded-xl bg-white border-slate-200 focus:ring-primary-brand text-sm p-4 resize-none"
            placeholder="Conte a história do seu salão, anos de tradição, etc..."
          />
        </section>

        {/* Public Link Section */}
        <section className="px-4 space-y-4">
          <h3 className="font-bold text-lg text-slate-900">Meu Link Público</h3>
          <p className="text-sm text-slate-500">Crie um link personalizado para compartilhar com seus clientes.</p>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium mb-1 block text-slate-500">Seu Link Personalizado</span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    className={`w-full h-12 rounded-xl bg-white border-slate-200 focus:ring-primary-brand text-base px-4 ${slugError ? 'border-red-300' : ''
                      }`}
                    placeholder="salaododenys"
                  />
                  {slugChecking && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="size-5 border-2 border-slate-300 border-t-primary-brand rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {!slug && (
                  <button
                    type="button"
                    onClick={() => handleSlugChange(generateSlugFromName(name))}
                    className="px-4 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors whitespace-nowrap"
                  >
                    Gerar
                  </button>
                )}
              </div>
              {slugError && (
                <p className="text-xs text-red-500 font-medium mt-1">{slugError}</p>
              )}
            </label>

            {slug && !slugError && (
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-slate-400">link</span>
                  <p className="text-xs font-mono text-slate-600 flex-1 truncate">
                    {window.location.origin}/#/{slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 h-10 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                    Copiar Link
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="flex-1 h-10 bg-primary-brand hover:bg-primary-brand/90 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">share</span>
                    Compartilhar
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Logout Button */}
        <section className="px-4 pb-8">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Sair da Conta
          </button>
        </section>
      </main>
    </div>
  );
};

export default OwnerSettings;
