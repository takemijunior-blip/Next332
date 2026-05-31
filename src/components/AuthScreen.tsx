import React, { useState, FormEvent } from 'react';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Sparkles, Sliders, RefreshCw, ChevronRight, Mail, Lock, User, Phone, MapPin, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { t } from '../i18n';

interface AuthScreenProps {
  onAuthSuccess: (profile: UserProfile, typePref: 'client' | 'salon') => void;
  onAddNotification: (title: string, msg: string, type: any) => void;
}

type AuthMode = 'login' | 'register_client' | 'register_salon' | 'forgot_password';

export default function AuthScreen({
  onAuthSuccess,
  onAddNotification
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [rememberMe, setRememberMe] = useState(true);

  // Google Onboarding specific state
  const [googleUser, setGoogleUser] = useState<{
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    selectedRole: 'client' | 'salon';
    nameInput: string;
    whatsappInput: string;
    locationInput: string;
    businessHoursInput: string;
  } | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [businessHours, setBusinessHours] = useState('');

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Symmetrical CSS mappings for branding
  const primaryBrandBg = "bg-[#3d232e]";
  const goldenAccentClass = "text-amber-250";

  // Switch modes safely and clear states
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  // Login handler
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Por favor, informe suas credenciais de segurança!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Set persistence according to RememberMe checkbox
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      // Perform Auth Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const user = userCredential.user;

      // Loaded User Profile from Firestore to synchronize preferences
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      let loadedProfile: UserProfile;

      if (userSnap.exists()) {
        loadedProfile = userSnap.data() as UserProfile;
      } else {
        // Fallback or self construction if user document was deleted (or old auth record)
        const emailLower = user.email || email.trim().toLowerCase();
        const isAdminMail = emailLower === 'takemijunior@gmail.com' || emailLower === 'admin@nextlady.com';
        loadedProfile = {
          name: user.displayName || 'Utilizadora VIP',
          age: '28',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
          points: 200,
          role: isAdminMail ? 'admin' : 'client',
          favoriteProducts: [],
          rsvpEvents: [],
          redeemedRewards: [],
          isDarkTheme: false,
          email: emailLower,
          isBanned: false,
          language: 'pt',
          theme: 'rose'
        };
        await setDoc(userDocRef, loadedProfile);
      }

      onAddNotification(
        'Sessão Iniciada! 👑', 
        `Bem-vinda de volta ao ecossistema Next Lady, ${loadedProfile.name}!`, 
        'sistema'
      );
      
      // On success pass down to parent App.tsx
      const preferredType = loadedProfile.role === 'salon' ? 'salon' : 'client';
      onAuthSuccess(loadedProfile, preferredType);

    } catch (err: any) {
      console.error(err);
      let transError = 'E-mail ou credenciais inválidas. Verifique sua digitação.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        transError = 'E-mail ou palavra-passe incorreta.';
      } else if (err.code === 'auth/invalid-email') {
        transError = 'O formato do e-mail inserido é inválido.';
      } else if (err.code === 'auth/user-disabled') {
        transError = 'Esta conta foi suspensa temporariamente pela administração.';
      }
      setErrorMsg(transError);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up (Client or Salon)
  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Common validations
    if (!email.trim() || !password || !name.trim() || !whatsapp.trim() || !location.trim()) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A palavra-passe deve conter no mínimo 6 caracteres por segurança.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As palavras-passes informadas não batem! Verifique a digitação.');
      return;
    }

    if (mode === 'register_salon' && !businessHours.trim()) {
      setErrorMsg('Por favor, informe o seu horário de funcionamento comercial!');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Firebase Auth user
      const emailLower = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, emailLower, password);
      const user = userCredential.user;

      // Define standard user role
      let finalRole: 'client' | 'salon' | 'admin' = 'client';
      if (mode === 'register_salon') {
        finalRole = 'salon';
      }
      // Check predefined absolute admin roles values
      if (emailLower === 'takemijunior@gmail.com' || emailLower === 'admin@nextlady.com') {
        finalRole = 'admin';
      }

      // Assemble full UserProfile
      const initialProfile: UserProfile = {
        name: name.trim(),
        age: '28', // Placeholder initial age
        avatar: mode === 'register_salon' 
          ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=150'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        points: 200, // Gift of joining
        role: finalRole,
        favoriteProducts: [],
        rsvpEvents: [],
        redeemedRewards: [],
        isDarkTheme: false,
        email: emailLower,
        whatsapp: whatsapp.trim(),
        location: location.trim(),
        businessHours: mode === 'register_salon' ? businessHours.trim() : '',
        isBanned: false,
        language: 'pt',
        theme: 'rose'
      };

      // 2. Save profile document to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, initialProfile);

      onAddNotification(
        'Membro Cadastrado! 👑',
        `Sua credencial Next Lady VIP foi gerada, ${name}! +200 pontos creditados de presente.`,
        'sistema'
      );

      // Trigger successful passback
      const preferredType = finalRole === 'salon' ? 'salon' : 'client';
      onAuthSuccess(initialProfile, preferredType);

    } catch (err: any) {
      console.error(err);
      let transError = 'Falha ao registrar utilizador. Tente novamente.';
      if (err.code === 'auth/email-already-in-use') {
        transError = 'Este endereço de e-mail já está associado a outra conta VIP ativa.';
      } else if (err.code === 'auth/invalid-email') {
        transError = 'O formato do e-mail inserido é inválido.';
      } else if (err.code === 'auth/weak-password') {
        transError = 'A palavra-passe escolhida é fraca de segurança.';
      }
      setErrorMsg(transError);
    } finally {
      setIsLoading(false);
    }
  };

  // Password Recovery Reset Email
  const handleForgotReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Por favor, informe seu endereço de e-mail cadastrado!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setSuccessMsg('E-mail enviado! Verifique seu lixo eletrônico ou caixa de entrada para redefinir sua senha.');
      setEmail('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Não encontramos nenhuma conta com o e-mail informado.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Loaded User Profile from Firestore to synchronize preferences
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const loadedProfile = userSnap.data() as UserProfile;
        
        // Safeguard for admin sign in with Google
        const emailLower = (user.email || '').toLowerCase().trim();
        const isAdminMail = emailLower === 'takemijunior@gmail.com' || emailLower === 'admin@nextlady.com';
        if (isAdminMail && loadedProfile.role !== 'admin') {
          loadedProfile.role = 'admin';
          await setDoc(userDocRef, { role: 'admin' }, { merge: true });
        }

        onAddNotification(
          'Sessão Iniciada! 👑', 
          `Bem-vinda de volta ao ecossistema Next Lady, ${loadedProfile.name}!`, 
          'sistema'
        );
        onAuthSuccess(loadedProfile, loadedProfile.role === 'salon' ? 'salon' : 'client');
      } else {
        // Prepare onboarding state because they are a first-time Google sign-in user!
        const defaultRole = mode === 'register_salon' ? 'salon' : 'client';
        setGoogleUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          selectedRole: defaultRole,
          nameInput: user.displayName || '',
          whatsappInput: '',
          locationInput: '',
          businessHoursInput: ''
        });
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('O processo de login com o Google foi fechado antes de ser concluído.');
      } else if (err.code === 'auth/blocked-by-popup-trigger') {
        setErrorMsg('O popup de login do Google foi bloqueado pelo seu navegador.');
      } else {
        setErrorMsg('Erro ao autenticar com o Google. Se estiver num iframe, clique para abrir o app em nova aba.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Onboarding Submission handler
  const handleGoogleOnboardingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!googleUser) return;

    const { uid, email, photoURL, selectedRole, nameInput, whatsappInput, locationInput, businessHoursInput } = googleUser;

    if (!nameInput.trim() || !whatsappInput.trim() || !locationInput.trim()) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    if (selectedRole === 'salon' && !businessHoursInput.trim()) {
      setErrorMsg('Por favor, informe o seu horário de funcionamento comercial!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const emailLower = (email || '').toLowerCase().trim();
      const isAdminMail = emailLower === 'takemijunior@gmail.com' || emailLower === 'admin@nextlady.com';
      const finalRole = isAdminMail ? 'admin' : selectedRole;

      const newUserProfile: UserProfile = {
        name: nameInput.trim(),
        age: '28',
        avatar: photoURL || (selectedRole === 'salon' 
          ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=150'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'),
        points: 200, // Present points
        role: finalRole,
        favoriteProducts: [],
        rsvpEvents: [],
        redeemedRewards: [],
        isDarkTheme: false,
        email: emailLower,
        whatsapp: whatsappInput.trim(),
        location: locationInput.trim(),
        businessHours: selectedRole === 'salon' ? businessHoursInput.trim() : '',
        isBanned: false,
        language: 'pt',
        theme: 'rose'
      };

      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, newUserProfile);

      onAddNotification(
        'Membro Cadastrado! 👑',
        `Sua conta Next Lady VIP foi ativada com o Google, ${nameInput}! +200 pontos creditados com carinho.`,
        'sistema'
      );

      onAuthSuccess(newUserProfile, finalRole === 'salon' ? 'salon' : 'client');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Ocorreu um erro ao salvar o perfil no banco de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render google sign-in button
  const renderGoogleButton = () => (
    <>
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-stone-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-stone-400 text-[10px] font-bold tracking-wider">ou</span>
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer font-sans"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.66-.61-1.09-1.37-1.35-2.09z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continuar com Google</span>
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#faf8f8] flex items-center justify-center p-4 sm:p-6 text-stone-850 font-sans relative overflow-x-hidden overflow-y-auto" id="auth-screen-layout">
      {/* Golden & Rose Lux decorative spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-rose-100/40 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl" />
      
      <div className="max-w-md w-full relative z-10 space-y-6 py-6 animate-fadeIn">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#3d232e] text-amber-250 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-xl border border-amber-900/15 animate-pulse">
            👑
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-stone-900 tracking-wide uppercase leading-none">Next Lady</h1>
            <span className="text-[10px] text-rose-500 uppercase tracking-widest font-black block mt-1.5 font-sans">
              Intelligent Beauty & VIP Club
            </span>
          </div>
        </div>

        {/* Dynamic Card Container */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Switch Subtabs for login vs modes */}
          {(!googleUser && mode !== 'forgot_password') && (
            <div className="flex bg-stone-50 border border-stone-100 rounded-2xl p-1 gap-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login' ? 'bg-[#3d232e] text-white shadow' : 'text-stone-500 hover:text-[#3d232e]'
                }`}
              >
                Conectar
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register_client' ? 'bg-[#3d232e] text-white shadow' : 'text-stone-500 hover:text-[#3d232e]'
                }`}
                onClick={() => switchMode('register_client')}
              >
                Cliente VIP
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register_salon' ? 'bg-[#3d232e] text-white shadow' : 'text-stone-500 hover:text-[#3d232e]'
                }`}
                onClick={() => switchMode('register_salon')}
              >
                Salão Parceiro
              </button>
            </div>
          )}

          {/* Validation Feedbacks */}
          {errorMsg && (
            <div className="bg-red-550/5 text-red-650 px-4 py-3 rounded-xl text-[11px] font-medium leading-relaxed flex items-center gap-2 border border-red-200/50">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/5 text-emerald-700 px-4 py-3 rounded-xl text-[11px] font-medium leading-relaxed flex items-center gap-2 border border-emerald-200/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {googleUser ? (
            /* Google Onboarding Form */
            <form onSubmit={handleGoogleOnboardingSubmit} className="space-y-4 animate-fadeIn">
              <div className="space-y-2 text-center pb-2">
                <div className="relative w-16 h-16 mx-auto mb-1">
                  <img
                    src={googleUser.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 shadow-md"
                    referrerPolicy="no-referrer"
                    alt="Google Perfil"
                  />
                  <div className="absolute bottom-0 right-0 bg-[#3d232e] text-amber-250 text-[9px] font-bold px-1 rounded-full shadow border border-white">
                    G
                  </div>
                </div>
                <h3 className="text-sm font-bold text-stone-900 uppercase">Cadastro Rápido via Google</h3>
                <p className="text-[10px] text-stone-500 font-sans leading-none block">
                  {googleUser.email || ''}
                </p>
              </div>

              {/* If they are not predefined admin, let them choose their role */}
              {!( (googleUser.email || '').toLowerCase().trim() === 'takemijunior@gmail.com' || (googleUser.email || '').toLowerCase().trim() === 'admin@nextlady.com' ) && (
                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block font-bold">Tipo de Perfil</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGoogleUser({ ...googleUser, selectedRole: 'client' })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex gap-1 items-center justify-center ${
                        googleUser.selectedRole === 'client'
                          ? 'bg-[#3d232e] text-amber-250 border-[#3d232e]'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      👒 Cliente VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoogleUser({ ...googleUser, selectedRole: 'salon' })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex gap-1 items-center justify-center ${
                        googleUser.selectedRole === 'salon'
                          ? 'bg-[#3d232e] text-amber-250 border-[#3d232e]'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      ✂️ Salão Parceiro
                    </button>
                  </div>
                </div>
              )}

              {/* Form field prefilled name (only needed if salon, or allowed to customize) */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">
                  {googleUser.selectedRole === 'salon' ? 'Nome do Salão' : 'Nome Completo'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder={googleUser.selectedRole === 'salon' ? 'Studio Real Glow & Estética' : 'Seu nome completo'}
                    value={googleUser.nameInput}
                    onChange={(e) => setGoogleUser({ ...googleUser, nameInput: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Contacto WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="(11) 99123-4567"
                    value={googleUser.whatsappInput}
                    onChange={(e) => setGoogleUser({ ...googleUser, whatsappInput: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>
              </div>

              {/* Location/Localização */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Localização (Bairro/Cidade)</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jardins, São Paulo"
                    value={googleUser.locationInput}
                    onChange={(e) => setGoogleUser({ ...googleUser, locationInput: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                  />
                </div>
              </div>

              {/* If Salão: Horário de funcionamento */}
              {googleUser.selectedRole === 'salon' && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Horário de Funcionamento</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Terça a Sábado - 09h às 19h"
                      value={googleUser.businessHoursInput}
                      onChange={(e) => setGoogleUser({ ...googleUser, businessHoursInput: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3d232e] hover:bg-stone-900 text-amber-250 py-3.5 rounded-2xl text-xs font-bold font-sans transition-all shadow-md mt-4 cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                {isLoading ? 'Concluindo cadastro...' : 'Concluir Meu Cadastro Rápido (+200 pts)'}
                <ChevronRight className="w-4 h-4 text-amber-200" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setGoogleUser(null);
                  auth.signOut();
                }}
                className="w-full text-center text-xs font-bold text-stone-500 hover:text-red-500 pt-2 cursor-pointer transition-colors block font-sans"
              >
                Cancelar / Voltar
              </button>
            </form>
          ) : (
            <>
              {/* MODE: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Endereço de E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="mariana@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Palavra-passe (Senha)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="password"
                    required
                    placeholder="Sua senha de acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>
              </div>

              {/* Remember and Recovery Actions */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <label className="flex items-center gap-1.5 text-stone-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-[#3d232e] focus:ring-[#3d232e] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Lembrar utilizador</span>
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot_password')}
                  className="text-stone-500 hover:text-rose-600 font-semibold underline underline-offset-2 hover:no-underline cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3d232e] hover:bg-stone-900 text-amber-250 py-3.5 rounded-2xl text-xs font-bold font-sans transition-all shadow-md mt-4 cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                {isLoading ? 'Conectando...' : 'Conectar à Next Lady'}
                <ChevronRight className="w-4 h-4 text-amber-200" />
              </button>

              {renderGoogleButton()}

              <div className="bg-amber-500/5 text-amber-800 rounded-xl p-3 border border-amber-500/10 text-[10px] leading-relaxed space-y-1 mt-4">
                <p className="font-semibold text-[10.5px]">💡 Guia para Testes Administrativos:</p>
                <p className="font-light">Você pode logar com o e-mail central <strong className="font-bold font-mono">admin@nextlady.com</strong> ou com o seu e-mail pessoal para obter permissões de Administrador.</p>
              </div>
            </form>
          )}

          {/* MODE: CLIENT REGSITRATION */}
          {mode === 'register_client' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Princesa Mariana Vasconcelos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Endereço de E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="mariana@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Contacto WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="(11) 99123-4567"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Localização (Cidade)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="São Paulo, SP"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Palavra-passe (Senha)</label>
                  <input
                    type="password"
                    required
                    placeholder="Mín. 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Confirmar Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirme"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3d232e] hover:bg-stone-900 text-amber-250 py-3.5 rounded-2xl text-xs font-bold font-sans transition-all shadow-md mt-4 cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                {isLoading ? 'Registrando Princesa...' : 'Garantir Credencial Lady VIP (+200 pts)'}
                <ChevronRight className="w-4 h-4 text-amber-200" />
              </button>

              {renderGoogleButton()}
            </form>
          )}

          {/* MODE: SALON REGISTRATION */}
          {mode === 'register_salon' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Nome do Salão</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Studio Real Glow & Estética"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="contato@studiosalao.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">WhatsApp Comercial</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="(11) 99123-4567"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Localização (Endereço)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Jardins, São Paulo"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Horário de Funcionamento</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Terça a Sábado - 09h às 19h"
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Palavra-passe (Senha)</label>
                  <input
                    type="password"
                    required
                    placeholder="Mín. 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">Confirmar Senha</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirme"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3d232e] hover:bg-stone-900 text-amber-250 py-3.5 rounded-2xl text-xs font-bold font-sans transition-all shadow-md mt-4 cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                {isLoading ? 'Registrando Salão...' : 'Garantir Credencial Salão Premium (+200 pts)'}
                <ChevronRight className="w-4 h-4 text-amber-200" />
              </button>

              {renderGoogleButton()}
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotReset} className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-stone-800">Recuperar Palavra-passe</h4>
                <p className="text-[10.5px] text-stone-400 font-sans font-light leading-relaxed">
                  Insira o seu e-mail de acesso cadastrado abaixo. O Next Lady enviará imediatamente um link para redefinir sua senha com segurança.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase tracking-wider block">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="mariana@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3d232e] hover:bg-stone-900 text-amber-250 py-3.5 rounded-2xl text-xs font-bold font-sans transition-all shadow-md mt-2 cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                {isLoading ? 'A processar...' : 'Enviar link de recuperação por e-mail'}
                <ChevronRight className="w-4 h-4 text-amber-200" />
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center text-xs font-bold text-stone-500 hover:text-[#3d232e] pt-2 cursor-pointer transition-colors block"
              >
                Voltar para ligar sessão
              </button>
            </form>
          )}
          </>
          )}

        </div>

      </div>
    </div>
  );
}
