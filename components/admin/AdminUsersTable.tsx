
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';

const AdminUsersTable: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        // Join with auth.users is not directly possible via client without a view or function usually, 
        // but for now we fetch profiles. Ideally we'd have a secure view.
        // We will fetch profiles and assume email is in profile or we can't show it easily without an edge function.
        // For this MVP, we show Name and Role.
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching users:', error);
        else setUsers(data as Profile[] || []);
        setLoading(false);
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        const { error } = await supabase
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar status');
        } else {
            setUsers(users.map(u => u.id === id ? { ...u, status: newStatus as 'active' | 'blocked' } : u));
        }
    };

    const exportData = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Nome,Role,Status,Criado Em\n"
            + users.map(u => `${u.id},${u.name},${u.role},${u.status},${u.created_at}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "usuarios_agendemais.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900">Gestão de Usuários</h2>
                <div className="flex gap-3">
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
                    >
                        <span className="material-symbols-outlined">download</span>
                        Exportar CSV
                    </button>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Buscar usuário..."
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-brand focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Tipo (Role)</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Data Cadastro</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold">Carregando...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                                            <p className="text-xs text-slate-400 font-medium truncate max-w-[150px]">{user.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                            user.role === 'owner' ? 'bg-blue-100 text-blue-600' :
                                                user.role === 'professional' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${user.status === 'blocked' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        {user.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-medium text-slate-500">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {user.role !== 'admin' && (
                                        <button
                                            onClick={() => toggleStatus(user.id, user.status || 'active')}
                                            title={user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                                            className={`size-8 rounded-lg flex items-center justify-center transition-colors ml-auto ${user.status === 'blocked' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {user.status === 'blocked' ? 'lock_open' : 'lock'}
                                            </span>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersTable;
