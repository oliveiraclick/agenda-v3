
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Feedback } from '../../types';

const AdminFeedback: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        const { data } = await supabase
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        setFeedbacks(data || []);
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900">Feedback & Suporte</h3>
                <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">{feedbacks.length} novos</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {feedbacks.map((fb) => (
                    <div key={fb.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${fb.type === 'bug' ? 'bg-red-100 text-red-600' :
                                    fb.type === 'feature' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                }`}>{fb.type}</span>
                            <span className="text-[10px] text-slate-400">{new Date(fb.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium line-clamp-2">{fb.message}</p>
                    </div>
                ))}
                {feedbacks.length === 0 && <div className="text-center py-4 text-slate-400 text-xs">Caixa de entrada vazia.</div>}
            </div>
        </div>
    );
};

export default AdminFeedback;
