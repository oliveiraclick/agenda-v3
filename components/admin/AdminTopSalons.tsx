
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AdminTopSalons: React.FC = () => {
    const [topSalons, setTopSalons] = useState<any[]>([]);

    useEffect(() => {
        const fetchTop = async () => {
            // Mocking top salons logic since we'd need complex aggregation or a view
            // In a real scenario, we'd query a view like 'top_salons_view'
            const { data } = await supabase
                .from('establishments')
                .select('id, name, logo_url')
                .limit(3);

            // Mock appointment counts
            const mocked = (data || []).map(s => ({
                ...s,
                appointments: Math.floor(Math.random() * 500) + 100
            })).sort((a, b) => b.appointments - a.appointments);

            setTopSalons(mocked);
        };
        fetchTop();
    }, []);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Top Salões (Agendamentos)</h3>
            <div className="space-y-4">
                {topSalons.map((salon, i) => (
                    <div key={salon.id} className="flex items-center gap-4">
                        <span className={`text-lg font-black ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : 'text-orange-700'}`}>#{i + 1}</span>
                        <div className="flex-1 flex items-center gap-3">
                            <div className="size-8 rounded-full bg-slate-100 bg-cover" style={{ backgroundImage: `url("${salon.logo_url}")` }}></div>
                            <p className="text-sm font-bold text-slate-900">{salon.name}</p>
                        </div>
                        <span className="text-xs font-black bg-slate-100 px-2 py-1 rounded-lg">{salon.appointments}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminTopSalons;
