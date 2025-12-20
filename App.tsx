
import React, { useState, useEffect } from 'react';
import { AppRole, OwnerView, CustomerView, AdminView, ProfessionalView } from './types';

// Auth & Onboarding
import Onboarding from './views/Onboarding';
import AuthLogin from './views/AuthLogin';
import AuthRegisterSelection from './views/AuthRegisterSelection';
import AuthSignup from './views/AuthSignup';
import AuthForgotPassword from './views/AuthForgotPassword';
import CustomerRegister from './views/CustomerRegister';

// Views de Dono
import OwnerOverview from './views/OwnerOverview';
import OwnerDashboard from './views/OwnerDashboard';
import OwnerTeam from './views/OwnerTeam';
import OwnerInventory from './views/OwnerInventory';
import OwnerFinancial from './views/OwnerFinancial';
import OwnerMarketing from './views/OwnerMarketing';
import OwnerSettings from './views/OwnerSettings';

// Views de Profissional
import ProfessionalAgenda from './views/ProfessionalAgenda';
import ProfessionalCommissions from './views/ProfessionalCommissions';

// Views de Cliente
import CustomerPortal from './views/CustomerPortal';
import SalonDiscovery from './views/SalonDiscovery';
import CustomerBookingWizard from './views/CustomerBookingWizard';
import CustomerLoyalty from './views/CustomerLoyalty';
import CustomerHistory from './views/CustomerHistory';
import CustomerFavorites from './views/CustomerFavorites';
import CustomerProfile from './views/CustomerProfile';

// Admin & Help
import AdminDashboard from './views/AdminDashboard';
import HelpCenter from './views/HelpCenter';

// Public Storefront
import PublicStorefront from './views/PublicStorefront';

import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<AppRole>('customer');
  const [ownerView, setOwnerView] = useState<OwnerView>('overview');
  const [customerView, setCustomerView] = useState<CustomerView>('onboarding'); // Default to onboarding
  const [proView, setProView] = useState<ProfessionalView>('agenda');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [signupRole, setSignupRole] = useState<'owner' | 'customer'>('customer');
  const [showHelp, setShowHelp] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);

  // Detect hash-based public salon routing
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/') && hash.length > 2) {
        const slug = hash.substring(2); // Remove '#/'
        setPublicSlug(slug);
      } else {
        setPublicSlug(null);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // ... existing code ...

  const renderOwnerView = () => {
    switch (ownerView) {
      case 'overview': return <OwnerOverview onNavigate={setOwnerView} />;
      case 'agenda': return <OwnerDashboard />;
      case 'team': return <OwnerTeam onBack={() => setOwnerView('overview')} />;
      case 'inventory': return <OwnerInventory onBack={() => setOwnerView('overview')} />;
      case 'financial': return <OwnerFinancial onBack={() => setOwnerView('overview')} />;
      case 'marketing': return <OwnerMarketing onBack={() => setOwnerView('overview')} />;
      case 'settings': return <OwnerSettings onBack={() => setOwnerView('overview')} />;
      default: return <OwnerOverview onNavigate={setOwnerView} />;
    }
  };

  const renderProfessionalView = () => {
    switch (proView) {
      case 'agenda': return <ProfessionalAgenda />;
      case 'commissions': return <ProfessionalCommissions />;
      default: return <ProfessionalAgenda />;
    }
  };

  const renderCustomerView = () => {
    switch (customerView) {
      case 'onboarding': return <Onboarding onStart={() => setCustomerView('signup_choice')} onLogin={() => setCustomerView('login')} />;
      case 'login': return <AuthLogin onLogin={() => setCustomerView('portal')} onSignup={() => setCustomerView('signup_choice')} onForgot={() => setCustomerView('forgot_password')} onRegisterDetails={() => setCustomerView('auth_register')} onBack={() => setCustomerView('onboarding')} />;
      case 'signup_choice': return <AuthRegisterSelection onSelectRole={(role) => { setSignupRole(role); setCustomerView('signup'); }} onBack={() => setCustomerView('login')} />;
      case 'signup': return <AuthSignup role={signupRole} onBack={() => setCustomerView('signup_choice')} onComplete={() => setCustomerView('portal')} />;
      case 'auth_register': return <CustomerRegister onComplete={() => setCustomerView('portal')} />;
      case 'forgot_password': return <AuthForgotPassword onBack={() => setCustomerView('login')} />;
      case 'portal': return <CustomerPortal onNavigate={setCustomerView} onSelectSalon={setSelectedSalon} />;
      case 'discovery': return <SalonDiscovery onSelectSalon={(salon) => { setSelectedSalon(salon); setCustomerView('booking'); }} onProfile={() => setCustomerView('profile')} />;
      case 'favorites': return <CustomerFavorites onBack={() => setCustomerView('portal')} />;
      case 'history': return <CustomerHistory onBack={() => setCustomerView('portal')} />;
      case 'profile': return <CustomerProfile onBack={() => setCustomerView('portal')} onLogout={() => setCustomerView('login')} />;
      case 'booking': return <CustomerBookingWizard salon={selectedSalon} onLoyalty={() => setCustomerView('loyalty')} onBack={() => setCustomerView('discovery')} />;
      case 'loyalty': return <CustomerLoyalty onBack={() => setCustomerView('portal')} />;
      default: return <CustomerPortal onNavigate={setCustomerView} />;
    }
  };

  // If accessing a public storefront URL, render it
  if (publicSlug) {
    return (
      <PublicStorefront
        slug={publicSlug}
        onBookService={(serviceId) => {
          // Redirect to login/signup for booking
          window.location.hash = '';
          setCustomerView('login');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-background-light dark:bg-background-dark overflow-x-hidden">
      <div className="flex-1">
        {currentRole === 'owner' ? renderOwnerView() :
          currentRole === 'customer' ? renderCustomerView() :
            currentRole === 'professional' ? renderProfessionalView() :
              <AdminDashboard currentView={adminView} onNavigate={setAdminView} />}
      </div>

      {/* NavBars por Papel */}
      {currentRole === 'owner' && (
        <nav className="fixed bottom-0 z-50 w-full bg-white dark:bg-[#1a2230] border-t border-slate-200 dark:border-slate-800 pb-safe h-[80px] shadow-2xl">
          <div className="flex justify-around items-start pt-3 px-2 max-w-md mx-auto">
            <button onClick={() => setOwnerView('overview')} className={`flex flex-col items-center gap-1 flex-1 ${ownerView === 'overview' ? 'text-primary-owner' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined text-[26px]">grid_view</span>
              <span className="text-[10px] font-bold">Início</span>
            </button>
            <button onClick={() => setOwnerView('agenda')} className={`flex flex-col items-center gap-1 flex-1 ${ownerView === 'agenda' ? 'text-primary-owner' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined text-[26px]">calendar_today</span>
              <span className="text-[10px] font-bold">Agenda</span>
            </button>
            <button onClick={() => setOwnerView('marketing')} className={`flex flex-col items-center gap-1 flex-1 ${ownerView === 'marketing' ? 'text-primary-owner' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined text-[26px]">campaign</span>
              <span className="text-[10px] font-bold">Marketing</span>
            </button>
            <button onClick={() => setOwnerView('settings')} className={`flex flex-col items-center gap-1 flex-1 ${ownerView === 'settings' ? 'text-primary-owner' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined text-[26px]">settings</span>
              <span className="text-[10px] font-bold">Ajustes</span>
            </button>
          </div>
        </nav>
      )}

      {currentRole === 'professional' && (
        <nav className="fixed bottom-0 z-50 w-full bg-white dark:bg-[#1a2230] border-t border-slate-200 dark:border-slate-800 pb-safe h-[80px] shadow-2xl">
          <div className="flex justify-around items-start pt-3 px-2 max-w-md mx-auto">
            <button onClick={() => setProView('agenda')} className={`flex flex-col items-center gap-1 flex-1 ${proView === 'agenda' ? 'text-primary' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined text-[26px]">calendar_month</span>
              <span className="text-[10px] font-bold">Agenda</span>
            </button>
            <button onClick={() => setProView('commissions')} className={`flex flex-col items-center gap-1 flex-1 ${proView === 'commissions' ? 'text-primary' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined text-[26px]">payments</span>
              <span className="text-[10px] font-bold">Ganhos</span>
            </button>
            <button onClick={() => setProView('profile')} className={`flex flex-col items-center gap-1 flex-1 ${proView === 'profile' ? 'text-primary' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined text-[26px]">person</span>
              <span className="text-[10px] font-bold">Perfil</span>
            </button>
          </div>
        </nav>
      )}

      {currentRole === 'customer' && !['onboarding', 'login', 'signup_choice', 'signup', 'forgot_password', 'auth_register', 'booking'].includes(customerView) && (
        <nav className="fixed bottom-6 left-4 right-4 bg-[#191022]/90 backdrop-blur-lg rounded-full shadow-2xl p-1 z-50 border border-white/10 max-w-md mx-auto h-16">
          <div className="flex justify-between items-center h-full px-2">
            <button onClick={() => setCustomerView('portal')} className={`flex-1 flex justify-center items-center py-3 rounded-full ${customerView === 'portal' ? 'bg-primary-customer text-white' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined">home</span>
            </button>
            <button onClick={() => setCustomerView('discovery')} className={`flex-1 flex justify-center items-center py-3 rounded-full ${customerView === 'discovery' ? 'bg-primary-customer text-white' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined">search</span>
            </button>
            <button onClick={() => setCustomerView('history')} className={`flex-1 flex justify-center items-center py-3 rounded-full ${customerView === 'history' ? 'bg-primary-customer text-white' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
            <button onClick={() => setCustomerView('profile')} className={`flex-1 flex justify-center items-center py-3 rounded-full ${customerView === 'profile' ? 'bg-primary-customer text-white' : 'text-gray-400'}`}>
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </nav>
      )}

      {currentRole === 'admin' && (
        <nav className="fixed bottom-0 z-50 w-full bg-white/90 dark:bg-[#151b26]/90 backdrop-blur-lg border-t dark:border-slate-800 pb-safe h-[80px] shadow-2xl">
          <div className="flex justify-around items-start pt-3 px-4 max-w-md mx-auto">
            <button onClick={() => setAdminView('dashboard')} className={`flex flex-col items-center gap-1 ${adminView === 'dashboard' ? 'text-primary' : 'text-slate-400'}`}>
              <span className="material-symbols-outlined text-[26px]">dashboard</span>
              <span className="text-[10px] font-bold">Início</span>
            </button>
            <button onClick={() => setAdminView('salons')} className={`flex flex-col items-center gap-1 ${adminView === 'salons' ? 'text-primary' : 'text-slate-400'}`}>
              <span className="material-symbols-outlined text-[26px]">store</span>
              <span className="text-[10px] font-bold">Salões</span>
            </button>
            <button onClick={() => setAdminView('users')} className={`flex flex-col items-center gap-1 ${adminView === 'users' ? 'text-primary' : 'text-slate-400'}`}>
              <span className="material-symbols-outlined text-[26px]">people</span>
              <span className="text-[10px] font-bold">Usuários</span>
            </button>
            <button onClick={() => setAdminView('settings')} className={`flex flex-col items-center gap-1 ${adminView === 'settings' ? 'text-primary' : 'text-slate-400'}`}>
              <span className="material-symbols-outlined text-[26px]">settings</span>
              <span className="text-[10px] font-bold">Ajustes</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
