
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AdminActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        const fetchActivity = async () => {
            // Fetch recent salons as "activity"
            const { data } = await supabase
                .from('establishments')
                .select('name, created_at, logo_url')
                .order('created_at', { ascending: false })
                .limit(5);

            setActivities(data || []);
        };
        fetchActivity();
    }, []);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Atividade Recente</h3>
            <div className="space-y-4">
                {activities.map((act, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                            {act.logo_url ? <img src={act.logo_url} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">storefront</span>}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">Novo salão: <span className="text-primary-brand">{act.name}</span></p>
                            <p className="text-xs text-slate-400">{new Date(act.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                ))}
                {activities.length === 0 && <p className="text-xs text-slate-400">Nenhuma atividade recente.</p>}
            </div>
        </div>
    );
};

export default AdminActivityFeed;
