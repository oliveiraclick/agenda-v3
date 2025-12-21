
import React from 'react';

interface AdminStatsFilterProps {
    selectedRange: string;
    onRangeChange: (range: string) => void;
    customStartDate: string;
    customEndDate: string;
    onCustomDateChange: (start: string, end: string) => void;
}

const AdminStatsFilter: React.FC<AdminStatsFilterProps> = ({
    selectedRange,
    onRangeChange,
    customStartDate,
    customEndDate,
    onCustomDateChange
}) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4 mb-6">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Filtrar Estatísticas:</span>

            <div className="flex gap-2">
                {['today', '7d', '15d', '30d', 'custom'].map((range) => (
                    <button
                        key={range}
                        onClick={() => onRangeChange(range)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRange === range
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        {range === 'today' && 'Hoje'}
                        {range === '7d' && '7 Dias'}
                        {range === '15d' && '15 Dias'}
                        {range === '30d' && '30 Dias'}
                        {range === 'custom' && 'Personalizado'}
                    </button>
                ))}
            </div>

            {selectedRange === 'custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
                    <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-brand"
                    />
                    <span className="text-slate-400 font-bold">-</span>
                    <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-brand"
                    />
                </div>
            )}
        </div>
    );
};

export default AdminStatsFilter;
