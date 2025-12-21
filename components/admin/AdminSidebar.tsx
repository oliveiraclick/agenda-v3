
import React from 'react';
import { AdminView } from '../../types';

interface AdminSidebarProps {
    currentView: AdminView;
    onNavigate: (view: AdminView) => void;
    onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, onNavigate, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Visão Geral', icon: 'dashboard' },
        { id: 'salons', label: 'Salões', icon: 'storefront' },
        { id: 'users', label: 'Usuários', icon: 'group' },
        { id: 'promocodes', label: 'Códigos Promo', icon: 'local_offer' },
        { id: 'settings', label: 'Configurações', icon: 'settings' },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary-brand to-rose-500">
                    Super Admin
                </h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">God Mode</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id as AdminView)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === item.id
                            ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/20 font-bold'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                            }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-bold"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
