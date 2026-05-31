import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Scissors, Users, Calendar, Store, ChevronRight, Menu, X, Heart, 
  ShieldCheck, Mail, Phone, Instagram, MapPin, Award, BookOpen, FileText, 
  Sliders, Bell, CheckCircle, Moon, Sun, Gift, ChevronDown, User, RefreshCw, Settings, LogOut
} from 'lucide-react';
import { ServiceItem, UserProfile, NotificationItem, Appointment, Product, CommunityPost } from './types';
import { SERVICES, PRODUCTS } from './data';

// Firebase Authentication & Firestore imports
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Internationalization engine imports
import { t, Language } from './i18n';

// Component imports
import SalonDashboard from './components/SalonDashboard';
import ServiceCatalogue from './components/ServiceCatalogue';
import CommunityFeed from './components/CommunityFeed';
import AIPartner from './components/AIPartner';
import BookingForm from './components/BookingForm';
import OnlineShop from './components/OnlineShop';
import LoyaltyHub from './components/LoyaltyHub';
import EventsArea from './components/EventsArea';
import ReportHub from './components/ReportHub';
import AdminPanel from './components/AdminPanel';
import MyStyleScanner from './components/MyStyleScanner';
import SalonPanel from './components/SalonPanel';
import SettingsPanel from './components/SettingsPanel';
import AuthScreen from './components/AuthScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return ['inicio', 'catalogo', 'loja', 'fidelidade', 'eventos', 'comunidade', 'BellaAI', 'agendar', 'relatorios', 'admin', 'meu-estilo', 'configuracoes'].includes(hash) ? hash : 'inicio';
  });

  // Firebase auth state tracking
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // User mode state: CLIENTE or SALÃO DE BELEZA
  const [userType, setUserType] = useState<'client' | 'salon' | null>(() => {
    return localStorage.getItem('next_lady_user_type_preference') as 'client' | 'salon' | null;
  });

  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<ServiceItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Centralized Products Database
  const [productsDb, setProductsDb] = useState<Product[]>(() => {
    const saved = localStorage.getItem('next_lady_products_db');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('next_lady_products_db', JSON.stringify(productsDb));
  }, [productsDb]);

  // Load or construct physical database of services for admin capability consistency
  const [servicesDb, setServicesDb] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('next_lady_services_db');
    return saved ? JSON.parse(saved) : SERVICES;
  });

  // Centralized Appointments Database for instant reactive sync between customer and salon
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('next_lady_appointments');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'appt-1',
        serviceId: 's-3',
        specialistId: 'sp-1',
        date: '2026-06-03',
        time: '14:00',
        clientName: 'Letícia Cabral Reis',
        clientEmail: 'leticiacabral@gmail.com',
        clientPhone: '11988882211',
        pointsGranted: 80,
        status: 'PENDENTE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'appt-2',
        serviceId: 's-5',
        specialistId: 'sp-4',
        date: '2026-06-05',
        time: '16:30',
        clientName: 'Beatriz Vasques Medeiros',
        clientEmail: 'beatrizvasques@gmail.com',
        clientPhone: '11977773344',
        pointsGranted: 100,
        status: 'CONFIRMADO',
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('next_lady_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Load User Profile or initial local guest representation
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('next_lady_user_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: '',
      age: '',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      points: 200, // Gift of joining
      role: 'client',
      favoriteProducts: [],
      rsvpEvents: [],
      redeemedRewards: [],
      isDarkTheme: false,
      email: '',
      isBanned: false,
      language: 'pt',
      theme: 'rose'
    };
  });

  // Track Firebase Auth state transformations
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
            if (data.role === 'salon') {
              setUserType('salon');
              localStorage.setItem('next_lady_user_type_preference', 'salon');
            } else if (data.role === 'admin') {
              // Admin role acts as high tier client with privileged commands
              setUserType('client');
              localStorage.setItem('next_lady_user_type_preference', 'client');
            } else {
              setUserType('client');
              localStorage.setItem('next_lady_user_type_preference', 'client');
            }
          } else {
            // First time loading - build new firestore record mapping
            const emailClean = (user.email || '').toLowerCase().trim();
            const isAdmin = emailClean === 'admin@nextlady.com' || emailClean === 'takemijunior@gmail.com';
            const initial: UserProfile = {
              name: user.displayName || 'Utilizadora VIP',
              age: '28',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
              points: 200,
              role: isAdmin ? 'admin' : 'client',
              favoriteProducts: [],
              rsvpEvents: [],
              redeemedRewards: [],
              isDarkTheme: false,
              email: emailClean,
              isBanned: false,
              language: 'pt',
              theme: 'rose'
            };
            await setDoc(userDocRef, initial);
            setUserProfile(initial);
            setUserType('client');
            localStorage.setItem('next_lady_user_type_preference', 'client');
          }
        } catch (err) {
          console.warn('Could not sync user profile on auth state change:', err);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Save changes helper with Firestore sync
  const handleUpdateUser = async (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('next_lady_user_profile', JSON.stringify(updatedProfile));
    
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, updatedProfile, { merge: true });
      } catch (err) {
        console.warn('Could not update Firestore profile:', err);
      }
    }
  };

  // Realtime System Notifications Array
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('next_lady_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'n-1',
        title: 'Bem-vinda ao Next Lady! 👑',
        message: 'Você recebeu um presente de boas-vindas: +200 pontos de fidelidade creditados! Use no Loyalty Hub.',
        type: 'sistema',
        createdAt: new Date().toISOString(),
        read: false
      },
      {
        id: 'n-2',
        title: 'Nova Linha Perfumaria Royal Lady 🛍️',
        message: 'Chegou o Parfum Royal Lady Gold de 75ml com notas de jasmim d\'água importada na nossa loja!',
        type: 'loja',
        createdAt: new Date().toISOString(),
        read: false
      }
    ];
  });

  // Global Translator Helper lookup using i18n mapping
  const currentLang = userProfile?.language || 'pt';
  const txt = (key: string, fallback: string) => t(currentLang as Language, key, fallback);

  // Dynamic UI theme config options map
  const activeTheme = userProfile?.theme || 'rose';
  const themeClasses = {
    rose: {
      wrapperBg: 'bg-[#faf8f8] text-stone-800',
      headerBg: 'bg-white/90 border-[#3d232e]/10',
      footerBg: 'bg-[#150e11] text-stone-400 border-t border-stone-900',
      logoSquare: 'bg-[#3d232e] text-amber-250',
      activeTab: 'text-rose-500 bg-rose-50/50',
      inactiveTab: 'text-gray-400 hover:text-stone-850 hover:bg-stone-50',
      btnAccent: 'bg-[#3d232e] hover:bg-black text-amber-250',
      pfpBorder: 'border-[#3d232e]/10',
    },
    purple: {
      wrapperBg: 'bg-[#fbf7fd] text-stone-900',
      headerBg: 'bg-white/90 border-purple-100',
      footerBg: 'bg-[#19111c] text-stone-400 border-t border-purple-950/30',
      logoSquare: 'bg-[#301934] text-purple-200',
      activeTab: 'text-purple-650 bg-purple-100/30',
      inactiveTab: 'text-gray-400 hover:text-purple-900 hover:bg-purple-100/10',
      btnAccent: 'bg-[#301934] hover:bg-black text-purple-200',
      pfpBorder: 'border-purple-200',
    },
    blue: {
      wrapperBg: 'bg-[#f7fafe] text-stone-900',
      headerBg: 'bg-white/90 border-sky-100',
      footerBg: 'bg-[#0a1826] text-stone-400 border-t border-sky-950/30',
      logoSquare: 'bg-[#0f2d4a] text-sky-200',
      activeTab: 'text-sky-650 bg-sky-100/30',
      inactiveTab: 'text-gray-400 hover:text-[#0f2d4a] hover:bg-sky-100/10',
      btnAccent: 'bg-[#0f2d4a] hover:bg-[#061b2f] text-sky-200',
      pfpBorder: 'border-sky-200',
    },
    dark: {
      wrapperBg: 'bg-stone-950 text-stone-100',
      headerBg: 'bg-stone-900/90 border-stone-850',
      footerBg: 'bg-stone-900 text-stone-400 border-t border-stone-800',
      logoSquare: 'bg-stone-850 text-amber-400',
      activeTab: 'text-amber-400 bg-stone-800',
      inactiveTab: 'text-stone-400 hover:text-white hover:bg-stone-850/60',
      btnAccent: 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700',
      pfpBorder: 'border-stone-800',
    }
  }[activeTheme] || {
    wrapperBg: 'bg-[#faf8f8] text-stone-800',
    headerBg: 'bg-white/90 border-[#3d232e]/10',
    footerBg: 'bg-[#150e11] text-stone-400 border-t border-stone-900',
    logoSquare: 'bg-[#3d232e] text-amber-250',
    activeTab: 'text-rose-500 bg-rose-50/50',
    inactiveTab: 'text-gray-400 hover:text-stone-850 hover:bg-stone-50',
    btnAccent: 'bg-[#3d232e] hover:bg-black text-amber-250',
    pfpBorder: 'border-[#3d232e]/10',
  };

  // Secure Firebase Account Sign Out
  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('next_lady_user_profile');
      setCurrentUser(null);
      setUserProfile({
        name: '',
        age: '',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        points: 200,
        role: 'client',
        favoriteProducts: [],
        rsvpEvents: [],
        redeemedRewards: [],
        isDarkTheme: false,
        email: '',
        isBanned: false,
        language: 'pt',
        theme: 'rose'
      });
      handleAddNotification('Sessão Encerrada ✔️', 'Sua credencial VIP foi desvinculada com segurança.', 'sistema');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Add system notifications dynamically
  const handleAddNotification = (
    title: string,
    message: string,
    type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema'
  ) => {
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('next_lady_notifications', JSON.stringify(updated));
  };

  // Reset or erase guest logs for sandbox verification comfort
  const handleResetAppSession = () => {
    if (confirm('Deseja redefinir sua conta e dados locais no Next Lady?')) {
      localStorage.removeItem('next_lady_user_profile');
      localStorage.removeItem('next_lady_appointments');
      localStorage.removeItem('next_lady_purchases');
      localStorage.removeItem('next_lady_community_posts');
      localStorage.removeItem('next_lady_chat_history');
      localStorage.removeItem('next_lady_notifications');
      window.location.reload();
    }
  };

  // Synchronize hash routing silently
  useEffect(() => {
    if (activeTab === 'admin' && (userProfile.role !== 'admin' || userType !== 'client')) {
      setActiveTab('inicio');
      return;
    }
    window.location.hash = activeTab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, userProfile, userType]);

  // Sync notifications to local storage modifications
  useEffect(() => {
    localStorage.setItem('next_lady_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Navigate & select treatment shortcut
  const handleSelectService = (service: ServiceItem) => {
    setSelectedServiceForBooking(service);
    setActiveTab('agendar');
  };

  // Suggest Inpspirations link to AI chat
  const handleChatRedirection = (queryText: string) => {
    const saved = localStorage.getItem('next_lady_chat_history');
    let msgList = [];
    if (saved) {
      msgList = JSON.parse(saved);
    }
    
    msgList.push({
      id: `inspo-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    localStorage.setItem('next_lady_chat_history', JSON.stringify(msgList));
    setActiveTab('BellaAI');
    
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 50);
  };

  const handleServiceRecommendationBooking = (serviceName: string) => {
    // Find service matching name if exists
    const matched = servicesDb.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase()));
    if (matched) {
      setSelectedServiceForBooking(matched);
    }
    setActiveTab('agendar');
  };

  // Mark all notifications as read
  const handleMarkNotificationsAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  // Dismiss notification card
  const handleDismissNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (userProfile && userProfile.isBanned) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6 text-center font-sans space-y-6">
        <div className="w-20 h-20 bg-red-650/20 text-red-500 rounded-full flex items-center justify-center text-4xl border border-red-500/20 shadow-xl animate-bounce">
          🚷
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider">Acesso Comunitário Suspenso</h2>
          <p className="text-xs text-stone-400 leading-relaxed font-light">
            Prezada <strong>{userProfile.name}</strong> ({userProfile.email || 'Usuária'}), o seu cadastro no ecossistema Next Lady Club foi suspenso temporariamente pela administração após detecção de irregularidades ou violação dos nossos Termos de Convivência Comunitária.
          </p>
        </div>
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 max-w-xs text-left space-y-1.5 text-[10px] text-gray-500 leading-normal">
          <p className="font-semibold text-gray-400">🚨 MOTIVO DA RESTRIÇÃO:</p>
          <p>Conduta imprópria no fórum da comunidade ou tentativa de burla nos procedimentos de agendamento & resgate de mimos corporativos.</p>
          <p className="text-stone-500 mt-2 font-mono">ID de Auditoria: BAN_L_2026</p>
        </div>
        <button
          onClick={async () => {
            try {
              await auth.signOut();
              localStorage.removeItem('next_lady_user_profile');
              setCurrentUser(null);
            } catch (err) {
              console.error(err);
            }
          }}
          className="bg-red-650 hover:bg-red-750 text-white font-bold px-6 py-2.5 rounded-xl text-xs font-sans tracking-wide cursor-pointer uppercase transition-all"
        >
          Desconectar da Conta Banida / Voltar ao Login
        </button>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f8] flex flex-col items-center justify-center p-6 text-stone-850 font-sans">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#3d232e] animate-pulse">Carregando Credenciais VIP Next Lady...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen 
        onAuthSuccess={(profile, typePref) => {
          setCurrentUser(auth.currentUser);
          setUserProfile(profile);
          setUserType(typePref);
          handleAddNotification(
            'Iniciado Sessão com Sucesso! 💄',
            `Bem-vinda de volta ao ecossistema Next Lady, ${profile.name}!`,
            'sistema'
          );
        }}
        onAddNotification={handleAddNotification}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-[#3d232e]/10 selection:text-[#3d232e] ${themeClasses.wrapperBg}`} id="nextlady-app-root">
      
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-xs transition-colors ${themeClasses.headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand with custom minimalist crown/butterfly styling */}
          <div 
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-103 group-hover:rotate-12 duration-300 ${themeClasses.logoSquare}`}>
              <span className="font-semibold text-lg">👑</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 align-middle">
                <span className="font-display font-bold text-lg tracking-wide block leading-none">Next Lady</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <span className="text-[10px] uppercase font-sans tracking-widest font-bold block mt-1">Intelligent Beauty</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {userType === 'client' ? (
              <>
                <button
                  onClick={() => setActiveTab('inicio')}
                  className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all select-none ${
                    activeTab === 'inicio' ? themeClasses.activeTab : themeClasses.inactiveTab
                  }`}
                >
                  {txt('inicio', 'Início')}
                </button>
                <button
                  onClick={() => setActiveTab('meu-estilo')}
                  className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all select-none flex items-center gap-1 ${
                    activeTab === 'meu-estilo' ? themeClasses.activeTab : themeClasses.inactiveTab
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> {txt('meu_estilo', 'Consultora de Beleza IA')}
                </button>
                <button
                  onClick={() => { setSelectedServiceForBooking(null); setActiveTab('catalogo'); }}
                  className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all select-none ${
                    activeTab === 'catalogo' ? themeClasses.activeTab : themeClasses.inactiveTab
                  }`}
                >
                  {txt('catalogo', 'Procedimentos')}
                </button>
                <button
                  onClick={() => setActiveTab('loja')}
                  className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all select-none ${
                    activeTab === 'loja' ? themeClasses.activeTab : themeClasses.inactiveTab
                  }`}
                >
                  {txt('loja', 'Loja Mimos')}
                </button>
                <button
                  onClick={() => setActiveTab('fidelidade')}
                  className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all select-none flex items-center gap-1 ${
                    activeTab === 'fidelidade' ? themeClasses.activeTab : themeClasses.inactiveTab
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-500" /> {txt('fidelidade', 'Loyalty Hub')}
                </button>
                <button
                  onClick={() => setActiveTab('eventos')}
                  className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all select-none ${
                    activeTab === 'eventos' ? themeClasses.activeTab : themeClasses.inactiveTab
                  }`}
                >
                  {txt('eventos', 'Cursos')}
                </button>
                <button
                  onClick={() => setActiveTab('comunidade')}
                  className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all select-none ${
                    activeTab === 'comunidade' ? themeClasses.activeTab : themeClasses.inactiveTab
                  }`}
                >
                  {txt('comunidade', 'Comunidade')}
                </button>
                <button
                  onClick={() => setActiveTab('relatorios')}
                  className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all select-none flex items-center gap-1 ${
                    activeTab === 'relatorios' ? themeClasses.activeTab : themeClasses.inactiveTab
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> {txt('relatorios', 'Ata PDF')}
                </button>
                <button
                  onClick={() => setActiveTab('BellaAI')}
                  className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all flex items-center gap-1 ${
                    activeTab === 'BellaAI' 
                      ? themeClasses.activeTab
                      : themeClasses.inactiveTab
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" /> {txt('BellaAI', 'Lady AI')}
                </button>
                {userProfile.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`font-sans text-[11px] font-bold px-3 py-2 rounded-xl uppercase tracking-wider transition-all select-none flex items-center gap-1 border border-amber-500/20 bg-amber-500/5 ${
                      activeTab === 'admin' ? 'text-amber-550 bg-amber-500/20' : 'text-stone-400 hover:text-amber-500 hover:bg-amber-500/10'
                    }`}
                  >
                    {txt('admin', 'Módulo Admin')}
                  </button>
                )}
              </>
            ) : (
              <span className="text-[10px] bg-rose-950 text-amber-200 border border-rose-900/60 px-4 py-2 rounded-xl font-bold uppercase tracking-widest flex items-center gap-1.5 select-none font-sans">
                <Sliders className="w-3.5 h-3.5 animate-spin" /> Painel Corporativo Ativo
              </span>
            )}

            {/* Luxurious Role Switcher Toggle */}
            <button
              onClick={() => {
                const nextMode = userType === 'client' ? 'salon' : 'client';
                setUserType(nextMode);
                localStorage.setItem('next_lady_user_type_preference', nextMode);
              }}
              className="bg-[#3d232e] text-amber-250 hover:bg-stone-900 font-sans text-[10px] font-extrabold uppercase px-3 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-3 border border-stone-800"
              title="Trocar de papel na plataforma"
            >
              <RefreshCw className="w-3 h-3 text-amber-400" /> {userType === 'client' ? 'Ver Salão' : 'Ver Cliente'}
            </button>
          </nav>

          {/* Right hand header actions (Notifications, Profile overview, Theme controls) */}
          <div className="flex items-center gap-3">
            
            {/* Loyalty Quick points bubble */}
            {userProfile.name && (
              <div 
                onClick={() => setActiveTab('fidelidade')}
                className="hidden sm:flex items-center gap-1.5 bg-[#3d232e] text-amber-250 py-2.5 px-4 rounded-2xl cursor-pointer hover:bg-stone-850 shadow-sm border border-stone-800 transition-colors"
                title="Consulte seus pontos Next Lady!"
              >
                <Award className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="font-mono text-xs font-bold">{userProfile.points} pts</span>
              </div>
            )}

            {/* Notification alert bells */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2.5 text-gray-500 hover:text-[#3d232e] hover:bg-rose-50/40 rounded-xl transition-all relative cursor-pointer"
                aria-label="Alertas de notificação"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification bubble drop downs */}
              <AnimatePresence>
                {showNotificationsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 bg-white border border-rose-100 rounded-3xl w-80 shadow-2xl p-4.5 z-50 space-y-3 font-sans"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-rose-50">
                      <span className="font-display font-semibold text-stone-850 text-xs">Avisos Next Lady</span>
                      <button
                        onClick={handleMarkNotificationsAllRead}
                        className="text-[10px] text-gray-400 hover:text-[#3d232e] font-bold"
                      >
                        Marcar lidas
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto scrollbar-thin">
                      {notifications.length === 0 ? (
                        <p className="text-center py-6 text-stone-400 text-xs font-light">Tudo calmo por aqui, nenhuma notificação.</p>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-xl border relative text-xs flex flex-col gap-1 transition-colors ${
                              notif.read ? 'bg-white border-rose-50 opacity-70' : 'bg-amber-500/5 border-rose-100'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-stone-850 leading-tight">{notif.title}</span>
                              <button
                                onClick={() => handleDismissNotification(notif.id)}
                                className="text-stone-300 hover:text-stone-600 text-[10px]"
                              >
                                ✕
                              </button>
                            </div>
                            <span className="text-gray-500 text-[10px] leading-relaxed">{notif.message}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Profile display avatar */}
            {userProfile.name && (
              <div 
                onClick={() => setActiveTab('configuracoes')}
                className={`flex items-center gap-2 border p-1.5 pr-3 rounded-2xl cursor-pointer hover:scale-102 transition-all select-none ${themeClasses.pfpBorder} bg-white/20`}
                title={txt('settings_title_modal', 'Configurações & Perfil')}
              >
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.name} 
                  className="w-8 h-8 rounded-full object-cover border bg-stone-100 border-[#3d232e]/10" 
                  referrerPolicy="no-referrer"
                />
                <div className="hidden sm:block text-left">
                  <span className="font-display font-semibold text-xs block line-clamp-1 leading-none">{userProfile.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-amber-500 font-sans tracking-wide leading-none capitalize font-bold mt-1 block">{userProfile.role} VIP</span>
                </div>
              </div>
            )}

            {/* settings gear quick button */}
            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`p-2 rounded-xl transition-colors border cursor-pointer ${
                activeTab === 'configuracoes'
                  ? 'bg-rose-50 border-rose-100 text-[#3d232e]'
                  : 'text-gray-400 hover:text-stone-850 hover:bg-stone-50 border-transparent'
              }`}
              title={txt('settings_title_modal', 'Configurações & Perfil')}
              aria-label="Configurações"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            {/* Mobile Nav menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-gray-500 hover:text-rose-500 hover:bg-stone-50 rounded-xl border border-rose-50"
              type="button"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`xl:hidden border-b shadow-xl px-4 py-4 space-y-1 overflow-hidden font-sans transition-colors bg-white ${themeClasses.pfpBorder}`}
          >
            <button
              onClick={() => { setActiveTab('inicio'); setMobileMenuOpen(false); }}
              className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block ${
                activeTab === 'inicio' ? themeClasses.activeTab : 'text-gray-505 hover:bg-stone-50'
              }`}
            >
              {txt('inicio', 'Início')}
            </button>
            <button
              onClick={() => { setSelectedServiceForBooking(null); setActiveTab('catalogo'); setMobileMenuOpen(false); }}
              className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block ${
                activeTab === 'catalogo' ? themeClasses.activeTab : 'text-gray-505 hover:bg-stone-50'
              }`}
            >
              {txt('catalogo', 'Procedimentos')}
            </button>
            <button
              onClick={() => { setActiveTab('loja'); setMobileMenuOpen(false); }}
              className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block ${
                activeTab === 'loja' ? themeClasses.activeTab : 'text-gray-505 hover:bg-stone-50'
              }`}
            >
              {txt('loja', 'Loja Mimos')}
            </button>
            <button
              onClick={() => { setActiveTab('fidelidade'); setMobileMenuOpen(false); }}
              className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block ${
                activeTab === 'fidelidade' ? themeClasses.activeTab : 'text-gray-505 hover:bg-stone-50'
              }`}
            >
              {txt('fidelidade', 'Loyalty HUB')}
            </button>
            <button
              onClick={() => { setActiveTab('eventos'); setMobileMenuOpen(false); }}
              className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block ${
                activeTab === 'eventos' ? themeClasses.activeTab : 'text-gray-505 hover:bg-stone-50'
              }`}
            >
              {txt('eventos', 'Cursos')}
            </button>
            <button
              onClick={() => { setActiveTab('comunidade'); setMobileMenuOpen(false); }}
              className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block ${
                activeTab === 'comunidade' ? themeClasses.activeTab : 'text-gray-505 hover:bg-stone-50'
              }`}
            >
              {txt('comunidade', 'Comunidade')}
            </button>
            <button
              onClick={() => { setActiveTab('relatorios'); setMobileMenuOpen(false); }}
              className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block ${
                activeTab === 'relatorios' ? themeClasses.activeTab : 'text-gray-505 hover:bg-stone-50'
              }`}
            >
              {txt('relatorios', 'Ata de Atividades')}
            </button>
            <button
              onClick={() => { setActiveTab('BellaAI'); setMobileMenuOpen(false); }}
              className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block flex items-center gap-1.5 ${
                activeTab === 'BellaAI' ? themeClasses.activeTab : 'text-gray-505 hover:bg-stone-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              {txt('BellaAI', 'Lady AI')}
            </button>
            <button
              onClick={() => { setActiveTab('configuracoes'); setMobileMenuOpen(false); }}
              className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block flex items-center gap-1.5 ${
                activeTab === 'configuracoes' ? themeClasses.activeTab : 'text-gray-550 hover:bg-stone-50'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              {txt('settings_title_modal', 'Configurações')}
            </button>
            {userProfile.role === 'admin' && (
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider block bg-amber-50 text-amber-700 hover:bg-amber-100"
              >
                {txt('admin', 'Módulo Admin')}
              </button>
            )}
            <div className="pt-2 border-t border-rose-100 mt-2">
              <button
                onClick={() => { setSelectedServiceForBooking(null); setActiveTab('agendar'); setMobileMenuOpen(false); }}
                className={`w-full font-bold text-xs py-3.5 px-4 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow ${themeClasses.btnAccent}`}
              >
                <Calendar className="w-4 h-4" />
                Agendar Procedimento
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body Layout Content with transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={userType + '_' + activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="focus:outline-none"
          >
            {userType === 'salon' ? (
              <SalonPanel 
                servicesDb={servicesDb}
                onUpdateServices={setServicesDb}
                productsDb={productsDb}
                onUpdateProducts={setProductsDb}
                onAddNotification={handleAddNotification}
                appointments={appointments}
                onUpdateAppointments={setAppointments}
              />
            ) : (
              <>
                {activeTab === 'inicio' && (
                  <SalonDashboard 
                    onSuggestInspo={handleChatRedirection} 
                    onNavigateToTab={setActiveTab} 
                    userProfile={userProfile}
                  />
                )}
                
                {activeTab === 'meu-estilo' && (
                  <MyStyleScanner
                    userProfile={userProfile}
                    onAddNotification={handleAddNotification}
                    onNavigateToTab={setActiveTab}
                    onUpdateUser={handleUpdateUser}
                  />
                )}
                
                {activeTab === 'catalogo' && (
                  <ServiceCatalogue 
                    onSelectService={handleSelectService} 
                    servicesDb={servicesDb}
                  />
                )}

                {activeTab === 'loja' && (
                  <OnlineShop 
                    userProfile={userProfile}
                    onUpdateUser={handleUpdateUser}
                    onAddNotification={handleAddNotification}
                  />
                )}

                {activeTab === 'fidelidade' && (
                  <LoyaltyHub 
                    userProfile={userProfile}
                    onUpdateUser={handleUpdateUser}
                    onAddNotification={handleAddNotification}
                    onNavigateToTab={setActiveTab}
                  />
                )}

                {activeTab === 'eventos' && (
                  <EventsArea 
                    userProfile={userProfile}
                    onUpdateUser={handleUpdateUser}
                    onAddNotification={handleAddNotification}
                  />
                )}

                {activeTab === 'comunidade' && (
                  <CommunityFeed 
                    userProfile={userProfile}
                    onUpdateUser={handleUpdateUser}
                    onAddNotification={handleAddNotification}
                  />
                )}

                {activeTab === 'relatorios' && (
                  <ReportHub 
                    userProfile={userProfile}
                  />
                )}

                {activeTab === 'BellaAI' && (
                  <AIPartner 
                    onSuggestService={handleServiceRecommendationBooking} 
                    userProfile={userProfile}
                  />
                )}

                {activeTab === 'agendar' && (
                  <BookingForm 
                    preselectedService={selectedServiceForBooking} 
                    onClearPreselected={() => setSelectedServiceForBooking(null)}
                    onBookingSuccess={() => setSelectedServiceForBooking(null)}
                    userProfile={userProfile}
                    onUpdateUser={handleUpdateUser}
                    onAddNotification={handleAddNotification}
                    servicesDb={servicesDb}
                    appointments={appointments}
                    onUpdateAppointments={setAppointments}
                  />
                )}

                {activeTab === 'configuracoes' && (
                  <SettingsPanel 
                    userProfile={userProfile}
                    onUpdateUser={handleUpdateUser}
                    onAddNotification={handleAddNotification}
                    onLogout={handleLogout}
                  />
                )}

                {activeTab === 'admin' && userProfile.role === 'admin' && (
                  <AdminPanel 
                    onAddNotification={handleAddNotification} 
                    userProfile={userProfile} 
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-[#150e11] text-stone-400 text-sm border-t border-stone-900 py-12 px-6 md:px-8 mt-16 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo element description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <span className="font-display font-semibold text-white tracking-wider uppercase text-xs">Next Lady Club</span>
            </div>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Inovando o visagismo, estética integrativa e a capacitação feminina. Somos o primeiro ecossistema comunitário onde sua credencial inicia VIP gratuitamente, colhendo pontos e mimos de luxo a cada visita.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-medium text-stone-200 tracking-wider text-xs uppercase">Especialidades Estéticas</h5>
            <ul className="space-y-1.5 text-xs font-light text-stone-400">
              <li>Corte de Cabelo Visagista & Coloração</li>
              <li>Tranças Afro & Boxer Braids</li>
              <li>Próteses de Unhas Molde em Gel</li>
              <li>Fototerapia Facial, SPA & Drenagens</li>
            </ul>
          </div>

          <div className="space-y-3 font-sans">
            <h5 className="font-display font-medium text-stone-200 tracking-wider text-xs uppercase">Unidade Imperial</h5>
            <ul className="space-y-1.5 text-xs font-light text-stone-400">
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-500" /> Alameda das Orquídeas Real, 500 — Jardins</li>
              <li className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-500" /> WhatsApp: (11) 99123-4567</li>
              <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-500" /> bemvinda@nextlady.com.br</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-display font-medium text-stone-200 tracking-wider text-xs uppercase">Mídias Sociais</h5>
            <p className="text-xs text-stone-400 font-light leading-normal">Encontre resenhas e faça amizades com outras Ladies no Instagram:</p>
            <div className="flex items-center gap-3 pt-1">
              <a 
                href="#inicio" 
                className="w-8 h-8 rounded-full bg-stone-900 border border-stone-850 flex items-center justify-center text-rose-450 hover:text-white hover:bg-rose-500 hover:border-transparent transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <span className="text-[10px] text-stone-500 font-mono">@nextlady_aesthetics</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-stone-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 Next Lady S/A. CNPJ e Marcas Registradas sob privacidade comunitária.</p>
          <p className="flex items-center gap-1 text-stone-500"><ShieldCheck className="w-3.5 h-3.5 text-[#3d232e]" /> Plataforma Segura • Design com Rose Gold & Luxo</p>
        </div>
      </footer>

    </div>
  );
}
