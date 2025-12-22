
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
import OwnerServices from './views/OwnerServices';
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
  const [customerView, setCustomerView] = useState<CustomerView>('portal'); // Default to portal, will adjust if not auth
  const [proView, setProView] = useState<ProfessionalView>('agenda');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');
  const [signupRole, setSignupRole] = useState<'owner' | 'customer'>('customer');
  const [showHelp, setShowHelp] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Persist session loading state

  const [isTrialExpired, setIsTrialExpired] = useState(false);

  // State to memory booking intent before login
  const [pendingBooking, setPendingBooking] = useState<{ slug: string; serviceId: string } | null>(null);

  // Initialize Session & Auth Listener
  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkSession();
      } else if (event === 'SIGNED_OUT') {
        setCurrentRole('customer');
        setCustomerView('onboarding');
        setOwnerView('overview');
        setAdminView('dashboard');
        setIsTrialExpired(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Remove dependency on pendingBooking to avoid loops, handle inside checkSession if needed or separate effect

  // Effect to handle pending booking ONLY after role is set to customer and user is logged in
  useEffect(() => {
    const restoreBooking = async () => {
      if (currentRole === 'customer' && pendingBooking && customerView === 'portal') {
        setIsLoading(true);
        // Fetch salon by slug
        const { data: salon } = await supabase.from('establishments').select('*').eq('slug', pendingBooking.slug).single();
        if (salon) {
          setSelectedSalon(salon);
          setCustomerView('booking');
          // Ideally pass serviceId to booking wizard, but for now just opening the wizard at the right salon is a huge win.
          // We can store serviceId in a ref or context if we want to auto-select it in the wizard later.
        }
        setPendingBooking(null); // Clear pending
        setIsLoading(false);
      }
    };

    if (!isLoading && currentRole === 'customer') {
      restoreBooking();
    }
  }, [isLoading, currentRole, customerView]); // Triggers when session check finishes

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // User authenticated, determine role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // Type assertion to ensure role matches AppRole or fallback to customer
          const role = (profile.role as AppRole) || 'customer';
          setCurrentRole(role);

          // If owner, check trial status
          if (role === 'owner') {
            const { data: establishment } = await supabase
              .from('establishments')
              .select('trial_ends_at, subscription_plan')
              .eq('owner_id', session.user.id)
              .single();

            if (establishment) {
              const trialEnd = new Date(establishment.trial_ends_at || Date.now());
              const now = new Date();
              if (trialEnd < now) {
                setIsTrialExpired(true);
              } else {
                setIsTrialExpired(false);
              }
            }
            setOwnerView('overview');
          } else if (role === 'customer') {
            // Logic handled by useEffect above for pending booking
            if (customerView === 'onboarding') setCustomerView('portal');
          }
        }
      } else {
        // No session, redirect to onboarding/login
        setCustomerView('onboarding');
      }
    } catch (e) {
      console.error('Session check failed', e);
      setCustomerView('onboarding');
    } finally {
      setIsLoading(false);
    }
  };

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

  // ... (Owner/Pro View Renders unchanged)

  const renderOwnerView = () => {
    switch (ownerView) {
      case 'overview': return <OwnerOverview onNavigate={setOwnerView} />;
      case 'agenda': return <OwnerDashboard />;
      case 'team': return <OwnerTeam onBack={() => setOwnerView('overview')} />;
      case 'services':
        return <OwnerServices onBack={() => setOwnerView('overview')} />;
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
      case 'login': return <AuthLogin onLogin={() => setCustomerView('portal')} onSignup={() => setCustomerView('signup_choice')} onForgotPassword={() => setCustomerView('forgot_password')} onRegisterDetails={() => setCustomerView('auth_register')} onBack={() => setCustomerView('onboarding')} />;
      case 'signup_choice': return <AuthRegisterSelection onSelectRole={(role) => { setSignupRole(role); setCustomerView('signup'); }} onBack={() => setCustomerView('login')} />;
      case 'signup': return <AuthSignup role={signupRole} onBack={() => setCustomerView('signup_choice')} onComplete={() => setCustomerView('portal')} />;
      case 'auth_register': return <CustomerRegister onComplete={() => setCustomerView('portal')} />;
      case 'forgot_password': return <AuthForgotPassword onBack={() => setCustomerView('login')} />;
      case 'portal': return <CustomerPortal onNavigate={setCustomerView} onSelectSalon={setSelectedSalon} />;
      case 'discovery': return <SalonDiscovery onSelectSalon={(salon) => { setSelectedSalon(salon); setCustomerView('booking'); }} onProfile={() => setCustomerView('profile')} />;
      case 'favorites': return <CustomerFavorites onBack={() => setCustomerView('portal')} />;
      case 'history': return <CustomerHistory onBack={() => setCustomerView('portal')} />;
      case 'profile': return <CustomerProfile onBack={() => setCustomerView('portal')} onLogout={() => setCustomerView('login')} />;
      case 'booking': return <CustomerBookingWizard salon={selectedSalon} initialServiceId={pendingBooking?.serviceId} onLoyalty={() => setCustomerView('loyalty')} onBack={() => setCustomerView('discovery')} />;
      case 'loyalty': return <CustomerLoyalty onBack={() => setCustomerView('portal')} />;
      default: return <CustomerPortal onNavigate={setCustomerView} />;
    }
  };

  // While loading session, show splash/loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="size-16 rounded-full bg-primary-brand/20"></div>
          <p className="text-slate-400 text-sm font-bold">Carregando...</p>
        </div>
      </div>
    );
  }

  // Trial Expired Blocking Modal
  if (isTrialExpired && currentRole === 'owner') {
    const [proCount, setProCount] = useState(0);
    const [loadingPrice, setLoadingPrice] = useState(true);

    useEffect(() => {
      const fetchPros = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get Establishment ID first
        const { data: est } = await supabase.from('establishments').select('id').eq('owner_id', user.id).single();
        if (est) {
          const { count } = await supabase
            .from('professionals')
            .select('*', { count: 'exact', head: true })
            .eq('establishment_id', est.id);
          setProCount(count || 0);
        }
        setLoadingPrice(false);
      };
      fetchPros();
    }, []);

    const basePrice = 29.00;
    const proPrice = 10.00;
    const total = basePrice + (proCount * proPrice);

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 z-50 relative">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="size-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
            <span className="material-symbols-outlined text-4xl">lock_clock</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Período Gratuito Encerrado</h2>
          <p className="text-slate-500 mb-6">
            Para continuar gerenciando seu negócio, ative sua assinatura.
          </p>

          {/* Price Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2 border border-slate-100">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Plano Base</span>
              <span className="font-bold">R$ {basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>{proCount} Profissionais (x R$ {proPrice.toFixed(2)})</span>
              <span className="font-bold">R$ {(proCount * proPrice).toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-black text-slate-900">
              <span>Total Mensal</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="https://pay.kiwify.com.br/ZqDT7Lt"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-primary-brand text-white rounded-xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-primary-brand/30"
            >
              Pagar Agora
            </a>
            <button
              onClick={() => supabase.auth.signOut()}
              className="block w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              Sair da Conta
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-6">
            Após o pagamento, seu acesso será liberado automaticamente em alguns instantes.
          </p>
        </div>
      </div>
    );
  }

  // If accessing a public storefront URL, render it
  if (publicSlug) {
    return (
      <PublicStorefront
        slug={publicSlug}
        onBookService={(serviceId) => {
          // Store intent and redirect to login
          setPendingBooking({ slug: publicSlug, serviceId });
          window.location.hash = ''; // Clear hash to enter app mode
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
