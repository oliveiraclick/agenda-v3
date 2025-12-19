import React from 'react';
import Logo from '../components/Logo';

interface AuthRegisterSelectionProps {
    // Função que recebe o tipo de conta escolhido
    onSelectRole: (role: 'customer' | 'owner') => void;
    onBack: () => void;
}

const AuthRegisterSelection: React.FC<AuthRegisterSelectionProps> = ({ onSelectRole, onBack }) => {
    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 max-w-md mx-auto relative">
            {/* Botão Voltar */}
            <button onClick={onBack} className="absolute top-6 left-6 size-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-slate-400">arrow_back</span>
            </button>

            <Logo size={120} className="mb-10" />

            <div className="text-center mb-10">
                <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Como você deseja usar?</h1>
                <p className="text-slate-500 font-medium leading-tight px-4">Escolha o perfil que melhor se adapta às suas necessidades.</p>
            </div>

            <div className="w-full space-y-4">
                {/* Opção Cliente - Passa 'customer' */}
                <button
                    onClick={() => onSelectRole('customer')}
                    className="w-full bg-slate-50 p-6 rounded-[2rem] border-2 border-transparent hover:border-primary-brand hover:bg-white hover:shadow-xl transition-all group text-left relative overflow-hidden active:scale-95"
                >
                    <div className="relative z-10">
                        <div className="size-12 rounded-2xl bg-primary-brand/10 flex items-center justify-center mb-4 group-hover:bg-primary-brand group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-2xl">person</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">Sou Cliente</h3>
                        <p className="text-sm text-slate-500 font-medium leading-tight">Quero encontrar serviços e agendar meu horário.</p>
                    </div>
                </button>

                {/* Opção Empresa - Passa 'owner' */}
                <button
                    onClick={() => onSelectRole('owner')}
                    className="w-full bg-slate-50 p-6 rounded-[2rem] border-2 border-transparent hover:border-blue-600 hover:bg-white hover:shadow-xl transition-all group text-left relative overflow-hidden active:scale-95"
                >
                    <div className="relative z-10">
                        <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-2xl">storefront</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">Sou Empresa</h3>
                        <p className="text-sm text-slate-500 font-medium leading-tight">Quero gerenciar meu negócio e receber agendamentos.</p>
                    </div>
                </button>
            </div>

            <p className="text-center text-sm text-slate-400 font-medium mt-10">
                Já tem uma conta? <button onClick={onBack} className="text-slate-900 font-black hover:underline">Entrar</button>
            </p>
        </div>
    );
};

export default AuthRegisterSelection;
