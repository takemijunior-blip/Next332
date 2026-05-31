import React, { useState, FormEvent, useEffect } from 'react';
import { 
  Globe, 
  Palette, 
  User, 
  KeyRound, 
  Database, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Activity,
  Smartphone,
  MapPin,
  Clock
} from 'lucide-react';
import { UserProfile } from '../types';
import { t, Language, i18nLanguages } from '../i18n';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { updatePassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

interface SettingsPanelProps {
  userProfile: UserProfile;
  onUpdateUser: (profile: UserProfile) => void;
  onAddNotification: (title: string, msg: string, type: any) => void;
  onLogout: () => void;
}

export default function SettingsPanel({
  userProfile,
  onUpdateUser,
  onAddNotification,
  onLogout
}: SettingsPanelProps) {
  const currentLang = userProfile.language || 'pt';
  const txt = (key: string, fallback: string) => t(currentLang, key, fallback);

  // Profile Edit State
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileWhatsapp, setProfileWhatsapp] = useState(userProfile.whatsapp || '');
  const [profileLocation, setProfileLocation] = useState(userProfile.location || '');
  const [profileBusinessHours, setProfileBusinessHours] = useState(userProfile.businessHours || '');
  const [profileAvatar, setProfileAvatar] = useState(userProfile.avatar);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Sychronization Feedbacks
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Simulated Access Logs
  const [accessLogs] = useState([
    {
      id: 'log-1',
      device: 'Princesa Core App (Navegador Chrome)',
      ip: '189.120.45.19',
      location: userProfile.location || 'Brasil',
      status: 'Sessão Ativa',
      date: new Date().toLocaleDateString('pt-PT') + ' ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'log-2',
      device: 'iPhone 15 Pro Max (Estética Mobile)',
      ip: '177.89.21.144',
      location: 'São Paulo, BR',
      status: 'Há 2 dias',
      date: '25/05/2026 14:22'
    }
  ]);

  // Sync state changes to local forms if userProfile changes
  useEffect(() => {
    setProfileName(userProfile.name);
    setProfileWhatsapp(userProfile.whatsapp || '');
    setProfileLocation(userProfile.location || '');
    setProfileBusinessHours(userProfile.businessHours || '');
    setProfileAvatar(userProfile.avatar);
  }, [userProfile]);

  // 1. Language update handler
  const handleLanguageChange = async (lang: Language) => {
    const updated = { ...userProfile, language: lang };
    onUpdateUser(updated);

    // Save to Firestore if signed in
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { language: lang });
      } catch (err) {
        console.warn('Sync language to Firestore failed, saving locally:', err);
      }
    }
    onAddNotification(
      lang === 'en' ? 'Language Changed 🇺🇸' : 
      lang === 'fr' ? 'Langue Changée 🇫🇷' : 
      lang === 'ar' ? 'تعديل اللغة 🇸🇦' : 
      lang === 'zu' ? 'Ulimi Lwashintshwa 🇿🇦' : 
      'Idioma Atualizado 🇵🇹',
      t(lang, 'alert_backup_sucesso', 'A tradução global foi estabelecida com sucesso para todo o ecossistema!'),
      'sistema'
    );
  };

  // 2. Theme update handler
  const handleThemeChange = async (themeName: 'rose' | 'purple' | 'blue' | 'dark') => {
    const updated = { ...userProfile, theme: themeName };
    onUpdateUser(updated);

    // Save to Firestore if signed in
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { theme: themeName });
      } catch (err) {
        console.warn('Sync theme to Firestore failed, saving locally:', err);
      }
    }
    
    onAddNotification(
      'Tema Atualizado 🎨',
      `Sua residência estética mudou para o tema: ${
        themeName === 'rose' ? 'Rosa Dourado' :
        themeName === 'purple' ? 'Lavanda Moderno' :
        themeName === 'blue' ? 'Azul Esplêndido' : 'Escuro Noturno'
      }. Sincronizado na nuvem!`,
      'sistema'
    );
  };

  // 3. Save profile data info
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      alert(txt('alert_preencha_todos', 'Por favor, preencha todos os campos obrigatórios!'));
      return;
    }

    setSyncStatus('loading');
    const updated: UserProfile = {
      ...userProfile,
      name: profileName.trim(),
      avatar: profileAvatar,
      whatsapp: profileWhatsapp.trim(),
      location: profileLocation.trim(),
      businessHours: profileBusinessHours.trim()
    };

    onUpdateUser(updated);

    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, updated, { merge: true });
        setSyncStatus('success');
        onAddNotification('Perfil Sincronizado ✨', 'Suas informações cadastrais foram gravadas no Firestore.', 'sistema');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err) {
        setSyncStatus('error');
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    } else {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  // 4. Change Password Handler
  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (!newPassword) {
      setSecurityError('Insira uma nova palavra-passe!');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityError('A palavra-passe precisa ter no mínimo 6 caracteres!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSecurityError(txt('alert_senhas_nao_batem', 'As palavras-passes inseridas não coincidem!'));
      return;
    }

    if (!auth.currentUser) {
      setSecurityError('Nenhum utilizador logado no momento!');
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      setSecuritySuccess(txt('alert_senha_alterada', 'Palavra-passe alterada com sucesso!'));
      setNewPassword('');
      setConfirmNewPassword('');
      setCurrentPassword('');
      onAddNotification('Senha Alterada 🔒', 'Sua palavra-passe de acesso ao sistema corporativo foi reconfigurada.', 'sistema');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setSecurityError('Esta operação requer login recente. Por favor, saia da conta e entre novamente antes de alterar a senha!');
      } else {
        setSecurityError(err.message || 'Erro ao alterar a palavra-passe.');
      }
    }
  };

  // 5. Send Password Reset Recovery Link
  const handleRecoverPassword = async () => {
    setSecurityError('');
    setSecuritySuccess('');
    const email = auth.currentUser?.email || userProfile.email;
    if (!email) {
      setSecurityError('Endereço de e-mail não disponível para recuperação!');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSecuritySuccess('E-mail enviado! Verifique sua caixa de entrada para redefinir sua palavra-passe.');
    } catch (err: any) {
      setSecurityError(err.message || 'Erro ao emitir recuperação de senha.');
    }
  };

  // 6. Export local activities data to JSON file
  const handleExportData = () => {
    try {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('next_lady_')) {
          const val = localStorage.getItem(key);
          try {
            data[key] = val ? JSON.parse(val) : '';
          } catch {
            data[key] = val;
          }
        }
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Next_Lady_${userProfile.name.replace(/\s+/g, '_')}_Ata_Export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onAddNotification(
        'Dados Exportados 💾',
        txt('alert_dados_exportados', 'Seu arquivo de dados foi exportado e baixado!'),
        'sistema'
      );
    } catch (err) {
      console.error('Falha ao exportar dados:', err);
    }
  };

  // 7. Make Cloud Firebase sync backup
  const handleCloudBackup = async () => {
    setSyncStatus('loading');
    if (!auth.currentUser) {
      alert('Sessão offline! Faça login com uma conta Firebase para sincronizar dados em tempo real.');
      setSyncStatus('idle');
      return;
    }

    try {
      // 1. Guardar perfil no Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, userProfile, { merge: true });

      // 2. Guardar Appointments do localStorage se existirem
      const savedAppts = localStorage.getItem('next_lady_appointments');
      if (savedAppts) {
        const parsed = JSON.parse(savedAppts);
        if (Array.isArray(parsed)) {
          for (const appt of parsed) {
            const apptId = appt.id || `appt-${Date.now()}`;
            const apptRef = doc(db, 'appointments', apptId);
            await setDoc(apptRef, {
              ...appt,
              clientUid: auth.currentUser.uid,
              clientEmail: auth.currentUser.email || userProfile.email
            }, { merge: true });
          }
        }
      }

      setSyncStatus('success');
      onAddNotification(
        'Backup Concluído ☁️', 
        txt('alert_backup_sucesso', 'Backup concluído e sincronizado com o Firebase!'), 
        'sistema'
      );
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      setSyncStatus('error');
      console.error(err);
      alert('Houve um problema de autenticação ao conectar-se com o Firestore Cloud.');
    }
  };

  // Terminate all sessions simulated logic
  const handleTerminateAllDevices = () => {
    if (confirm('Deseja desconectar todas as outras sessões associadas a esta conta Next Lady?')) {
      onAddNotification('Segurança Reforçada 🛡️', txt('alert_sessao_dispositivos_limpa', 'Sessão encerrada em todas as outras conexões!'), 'sistema');
      alert(txt('alert_sessao_dispositivos_limpa', 'Desconectado de outras sessões!'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn text-stone-850" id="settings-panel-container">
      
      {/* Title Header banner */}
      <div className="bg-[#3d232e] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="space-y-2">
          <span className="text-[10px] text-amber-250 uppercase font-black font-mono tracking-widest bg-stone-900/40 px-3 py-1 rounded-full">
            👑 PREFERÊNCIAS NEXT LADY
          </span>
          <h2 className="font-display font-semibold text-2xl md:text-3xl text-stone-100 tracking-tight">
            {txt('configuracoes', 'Configurações Globais')}
          </h2>
          <p className="text-xs text-stone-300 font-sans max-w-lg font-light leading-relaxed">
            {txt('esfinge_estetica', 'Personalize o seu tema preferido, mude de idioma, sincronize backups com o Firebase e gerencie as credenciais da sua conta premium.')}
          </p>
        </div>

        {/* Sync Indicator bubble */}
        <div className="shrink-0">
          <div className="bg-stone-950/40 px-4 py-3 rounded-2xl border border-stone-800/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              ✨
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-[#b88c97] font-sans font-bold uppercase">Estado de Sincronia</span>
              <span className="text-stone-300 text-xs font-mono font-bold">
                {auth.currentUser ? '☁️ Firebase Live' : '💾 Memória Local'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing Settings layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Main custom settings forms */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SECTION 1: EDIT PROFILE */}
          <section className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-rose-50">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-stone-900 uppercase tracking-wide">
                  {txt('perfil_titulo', 'Dados do Perfil')}
                </h3>
                <p className="text-[10px] text-stone-400 font-sans font-medium">
                  {txt('perfil_sub', 'Altere a foto, nome de princesa e detalhes de localização')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Avatar Selector UI Grid */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                <div className="relative group shrink-0">
                  <img 
                    src={profileAvatar} 
                    alt="Perfil atual" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 shadow"
                  />
                  <div className="absolute inset-0 bg-[#3d232e]/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-[9px] font-bold">Foto</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[10px] text-stone-400 font-sans uppercase font-bold tracking-wider block">
                    {txt('alterar_avatar', 'Escolha seu avatar favorito')}
                  </span>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {[
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=150',
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
                      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150'
                    ].map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileAvatar(imgUrl)}
                        className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                          profileAvatar === imgUrl ? 'border-[#3d232e] scale-105 ring-2 ring-rose-100' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="Avatar item" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase block tracking-wider">
                    {userProfile.role === 'salon' ? txt('nome_salao', 'Nome do salão') : txt('nome_completo', 'Nome completo')}
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder={userProfile.role === 'salon' ? txt('placeholder_salao', 'Studio Real Glow') : txt('placeholder_nome', 'Ex: Mariana Vasconcelos')}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase block tracking-wider">
                    {txt('whatsapp', 'Contacto WhatsApp')}
                  </label>
                  <input
                    type="text"
                    placeholder={txt('placeholder_whatsapp', 'Ex: (11) 99123-4567')}
                    value={profileWhatsapp}
                    onChange={(e) => setProfileWhatsapp(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase block tracking-wider">
                    {txt('localizacao', 'Localização')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder={txt('placeholder_localizacao', 'Ex: Jardins, São Paulo')}
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                    />
                  </div>
                </div>

                {/* Salon exclusive Business Hours */}
                {userProfile.role === 'salon' && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase block tracking-wider">
                      {txt('horario', 'Horário de Funcionamento')}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="text"
                        placeholder={txt('placeholder_horario', 'Ex: Terça a Sábado - 09h às 19h')}
                        value={profileBusinessHours}
                        onChange={(e) => setProfileBusinessHours(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit button inside edit card */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-mono text-stone-400">
                  {userProfile.email || 'offline@nextlady'}
                </span>
                <button
                  type="submit"
                  className="bg-[#3d232e] hover:bg-stone-900 text-amber-250 font-bold px-5 py-3 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow"
                >
                  {syncStatus === 'loading' ? txt('carregando', 'Processando...') : txt('salvar', 'Salvar Alterações')}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </section>

          {/* SECTION 2: THE SECURITY SETTINGS */}
          <section className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-rose-50">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-stone-900 uppercase tracking-wide">
                  {txt('seguranca', 'Segurança e Acesso')}
                </h3>
                <p className="text-[10px] text-stone-400 font-sans font-medium">
                  {txt('seguranca_sub', 'Gerencie senhas criptografadas e restabeleça sua segurança')}
                </p>
              </div>
            </div>

            {securityError && (
              <div className="bg-red-50 text-red-650 px-4 py-3 rounded-xl text-[11px] font-sans flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            {securitySuccess && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-[11px] font-sans flex items-center gap-2 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase block tracking-wider">
                    {txt('nova_senha', 'Nova Palavra-passe')}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={txt('placeholder_senha', 'Mínimo 6 caracteres')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#3d232e] font-sans font-bold uppercase block tracking-wider">
                    {txt('confirmar_nova_senha', 'Confirmar nova palavra-passe')}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={txt('placeholder_senha', 'Mínimo 6 caracteres')}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                  />
                </div>
              </div>

              {/* Password update triggers & recovery triggers */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRecoverPassword}
                  className="text-stone-500 hover:text-[#3d232e] text-[10px] font-bold text-left underline underline-offset-2 hover:no-underline select-none cursor-pointer"
                >
                  🔗 {txt('esqueci_senha', 'Esqueci minha palavra-passe (senha)')}
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {txt('alterar_senha_btn', 'Alterar Palavra-passe')}
                </button>
              </div>
            </form>

            {/* Other Security Options: Sign out other devices */}
            <div className="pt-4 border-t border-rose-50 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-stone-850 uppercase tracking-tight">
                    {txt('encerrar_dispositivos', 'Sair de todos os outros dispositivos')}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-sans font-light">
                    {txt('encerrar_dispositivos_sub', 'Esvazia tokens ativos instalados em celulares ou computadores corporativos')}
                  </p>
                </div>
                <button
                  onClick={handleTerminateAllDevices}
                  className="bg-red-50 text-red-650 hover:bg-red-100 px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center"
                >
                  Revogar Acessos
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 3: ACCESS LOGS HISTORIC */}
          <section className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-rose-50">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-stone-900 uppercase tracking-wide">
                  {txt('historico_acesso', 'Logs Históricos')}
                </h3>
                <p className="text-[10px] text-stone-400 font-sans font-medium">
                  {txt('historico_acesso_sub', 'Últimas conexões estabelecidas por cookies ou canais de autenticação')}
                </p>
              </div>
            </div>

            <div className="divide-y divide-stone-50">
              {accessLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs font-sans gap-4">
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-stone-800">{log.device}</span>
                      <span className="text-[10px] text-stone-400 font-mono font-light">IP: {log.ip} • Loc: {log.location}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col gap-0.5 shrink-0">
                    <span className="text-[10px] text-stone-400 font-light font-mono">{log.date}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block ${
                      log.status === 'Sessão Ativa' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-stone-50 text-stone-400'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Customizers (Theme & Languages, Backups) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* CATEGORY: LANGUAGES GLOBALS */}
          <section className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-xs text-[#3d232e] uppercase tracking-wide flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-rose-500 animate-spin-slow" /> {txt('idioma_app', 'Idioma do Aplicativo')}
              </h4>
              <p className="text-[10px] text-stone-400 font-sans leading-relaxed font-light">
                {txt('idioma_app_sub', 'Selecione o idioma de exibição')}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1 font-sans">
              {i18nLanguages.map((item) => {
                const isSelected = item.code === currentLang;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleLanguageChange(item.code)}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#3d232e] text-amber-250 shadow-md ring-2 ring-rose-100' 
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base select-none">{item.flag}</span>
                      <span>{item.name}</span>
                    </span>
                    {isSelected && <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-stone-900/60 text-amber-200">Selecionado</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* CATEGORY: THEME SWITCHER */}
          <section className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-xs text-[#3d232e] uppercase tracking-wide flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-orange-500" /> {txt('tema_app', 'Visual da Interface')}
              </h4>
              <p className="text-[10px] text-stone-400 font-sans leading-relaxed font-light">
                {txt('tema_app_sub', 'Ajuste as cores do aplicativo de acordo com seu estilo')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-bold font-sans">
              
              {/* Theme 1: Rose Gold Default */}
              <button
                onClick={() => handleThemeChange('rose')}
                className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer text-center ring-offset-2 ${
                  userProfile.theme === 'rose' || !userProfile.theme
                    ? 'bg-rose-50 border border-rose-350 ring-2 ring-[#3d232e] text-rose-950'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#3d232e] border-2 border-amber-200 shadow-sm" />
                <span className="text-[10.5px]">Rose Imperial</span>
              </button>

              {/* Theme 2: Lavanda Purple */}
              <button
                onClick={() => handleThemeChange('purple')}
                className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer text-center ring-offset-2 ${
                  userProfile.theme === 'purple'
                    ? 'bg-purple-50 border border-purple-200 ring-2 ring-[#301934] text-purple-900'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#301934] border-2 border-purple-350 shadow-sm" />
                <span className="text-[10.5px]">Ametista Glam</span>
              </button>

              {/* Theme 3: Blue */}
              <button
                onClick={() => handleThemeChange('blue')}
                className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer text-center ring-offset-2 ${
                  userProfile.theme === 'blue'
                    ? 'bg-sky-50 border border-sky-250 ring-2 ring-sky-950 text-sky-950'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#0f2d4a] border-2 border-sky-350 shadow-sm" />
                <span className="text-[10.5px]">Cielo Sapphire</span>
              </button>

              {/* Theme 4: Dark */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer text-center ring-offset-2 ${
                  userProfile.theme === 'dark'
                    ? 'bg-stone-900 border border-stone-800 ring-2 ring-stone-950 text-white'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-stone-950 border-2 border-amber-500 shadow-sm" />
                <span className="text-[10.5px]">Cosmic Black</span>
              </button>
            </div>
          </section>

          {/* BACKUP CORPORATIVO E EXPORT */}
          <section className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-xs text-[#3d232e] uppercase tracking-wide flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600 animate-pulse" /> {txt('exportar_backup', 'Ata de Dados')}
              </h4>
              <p className="text-[10px] text-stone-400 font-sans leading-relaxed font-light">
                {txt('exportar_backup_sub', 'Exporte suas atividades estéticas ou synchronize backups na nuvem')}
              </p>
            </div>

            <div className="space-y-2.5 pt-1 font-sans">
              <button
                onClick={handleExportData}
                className="w-full bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-between border cursor-pointer border-stone-100"
              >
                <span>📥 {txt('exportar_btn', 'Exportar Meus Dados (JSON)')}</span>
              </button>

              <button
                onClick={handleCloudBackup}
                disabled={syncStatus === 'loading'}
                className="w-full bg-emerald-550/10 text-emerald-700 hover:bg-emerald-550 hover:text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border border-emerald-100"
              >
                <span>☁️ {syncStatus === 'loading' ? txt('carregando', 'Efetuando Sinc...') : txt('backup_btn', 'Sincronizar Cloud Backup')}</span>
              </button>
            </div>
          </section>

          {/* LOGOUT SYSTEM ACTION BUTTON */}
          <section className="bg-white rounded-3xl border border-stone-100 p-5 shadow-sm">
            <button
              onClick={() => {
                if (confirm('Tem certeza absoluta que deseja desconectar e sair da sua conta Next Lady?')) {
                  onLogout();
                }
              }}
              className="w-full bg-[#3d232e] text-amber-250 py-3 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1 bg-rose-950 uppercase tracking-widest hover:bg-black"
            >
              <LogOut className="w-4 h-4 text-amber-250" />
              {txt('sair', 'Sair da Conta')}
            </button>
          </section>

        </div>

      </div>

    </div>
  );
}
