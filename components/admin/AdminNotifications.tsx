
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const AdminNotifications: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [audience, setAudience] = useState('all');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!title || !message) return;
        setSending(true);

        const { error } = await supabase.from('system_notifications').insert({
            title,
            message,
            target_audience: audience
        });

        if (error) {
            alert('Erro ao enviar notificação');
        } else {
            alert('Notificação enviada com sucesso!');
            setTitle('');
            setMessage('');
        }
        setSending(false);
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-lg text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">campaign</span>
                Enviar Notificação Global
            </h3>

            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Título da Notificação"
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-brand"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Mensagem..."
                    rows={3}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-brand resize-none"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />

                <div className="flex items-center gap-2">
                    <select
                        className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        value={audience}
                        onChange={e => setAudience(e.target.value)}
                    >
                        <option value="all" className="text-slate-900">Todos</option>
                        <option value="owners" className="text-slate-900">Donos de Salão</option>
                        <option value="customers" className="text-slate-900">Clientes</option>
                    </select>
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="flex-1 bg-primary-brand hover:bg-primary-brand/90 text-white py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        {sending ? 'Enviando...' : 'Enviar Agora'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
