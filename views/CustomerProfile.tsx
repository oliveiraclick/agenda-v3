
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../lib/upload';

interface CustomerProfileProps {
   onBack: () => void;
   onLogout: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ onBack, onLogout }) => {
   const [profile, setProfile] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [editing, setEditing] = useState(false);

   // Estados de Edição
   const [name, setName] = useState('');
   const [phone, setPhone] = useState('');

   useEffect(() => {
      fetchProfile();
   }, []);

   const fetchProfile = async () => {
      setLoading(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            const { data, error } = await supabase
               .from('profiles')
               .select('*')
               .eq('id', user.id)
               .maybeSingle();

            if (data) {
               setProfile(data);
               setName(data.name || '');
               setPhone(data.phone || data.telefone || ''); // Dual check
            }
         }
      } catch (error) {
         console.error("Erro ao carregar perfil:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
         setLoading(true);
         try {
            const { publicUrl, error } = await uploadFile(file, 'avatars');
            if (error) throw error;

            if (publicUrl) {
               const { data: { user } } = await supabase.auth.getUser();

               const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ avatar_url: publicUrl })
                  .eq('id', user?.id);

               if (updateError) throw updateError;

               setProfile({ ...profile, avatar_url: publicUrl });
               alert("Foto atualizada com sucesso!");
            }
         } catch (err: any) {
            alert("Erro ao atualizar foto: " + err.message);
         } finally {
            setLoading(false);
         }
      }
   };

   const handleSave = async () => {
      setLoading(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         const { error } = await supabase
            .from('profiles')
            .update({
               name,
               phone: phone,
               telefone: phone // Dual write
            })
            .eq('id', user?.id);

         if (error) throw error;

         setProfile({ ...profile, name, phone });
         setEditing(false);
         alert("Perfil atualizado!");
      } catch (err: any) {
         alert("Erro ao salvar: " + err.message);
      } finally {
         setLoading(false);
      }
   };

   const handleLogout = async () => {
      await supabase.auth.signOut();
      onLogout();
   };

   if (loading && !profile) return <div className="p-10 text-center font-bold">Carregando...</div>;

   return (
      <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
         <header className="p-6 bg-white flex items-center justify-between border-b">
            <button onClick={onBack} className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
               <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="font-black text-lg tracking-tighter">Meu Perfil</h2>
            <button
               onClick={() => editing ? handleSave() : setEditing(true)}
               className="text-primary-brand font-bold text-sm"
            >
               {editing ? 'Salvar' : 'Editar'}
            </button>
         </header>

         <main className="p-6 space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
               <label className="relative cursor-pointer group">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <div className="size-32 rounded-[3rem] bg-slate-200 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative group-hover:ring-4 group-hover:ring-primary-brand/20 transition-all">
                     {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                     ) : (
                        <span className="material-symbols-outlined text-5xl text-slate-400">person</span>
                     )}

                     {/* Overlay de Edição */}
                     <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                     </div>
                  </div>
               </label>
               <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Toque para alterar</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Completo</label>
                  <input
                     disabled={!editing}
                     value={name}
                     onChange={e => setName(e.target.value)}
                     className={`w-full p-4 rounded-2xl border-none font-bold ${editing ? 'bg-white ring-2 ring-primary-brand shadow-md' : 'bg-slate-100 text-slate-500'}`}
                  />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Telemóvel</label>
                  <input
                     disabled={!editing}
                     value={phone}
                     onChange={e => setPhone(e.target.value)}
                     className={`w-full p-4 rounded-2xl border-none font-bold ${editing ? 'bg-white ring-2 ring-primary-brand shadow-md' : 'bg-slate-100 text-slate-500'}`}
                  />
               </div>
            </div>

            {/* Logout Button */}
            <div className="pt-10">
               <button
                  onClick={handleLogout}
                  className="w-full py-5 rounded-2xl bg-red-50 text-red-500 font-black flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
               >
                  <span className="material-symbols-outlined">logout</span>
                  Sair da Conta
               </button>
               <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">Versão 1.0.7 - App Agenda</p>
            </div>
         </main>
      </div>
   );
};

export default CustomerProfile;
