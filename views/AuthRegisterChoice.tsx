import React from 'react';
import Logo from '../components/Logo';

interface AuthRegisterChoiceProps {
    onSelectCustomer: () => void;
    onSelectOwner: () => void;
    onBack: () => void;
}

const AuthRegisterChoice: React.FC<AuthRegisterChoiceProps> = ({ onSelectCustomer, onSelectOwner, onBack }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 max-w-md mx-auto view-transition relative">
            <button onClick={onBack} className="absolute top-6 left-6 size-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-slate-400">arrow_back</span>
            </button>

            <Logo size={140} className="mb-8" />

            <h1 className="text-2xl font-black tracking-tighter text-slate-900 mb-4 text-center">
                Como você quer se cadastrar?
            </h1>
            <p className="text-slate-500 text-center mb-12">
                Escolha o tipo de conta que melhor se adequa às suas necessidades.
            </p>

            <div className="w-full space-y-4">
                {/* Cliente */}
                <button
                    onClick={onSelectCustomer}
                    className="w-full bg-white border-2 border-slate-200 rounded-3xl p-6 hover:border-primary-brand hover:shadow-lg transition-all group"
                >
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary-brand/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-brand transition-colors">
                            <span className="material-symbols-outlined text-primary-brand text-3xl group-hover:text-white transition-colors">person</span>
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-black text-lg text-slate-900 mb-1">Sou Cliente</h3>
                            <p className="text-sm text-slate-500">Quero agendar serviços e gerenciar meus agendamentos.</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary-brand transition-colors">arrow_forward</span>
                    </div>
                </button>

                {/* Empresa */}
                <button
                    onClick={onSelectOwner}
                    className="w-full bg-white border-2 border-slate-200 rounded-3xl p-6 hover:border-primary-brand hover:shadow-lg transition-all group"
                >
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary-brand/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-brand transition-colors">
                            <span className="material-symbols-outlined text-primary-brand text-3xl group-hover:text-white transition-colors">store</span>
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-black text-lg text-slate-900 mb-1">Sou Empresa</h3>
                            <p className="text-sm text-slate-500">Quero gerenciar meu negócio e receber agendamentos.</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary-brand transition-colors">arrow_forward</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default AuthRegisterChoice;
