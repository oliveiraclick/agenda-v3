import React from 'react';
import Logo from '../components/Logo';

interface AuthRegisterSelectionProps {
    // Função que recebe o tipo de conta escolhido
    onSelectRole: (role: 'customer' | 'owner') => void;
    onBack: () => void;
}

const AuthRegisterSelection: React.FC<AuthRegisterSelectionProps> = ({ onSelectRole, onBack }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#F8FAFC]">
            {/* Background Gradients & Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary-brand/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
            </div>

            {/* Botão Voltar */}
            <button onClick={onBack} className="absolute top-6 left-6 size-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:shadow-lg transition-all z-20 group border border-white/50">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary-brand transition-colors">arrow_back</span>
            </button>

            <div className="w-full max-w-md mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-white rounded-3xl shadow-lg shadow-primary-brand/10 mb-6 animate-in zoom-in duration-700">
                        <Logo size={70} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Como você deseja usar?</h1>
                    <p className="text-slate-500 font-medium leading-tight px-4">Escolha a melhor experiência para você.</p>
                </div>

                <div className="w-full space-y-5">
                    {/* Opção Cliente */}
                    <button
                        onClick={() => onSelectRole('customer')}
                        className="w-full bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(229,29,75,0.15)] transition-all duration-300 group text-left relative overflow-hidden active:scale-95 border border-white/50 hover:border-primary-brand/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-brand/0 to-primary-brand/0 group-hover:from-primary-brand/5 group-hover:to-transparent transition-all duration-500" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="size-20 rounded-3xl bg-primary-brand/5 flex items-center justify-center group-hover:bg-primary-brand group-hover:scale-110 transition-all duration-300 shadow-inner">
                                <span className="material-symbols-outlined text-4xl text-primary-brand group-hover:text-white transition-colors">person</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-primary-brand transition-colors">Sou Cliente</h3>
                                <p className="text-sm text-slate-500 font-medium leading-snug">Quero encontrar serviços e agendar meu horário.</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
                                <span className="material-symbols-outlined text-primary-brand">arrow_forward_ios</span>
                            </div>
                        </div>
                    </button>

                    {/* Opção Empresa */}
                    <button
                        onClick={() => onSelectRole('owner')}
                        className="w-full bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.15)] transition-all duration-300 group text-left relative overflow-hidden active:scale-95 border border-white/50 hover:border-blue-500/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-500" />
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="size-20 rounded-3xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300 shadow-inner">
                                <span className="material-symbols-outlined text-4xl text-blue-600 group-hover:text-white transition-colors">storefront</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">Sou Empresa</h3>
                                <p className="text-sm text-slate-500 font-medium leading-snug">Quero gerenciar meu negócio e receber agendamentos.</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0">
                                <span className="material-symbols-outlined text-blue-600">arrow_forward_ios</span>
                            </div>
                        </div>
                    </button>
                </div>

                <p className="text-center text-sm text-slate-400 font-medium mt-12">
                    Já tem uma conta? <button onClick={onBack} className="text-slate-900 font-black hover:underline">Entrar</button>
                </p>
            </div>
        </div>
    );
};

export default AuthRegisterSelection;
