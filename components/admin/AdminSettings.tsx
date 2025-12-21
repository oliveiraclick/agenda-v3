
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SystemSetting } from '../../types';

const AdminSettings: React.FC = () => {
    const [maintenance, setMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('system_settings')
            .select('*')
            .eq('key', 'maintenance_mode')
            .single();

        if (data) {
            setMaintenance(data.value.enabled);
        }
        setLoading(false);
    };

    const toggleMaintenance = async () => {
        const newValue = !maintenance;
        setMaintenance(newValue); // Optimistic update

        const { error } = await supabase
            .from('system_settings')
            .upsert({
                key: 'maintenance_mode',
                value: { enabled: newValue, message: 'Estamos em manutenção. Voltamos logo!' },
                updated_at: new Date().toISOString()
            });

        if (error) {
            alert('Erro ao salvar configuração');
            setMaintenance(!newValue); // Revert
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">warning</span>
                            Modo Manutenção
                        </h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-md">
                            Ao ativar, o aplicativo ficará inacessível para todos os usuários (exceto Admins).
                            Use com cautela para atualizações críticas.
                        </p>
                    </div>

                    <button
                        onClick={toggleMaintenance}
                        disabled={loading}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-brand focus:ring-offset-2 ${maintenance ? 'bg-red-500' : 'bg-slate-200'
                            }`}
                    >
                        <span
                            className={`inline-block size-6 transform rounded-full bg-white transition-transform ${maintenance ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {maintenance && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                        <span className="material-symbols-outlined">lock</span>
                        <span className="text-sm font-bold">O sistema está BLOQUEADO para usuários comuns.</span>
                    </div>
                )}
            </div>

            {/* Placeholder for other settings */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 opacity-50 pointer-events-none grayscale">
                <h3 className="text-lg font-black text-slate-900 mb-4">Configurações de Pagamento (Em breve)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-slate-100 rounded-xl"></div>
                    <div className="h-10 bg-slate-100 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
