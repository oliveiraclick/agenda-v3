
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AnalyticsCharts: React.FC = () => {
    const [categoryData, setCategoryData] = useState<{ category: string, count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch establishments to calculate categories
        const { data: establishments } = await supabase
            .from('establishments')
            .select('category');

        if (establishments) {
            const counts: Record<string, number> = {};
            establishments.forEach(e => {
                const cat = e.category || 'Outros';
                counts[cat] = (counts[cat] || 0) + 1;
            });

            const formatted = Object.entries(counts)
                .map(([category, count]) => ({ category, count }))
                .sort((a, b) => b.count - a.count);

            setCategoryData(formatted);
        }
        setLoading(false);
    };

    const total = categoryData.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Types Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-6">Distribuição por Categoria</h3>

                {loading ? (
                    <div className="h-64 flex items-center justify-center text-slate-400">Carregando dados...</div>
                ) : (
                    <div className="space-y-4">
                        {categoryData.map((item, index) => (
                            <div key={item.category} className="space-y-1">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-700">{item.category}</span>
                                    <span className="text-slate-900">{item.count} ({((item.count / total) * 100).toFixed(1)}%)</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${index === 0 ? 'bg-primary-brand' :
                                                index === 1 ? 'bg-purple-500' :
                                                    index === 2 ? 'bg-amber-500' : 'bg-slate-400'
                                            }`}
                                        style={{ width: `${(item.count / total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {categoryData.length === 0 && <p className="text-center text-slate-400">Nenhum dado encontrado.</p>}
                    </div>
                )}
            </div>

            {/* New Signups & Churn (Real Data Placeholder - keeping visual structure but ready for real data) */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Novos Cadastros (Mês)</h3>
                    <div className="flex items-center gap-4">
                        <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <span className="material-symbols-outlined text-2xl">trending_up</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">{total}</p>
                            <p className="text-xs font-bold text-slate-400">Total de Empresas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 opacity-70">
                    <h3 className="font-bold text-slate-900 mb-4">Cancelamentos (Churn)</h3>
                    <div className="flex items-center gap-4">
                        <div className="size-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <span className="material-symbols-outlined text-2xl">trending_down</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">0%</p>
                            <p className="text-xs font-bold text-slate-400">Taxa de perda (Real)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
