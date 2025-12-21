
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PlatformPayment } from '../../types';

const AdminRevenue: React.FC = () => {
    const [payments, setPayments] = useState<PlatformPayment[]>([]);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        const { data } = await supabase
            .from('platform_payments')
            .select('*')
            .order('payment_date', { ascending: false })
            .limit(5);
        setPayments(data || []);
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full">
            <h3 className="font-bold text-slate-900 mb-4">Histórico de Receita</h3>
            <div className="space-y-3">
                {payments.map((pay) => (
                    <div key={pay.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <span className="material-symbols-outlined text-sm">attach_money</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Assinatura {pay.plan_type}</p>
                                <p className="text-xs text-slate-400">{new Date(pay.payment_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <span className="font-black text-slate-900">R$ {pay.amount}</span>
                    </div>
                ))}
                {payments.length === 0 && <p className="text-center text-xs text-slate-400 py-4">Sem pagamentos recentes.</p>}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-primary-brand transition-colors">
                Ver Relatório Completo
            </button>
        </div>
    );
};

export default AdminRevenue;
