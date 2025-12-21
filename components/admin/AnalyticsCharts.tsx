
import React from 'react';

const AnalyticsCharts: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MRR Growth Chart (Simulated Visual) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900">Crescimento de Receita (MRR)</h3>
                    <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg py-1">
                        <option>Últimos 6 meses</option>
                        <option>Este Ano</option>
                    </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-2 px-2">
                    {[40, 55, 45, 70, 85, 100].map((h, i) => (
                        <div key={i} className="w-full flex flex-col gap-2 group cursor-pointer">
                            <div
                                className="w-full bg-primary-brand/10 rounded-t-xl relative group-hover:bg-primary-brand/20 transition-all"
                                style={{ height: `${h}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    R$ {h * 1200}
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 text-center uppercase">
                                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* New Signups & Churn */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Novos Cadastros</h3>
                    <div className="flex items-center gap-4">
                        <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <span className="material-symbols-outlined text-2xl">trending_up</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">+124</p>
                            <p className="text-xs font-bold text-slate-400">Salões este mês</p>
                        </div>
                        <div className="ml-auto">
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-black">+12%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Cancelamentos (Churn)</h3>
                    <div className="flex items-center gap-4">
                        <div className="size-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <span className="material-symbols-outlined text-2xl">trending_down</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900">2.4%</p>
                            <p className="text-xs font-bold text-slate-400">Taxa de perda</p>
                        </div>
                        <div className="ml-auto">
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs font-black">-0.5%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
