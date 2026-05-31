import { useState, useEffect, FormEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, Scissors, PlusCircle, Trash2, Edit2, AlertTriangle, 
  Check, X, FileText, Share2, Plus, ArrowRight, Heart, Bell, Calendar, 
  MessageCircle, BarChart3, Archive, Image as ImageIcon, Save, Smartphone 
} from 'lucide-react';
import { ServiceItem, Product, CommunityPost, Appointment } from '../types';

interface SalonPanelProps {
  servicesDb: ServiceItem[];
  onUpdateServices: (updated: ServiceItem[]) => void;
  productsDb: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  onAddNotification: (title: string, message: string, type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema') => void;
  onAddPost?: (newPost: CommunityPost) => void;
  appointments: Appointment[];
  onUpdateAppointments: (updated: Appointment[]) => void;
}

export interface SalonProfile {
  name: string;
  whatsapp: string;
  location: string;
  hours: string;
  avatar: string;
  cover: string;
  isRegistered: boolean;
}

export default function SalonPanel({
  servicesDb,
  onUpdateServices,
  productsDb,
  onUpdateProducts,
  onAddNotification,
  onAddPost,
  appointments,
  onUpdateAppointments
}: SalonPanelProps) {
  // 1. Salon Profile State
  const [salonProfile, setSalonProfile] = useState<SalonProfile>(() => {
    const saved = localStorage.getItem('next_lady_salon_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: 'Next Lady Imperial Jardins',
      whatsapp: '5511991234567',
      location: 'Alameda das Orquídeas Real, 500 — Jardins, SP',
      hours: 'Terça a Sábado, das 09h às 20h',
      avatar: '/src/assets/images/next_lady_cover_1780188650783.png',
      cover: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200',
      isRegistered: true
    };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(salonProfile.name);
  const [editWhatsapp, setEditWhatsapp] = useState(salonProfile.whatsapp);
  const [editLocation, setEditLocation] = useState(salonProfile.location);
  const [editHours, setEditHours] = useState(salonProfile.hours);
  const [editAvatar, setEditAvatar] = useState(salonProfile.avatar);
  const [editCover, setEditCover] = useState(salonProfile.cover);

  // Sub-navigation inside Salon Panel
  const [activeTab, setActiveTab] = useState<'perfil' | 'servicos' | 'produtos' | 'stock' | 'pedidos' | 'publicar' | 'relatorios'>('pedidos');

  // Form states for new product
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'Cosméticos' | 'Capilar' | 'Maquiagem' | 'Perfumes' | 'Acessórios'>('Capilar');
  const [newProdPrice, setNewProdPrice] = useState<number>(0);
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=300');

  // Form states for new service
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcCategory, setNewSvcCategory] = useState<any>('trancas');
  const [newSvcPrice, setNewSvcPrice] = useState<number>(0);
  const [newSvcDuration, setNewSvcDuration] = useState<number>(60);
  const [newSvcDesc, setNewSvcDesc] = useState('');
  const [newSvcImage, setNewSvcImage] = useState('https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400');

  // Form states for community post / promotion
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'Beleza' | 'Moda' | 'Autoestima' | 'Empreendedorismo' | 'Saúde' | 'Motivação'>('Beleza');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('https://images.unsplash.com/photo-1595959183075-c1d0a161b99d?auto=format&fit=crop&q=80&w=500');
  const [isCampaign, setIsCampaign] = useState(false);

  // Stock edit tracking
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<number>(0);

  // Proposed styles by clients visur-IA
  const [styleProposals, setStyleProposals] = useState<any[]>([]);

  useEffect(() => {
    const loaded = localStorage.getItem('next_lady_style_proposals');
    if (loaded) {
      try {
        setStyleProposals(JSON.parse(loaded));
      } catch (err) {
        console.error('Error parsing style proposals in Salon:', err);
      }
    }
  }, [activeTab]);

  // Reports data calculation (Simulated dynamic report metrics)
  const reportMetrics = useMemo(() => {
    const productsSold = productsDb.reduce((acc, p) => acc + (p.stock < 10 ? 12 - p.stock : 2), 0);
    const servicesPerformed = appointments.filter(a => a.status === 'CONCLUÍDO').length + 4;
    const received = appointments.length;
    const completed = appointments.filter(a => a.status === 'CONCLUÍDO').length;
    const rejected = appointments.filter(a => a.status === 'CANCELADO').length;
    const revenue = (completed * 180) + (productsSold * 110);
    const lowStockCount = productsDb.filter(p => p.stock < 5).length;

    return {
      productsSold,
      servicesPerformed,
      received,
      completed,
      rejected,
      revenue,
      lowStockCount,
      clientsServed: completed + 4
    };
  }, [productsDb, appointments]);

  // Handle saving profile
  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    const updated = {
      name: editName,
      whatsapp: editWhatsapp,
      location: editLocation,
      hours: editHours,
      avatar: editAvatar,
      cover: editCover,
      isRegistered: true
    };
    setSalonProfile(updated);
    localStorage.setItem('next_lady_salon_profile', JSON.stringify(updated));
    setIsEditingProfile(false);
    onAddNotification('Perfil do Salão Atualizado! 👑', `As informações do salão "${editName}" foram atualizadas com sucesso.`, 'sistema');
  };

  // Add Product Handler
  const handleCreateProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || newProdPrice <= 0) return;

    const newProduct: Product = {
      id: `p-svc-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      price: newProdPrice,
      rating: 5.0,
      description: newProdDesc,
      image: newProdImage,
      stock: newProdStock,
      pointsGranted: Math.round(newProdPrice * 0.25)
    };

    const updated = [...productsDb, newProduct];
    onUpdateProducts(updated);
    onAddNotification('Novo Produto Cadastrado! 🛍️', `${newProdName} foi adicionado à loja Next Lady.`, 'loja');
    
    // Reset fields
    setNewProdName('');
    setNewProdPrice(0);
    setNewProdDesc('');
    alert('Produto adicionado ao estoque do salão com sucesso!');
  };

  // Remove Product
  const handleDeleteProduct = (id: string) => {
    if (confirm('Deseja realmente remover este produto da vitrine do salão?')) {
      const updated = productsDb.filter(p => p.id !== id);
      onUpdateProducts(updated);
    }
  };

  // Add Service Handler
  const handleCreateService = (e: FormEvent) => {
    e.preventDefault();
    if (!newSvcName.trim() || newSvcPrice <= 0) return;

    const newService: ServiceItem = {
      id: `s-svc-${Date.now()}`,
      name: newSvcName,
      category: newSvcCategory,
      price: newSvcPrice,
      duration: newSvcDuration,
      description: newSvcDesc,
      rating: 5.0,
      image: newSvcImage
    };

    const updated = [...servicesDb, newService];
    onUpdateServices(updated);
    onAddNotification('Novo Serviço Ativado! ✂️', `O serviço "${newSvcName}" já está disponível para agendamento!`, 'sistema');
    
    // Reset fields
    setNewSvcName('');
    setNewSvcPrice(0);
    setNewSvcDesc('');
    alert('Novo serviço de beleza cadastrado com sucesso!');
  };

  // Remove Service
  const handleDeleteService = (id: string) => {
    if (confirm('Deseja realmente descadastrar este procedimento estético?')) {
      const updated = servicesDb.filter(s => s.id !== id);
      onUpdateServices(updated);
    }
  };

  // Update Stock levels
  const handleUpdateStock = (id: string, newStock: number) => {
    const updated = productsDb.map(p => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, newStock) };
      }
      return p;
    });
    onUpdateProducts(updated);
    setEditingStockId(null);
  };

  // Change Appointment reservation status
  const handleChangeAppointmentStatus = (id: string, nextStatus: 'PENDENTE' | 'CONFIRMADO' | 'CONCLUÍDO' | 'CANCELADO') => {
    const updated = appointments.map(a => {
      if (a.id === id) {
        const updatedApp = { ...a, status: nextStatus };
        
        // Trigger customer system notifications on status changes
        let badge = 'Atualização de Agendamento';
        let detail = `Seu serviço no salão ${salonProfile.name} mudou para status: ${nextStatus}.`;
        if (nextStatus === 'CONFIRMADO') {
          badge = 'Agendamento Confirmado! ✅';
          detail = `Prepare-se! Seu horário para o serviço foi confirmado em ${a.date} às ${a.time}.`;
        } else if (nextStatus === 'CONCLUÍDO') {
          badge = 'Atendimento Finalizado! 🌸';
          detail = `Seu procedimento foi realizado com maestria. +${a.pointsGranted} pontos de fidelidade foram creditados!`;
        } else if (nextStatus === 'CANCELADO') {
          badge = 'Atendimento Cancelado / Rejeitado ⚠️';
          detail = `O salão reagendou ou cancelou o horário solicitado de ${a.date} às ${a.time}. Entre em contato via WhatsApp.`;
        }

        onAddNotification(badge, detail, 'agendamento');
        return updatedApp;
      }
      return a;
    });
    onUpdateAppointments(updated);
  };

  // Create Community Post for the Salon
  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-sln-${Date.now()}`,
      author: salonProfile.name,
      avatar: salonProfile.avatar,
      title: newPostTitle + (isCampaign ? ' 🌟 (PROMOÇÃO)' : ''),
      category: newPostCategory,
      content: newPostContent,
      likes: 12,
      hasLiked: false,
      comments: [],
      createdAt: new Date().toISOString(),
      image: newPostImage
    };

    if (onAddPost) {
      onAddPost(newPost);
    } else {
      // Internal fall-back synchronization with localStorage
      const saved = localStorage.getItem('next_lady_community_posts');
      const posts = saved ? JSON.parse(saved) : [];
      localStorage.setItem('next_lady_community_posts', JSON.stringify([newPost, ...posts]));
    }

    onAddNotification(
      'Campanha de Salão Publicada! 📣',
      `${salonProfile.name} postou uma nova publicação/promoção na comunidade.`,
      'comunidade'
    );

    alert('Campanha/Postagem adicionada ao fórum de comunidade Next Lady!');
    setNewPostTitle('');
    setNewPostContent('');
    setIsCampaign(false);
  };

  // WhatsApp individual link builders matching requested integration
  const getWhatsAppProductShareLink = (product: Product) => {
    const text = `🌸 *Next Lady - Mimos de Luxo* 🌸%0A%0A` +
      `Conheça nosso produto:* ${product.name}*%0A` +
      `• Categoria: ${product.category}%0A` +
      `• Preço Exclusivo VIP: R$ ${product.price.toFixed(2)}%0A` +
      `• Descrição: ${product.description}%0A%0A` +
      `Quer reservar para retirar na sua próxima visita? Responda a este WhatsApp! ✨`;
    return `https://wa.me/${salonProfile.whatsapp}?text=${text}`;
  };

  const getWhatsAppServiceShareLink = (svc: ServiceItem) => {
    const text = `👑 *Next Lady - Agendamento Digital* 👑%0A%0A` +
      `Gostaria de realizar o procedimento:* ${svc.name}*%0A` +
      `• Tempo Estimado: ${svc.duration} minutos%0A` +
      `• Preço: R$ ${svc.price.toFixed(2)}%0A` +
      `• Descrição: ${svc.description}%0A%0A` +
      `Agende agora pelo app ou reserve respondendo aqui!`;
    return `https://wa.me/${salonProfile.whatsapp}?text=${text}`;
  };

  const triggerPDFDownloadSimulation = () => {
    alert('Iniciando exportação e formatação da Ata de Relatório Diário "Next Lady" em PDF...');
    window.print();
  };

  return (
    <div className="space-y-8 font-sans" id="salon-full-panel">
      
      {/* 1. Dynamic Cover & Status */}
      <div className="relative rounded-3xl overflow-hidden min-h-[220px] bg-stone-900 border border-amber-900/10">
        <img src={salonProfile.cover} alt="Capa" className="absolute inset-0 w-full h-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
        
        {/* Profile info on cover */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 text-white font-sans">
          <div className="flex items-center gap-4">
            <img src={salonProfile.avatar} alt="Logo" className="w-16 h-16 rounded-2xl border-2 border-amber-400 object-cover bg-stone-900 shadow-md" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-medium text-lg text-stone-50">{salonProfile.name}</h3>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Servidor Ativo
                </span>
              </div>
              <p className="text-xs text-stone-300 font-light max-w-md line-clamp-1">{salonProfile.location}</p>
              <p className="text-[10px] text-amber-250 font-mono">WhatsApp: {salonProfile.whatsapp} • {salonProfile.hours}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditName(salonProfile.name);
              setEditWhatsapp(salonProfile.whatsapp);
              setEditLocation(salonProfile.location);
              setEditHours(salonProfile.hours);
              setEditAvatar(salonProfile.avatar);
              setEditCover(salonProfile.cover);
              setIsEditingProfile(true);
            }}
            className="bg-white/10 hover:bg-white/20 text-stone-100 text-[10px] uppercase tracking-wider font-extrabold px-4 py-2.5 rounded-xl transition-all border border-white/10"
          >
            Editar Cadastro do Salão
          </button>
        </div>
      </div>

      {/* Profile Edit Dialog Overlay */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white max-w-md w-full p-6 rounded-3xl space-y-4 text-stone-800"
          >
            <h4 className="font-display font-semibold text-sm text-stone-900 border-b pb-2">Configurar Cadastro do Salão</h4>
            
            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e]">Nome do Salão:</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="w-full bg-stone-50 border p-2.5 rounded-xl font-sans focus:outline-rose-500" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e]">WhatsApp de Contato:</label>
                <input type="text" value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} required className="w-full bg-stone-50 border p-2.5 rounded-xl font-sans focus:outline-rose-500" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e]">Endereço Física / Localização:</label>
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} required className="w-full bg-stone-50 border p-2.5 rounded-xl font-sans focus:outline-rose-500" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e]">Horário de Funcionamento estético:</label>
                <input type="text" value={editHours} onChange={(e) => setEditHours(e.target.value)} required className="w-full bg-stone-50 border p-2.5 rounded-xl font-sans focus:outline-rose-500" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e]">Foto de Perfil (Avatar URL):</label>
                <input type="text" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} className="w-full bg-stone-50 border p-2.5 rounded-xl font-sans focus:outline-rose-500" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e]">Foto de Capa (Cover JPEG URL):</label>
                <input type="text" value={editCover} onChange={(e) => setEditCover(e.target.value)} className="w-full bg-stone-50 border p-2.5 rounded-xl font-sans focus:outline-rose-500" />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button type="submit" className="flex-1 bg-rose-950 text-white font-bold py-3 rounded-xl hover:bg-stone-900 cursor-pointer">Salvar Alterações</button>
                <button type="button" onClick={() => setIsEditingProfile(false)} className="bg-stone-150 text-stone-600 font-semibold px-4 py-3 rounded-xl hover:bg-stone-200 cursor-pointer">Sair</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Sub-Tabs Header Navigation list */}
      <div className="flex flex-wrap gap-2.5 border-b border-rose-100 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'pedidos', name: 'Gestão de Pedidos & Reservas', badge: appointments.filter(a => a.status === 'PENDENTE').length },
          { id: 'estilos_ia', name: 'Estilos IA Recebidos ✨', badge: styleProposals.filter(p => p.status === 'PENDENTE').length },
          { id: 'produtos', name: 'Produtos Vitrine' },
          { id: 'servicos', name: 'Procedimentos de Estética' },
          { id: 'stock', name: 'Controle de Estoque', alert: reportMetrics.lowStockCount > 0 },
          { id: 'publicar', name: 'Criar Postagem Fórum' },
          { id: 'relatorios', name: 'Relatórios Diários' }
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => setActiveTab(subTab.id as any)}
            className={`text-xs font-sans font-bold uppercase tracking-wider px-4 py-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === subTab.id
                ? 'bg-[#3d232e] text-amber-200 shadow border border-transparent'
                : 'bg-white text-stone-500 border border-[#3d232e]/10 hover:text-stone-900'
            }`}
          >
            {subTab.name}
            {subTab.badge ? (
              <span className="bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {subTab.badge}
              </span>
            ) : null}
            {subTab.alert ? (
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
            ) : null}
          </button>
        ))}
      </div>

      {/* 3. Render Area Sub-Tabs */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm animate-fadeIn">
        
        {/* subTab: PEDIDOS & RESERVAS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="font-display font-semibold text-stone-850 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3d232e]" /> Controle de Reservas e Atendimentos Ativos
              </h4>
              <span className="text-[10px] font-mono text-stone-400 uppercase font-black">Princesas Triadas: {appointments.length}</span>
            </div>

            <div className="overflow-x-auto">
              {appointments.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs">
                  Não há pedidos ou reservas registradas na fila local. Faça uma reserva pelo painel de agendamento do cliente!
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b text-stone-400 uppercase tracking-wider font-extrabold text-[9px]">
                      <th className="py-3 px-2">Data / Hora</th>
                      <th className="py-3 px-2">Princesa Cliente</th>
                      <th className="py-3 px-2">Serviço Solicitado</th>
                      <th className="py-3 px-2">Contato WhatsApp</th>
                      <th className="py-3 px-2">Status Corrente</th>
                      <th className="py-3 px-2 text-right">Ação Rápida de Triagem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => {
                      const svc = servicesDb.find(s => s.id === appt.serviceId);
                      return (
                        <tr key={appt.id} className="border-b hover:bg-stone-50 transition-colors uppercase-none text-stone-800">
                          <td className="py-4 px-2 font-mono font-bold">
                            <span className="block">{appt.date}</span>
                            <span className="text-[10px] text-amber-600 block mt-0.5">{appt.time}</span>
                          </td>
                          <td className="py-4 px-2">
                            <strong className="block text-stone-900 font-sans font-semibold">{appt.clientName}</strong>
                            <span className="text-[10px] text-stone-400 block">{appt.clientEmail || 'cliente@comunidade.com'}</span>
                          </td>
                          <td className="py-4 px-2 text-rose-800 font-medium font-sans">
                            {svc ? svc.name : 'Tratamento Especial Personalizado'}
                          </td>
                          <td className="py-4 px-2 text-stone-605">
                            <a 
                              href={`https://wa.me/${appt.clientPhone.replace(/\D/g, '')}?text=Olá ${appt.clientName}! Confirmamos seu agendamento no Next Lady para dia ${appt.date} às ${appt.time}!`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-500 hover:underline font-semibold flex items-center gap-1"
                            >
                              <Smartphone className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                              {appt.clientPhone}
                            </a>
                          </td>
                          <td className="py-4 px-2">
                            <span className={`inline-block font-sans text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              appt.status === 'PENDENTE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              appt.status === 'CONFIRMADO' ? 'bg-blue-105 text-blue-700 border border-blue-200' :
                              appt.status === 'CONCLUÍDO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              'bg-rose-100 text-rose-700 border border-rose-200'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right space-x-1.5 whitespace-nowrap">
                            {appt.status === 'PENDENTE' && (
                              <>
                                <button
                                  onClick={() => handleChangeAppointmentStatus(appt.id, 'CONFIRMADO')}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer"
                                  type="button"
                                >
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleChangeAppointmentStatus(appt.id, 'CANCELADO')}
                                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer"
                                  type="button"
                                >
                                  Rejeitar
                                </button>
                              </>
                            )}
                            {appt.status === 'CONFIRMADO' && (
                              <>
                                <button
                                  onClick={() => handleChangeAppointmentStatus(appt.id, 'CONCLUÍDO')}
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer"
                                  type="button"
                                >
                                  Atender & Concluir
                                </button>
                                <button
                                  onClick={() => handleChangeAppointmentStatus(appt.id, 'CANCELADO')}
                                  className="bg-stone-500 hover:bg-stone-600 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer"
                                  type="button"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                            {appt.status === 'CONCLUÍDO' && (
                              <span className="text-[10px] text-emerald-605 font-semibold block">Concluído e Pago</span>
                            )}
                            {appt.status === 'CANCELADO' && (
                              <span className="text-[10px] text-rose-600 font-semibold block">Cancelada / Rejeitada</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* subTab: ESTILOS IA RECEBIDOS */}
        {activeTab === 'estilos_ia' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h4 className="font-display font-semibold text-stone-850 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-rose-700" /> Estilos e Projetos de Visagismo Recebidos (IA Next Lady)
                </h4>
                <p className="text-[10px] text-stone-400 mt-1">Dossiês visagistas e fotos estilizadas criadas pelas clientes para alinhamento estético</p>
              </div>
              <span className="text-[10px] font-mono text-stone-450 uppercase font-black">Projetos Ativos: {styleProposals.length}</span>
            </div>

            {styleProposals.length === 0 ? (
              <div className="p-12 text-center text-stone-400 text-xs font-sans">
                Nenhum projeto de estilo visagista de inteligência artificial foi enviado pelas clientes ainda. Use a Consultora de Beleza IA no painel do Cliente para enviar um!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {styleProposals.map((prop) => (
                  <div key={prop.id} className="bg-stone-50 p-5 rounded-3xl border border-rose-100 flex flex-col justify-between space-y-4">
                    
                    {/* Header info */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <img src={prop.clientAvatar || '/src/assets/images/next_lady_cover_1780188650783.png'} alt="Client" className="w-9 h-9 rounded-full object-cover border border-rose-200" referrerPolicy="no-referrer" />
                        <div>
                          <strong className="text-stone-950 text-xs block font-display leading-tight">{prop.clientName}</strong>
                          <span className="text-[8px] text-[#3d232e] bg-[#3d232e]/5 px-2 py-0.5 rounded-md font-sans mt-0.5 inline-block font-bold leading-none uppercase tracking-wider">{prop.styleCategory}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 font-mono block font-bold">{prop.date}</span>
                        <span className="text-[9px] text-amber-600 block">{prop.time}</span>
                      </div>
                    </div>

                    {/* Style Details */}
                    <div className="p-3.5 bg-white rounded-2xl border border-rose-50 space-y-1 text-left">
                      <span className="text-[8px] text-stone-450 font-black uppercase tracking-wider block font-sans">Estilo ou Trança Solicitada:</span>
                      <strong className="text-stone-900 text-xs block font-sans font-semibold">{prop.styleName}</strong>
                      <p className="text-[10px] text-stone-500 leading-relaxed font-light mt-0.5">{prop.styleDesc}</p>
                      {prop.customNotes && (
                        <p className="text-[10px] text-rose-800 bg-rose-50/50 p-2.5 rounded-xl font-sans mt-2 leading-relaxed">
                          <strong>Anotações Extras da Cliente:</strong> {prop.customNotes}
                        </p>
                      )}
                    </div>

                    {/* Side-by-side simulation comparison */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[8px] text-stone-400 font-bold uppercase block text-center font-sans tracking-wide">1. Original (Entrada)</span>
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-stone-105">
                          <img src={prop.originalImage} alt="Original" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-rose-700 font-bold uppercase block text-center font-sans tracking-wide">2. Simulado por IA</span>
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-rose-200 bg-stone-105 shadow-xs">
                          <img src={prop.generatedImage} alt="Simulado" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="border-t border-rose-100/60 pt-3.5 flex items-center justify-between gap-3">
                      <div>
                        <span className={`inline-block font-sans text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          prop.status === 'PENDENTE' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                          prop.status === 'REVISADO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-stone-200 text-stone-605'
                        }`}>
                          {prop.status}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {prop.status === 'PENDENTE' && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = styleProposals.map(p => p.id === prop.id ? { ...p, status: 'REVISADO' } : p);
                              setStyleProposals(updated);
                              localStorage.setItem('next_lady_style_proposals', JSON.stringify(updated));
                              onAddNotification(
                                'Revisão Concluída! ✓',
                                `O design de "${prop.styleName}" enviado por ${prop.clientName} foi confirmado pelo salão.`,
                                'sistema'
                              );
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 px-3.5 rounded-xl text-[10px] tracking-wider cursor-pointer font-sans"
                          >
                            Revisar Visual
                          </button>
                        )}
                        <a
                          href={`https://wa.me/${prop.clientPhone.replace(/\D/g, '')}?text=Olá ${prop.clientName}! Vimos seu projeto de beleza para o procedimento "${prop.styleName}" no painel corporativo do Salão Next Lady! Os resultados visagistas ficaram deslumbrantes. O que acha de alinharmos os preparativos agora? 👑`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-stone-900 hover:bg-stone-950 text-amber-250 font-sans font-bold h-9 px-3.5 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer border border-stone-800 transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Contato
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Deseja deletar esta proposta de estilo do histórico do salão?')) {
                              const updated = styleProposals.filter(p => p.id !== prop.id);
                              setStyleProposals(updated);
                              localStorage.setItem('next_lady_style_proposals', JSON.stringify(updated));
                            }
                          }}
                          className="p-2 text-stone-400 hover:text-red-650 cursor-pointer"
                          title="Remover Proposta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* subTab: GERENCIAMENTO DE PRODUTOS */}
        {activeTab === 'produtos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="font-display font-semibold text-stone-850 flex items-center gap-2">
                <Store className="w-5 h-5 text-[#3d232e]" /> Cadastar e Editar Produtos da Vitrine Mimos
              </h4>
            </div>

            {/* Form creating product */}
            <form onSubmit={handleCreateProduct} className="bg-stone-50 p-4.5 rounded-2xl border border-rose-100/40 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e] block">1. Nome do Produto:</label>
                <input type="text" placeholder="Ex: Óleo Iluminador Next Rose" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} required className="w-full bg-white border p-2.5 rounded-xl font-sans" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e] block">2. Categoria do Mimo:</label>
                <select value={newProdCategory} onChange={(e: any) => setNewProdCategory(e.target.value)} className="w-full bg-white border p-2.5 rounded-xl font-sans focus:ring-1 focus:ring-rose-500">
                  <option value="Capilar">Capilar</option>
                  <option value="Cosméticos">Cosméticos</option>
                  <option value="Maquiagem">Maquiagem</option>
                  <option value="Perfumes">Perfumes</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e] block">3. Preço de Venda (R$):</label>
                <input type="number" placeholder="Ex: 89.90" value={newProdPrice || ''} onChange={(e) => setNewProdPrice(parseFloat(e.target.value))} required className="w-full bg-white border p-2.5 rounded-xl font-sans" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e] block">4. Estoque Inicial (Qtd):</label>
                <input type="number" value={newProdStock} onChange={(e) => setNewProdStock(parseInt(e.target.value))} required className="w-full bg-white border p-2.5 rounded-xl font-sans" />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="font-bold text-[#3d232e] block">5. Descrição / Benefícios Visagistas:</label>
                <input type="text" placeholder="Ex: Restaura a barreira lipídica..." value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} className="w-full bg-white border p-2.5 rounded-xl font-sans" />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-rose-950 text-white font-bold h-11 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
                >
                  <PlusCircle className="w-4.5 h-4.5" /> Adicionar Produto
                </button>
              </div>
            </form>

            {/* Products List panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {productsDb.map((prod) => (
                <div key={prod.id} className="border border-rose-100/40 p-4 rounded-2xl shadow-xs hover:shadow-sm space-y-3 flex flex-col justify-between text-xs">
                  <div className="space-y-2">
                    <img src={prod.image} alt={prod.name} className="w-full h-32 object-cover rounded-xl border" />
                    <div>
                      <span className="text-[8px] bg-[#3d232e] text-amber-250 font-bold px-2 py-0.5 rounded-md uppercase font-sans">
                        {prod.category}
                      </span>
                      <h5 className="font-display font-medium text-[#3d232e] mt-1 text-xs truncate leading-snug">{prod.name}</h5>
                    </div>
                  </div>
                  
                  <div className="border-t pt-2.5 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] text-stone-400 block">Preço VIP</span>
                      <strong className="text-stone-900 font-mono">R$ {prod.price.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 block">Estoque</span>
                      <span className={`font-mono font-bold ${prod.stock < 5 ? 'text-amber-600' : 'text-stone-705'}`}>{prod.stock} un</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={getWhatsAppProductShareLink(prod)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-2 rounded-xl text-center flex items-center justify-center gap-1 transition-all text-[10px]"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Partilhar WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="bg-[#faf8f8] hover:bg-red-50 text-red-600 hover:border-transparent transition-all border border-rose-100 p-2 rounded-xl"
                      title="Excluir Mimo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* subTab: GESTÃO DE SERVIÇOS */}
        {activeTab === 'servicos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="font-display font-semibold text-stone-850 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#3d232e]" /> Cadastrar e Ativar Procedimentos de Beleza
              </h4>
            </div>

            {/* Form creating service */}
            <form onSubmit={handleCreateService} className="bg-stone-50 p-4.5 rounded-2xl border border-rose-100/40 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e] block">1. Nome do Procedimento:</label>
                <input type="text" placeholder="Ex: Alongamento Cílios de Seda" value={newSvcName} onChange={(e) => setNewSvcName(e.target.value)} required className="w-full bg-white border p-2.5 rounded-xl font-sans" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e] block">2. Categoria Estética:</label>
                <select value={newSvcCategory} onChange={(e: any) => setNewSvcCategory(e.target.value)} className="w-full bg-white border p-2.5 rounded-xl font-sans focus:ring-1 focus:ring-rose-500 font-bold uppercase text-[9px] tracking-wider text-[#3d232e]">
                  <option value="trancas">Tranças Afro</option>
                  <option value="maquiagem">Maquiagem</option>
                  <option value="manicure">Manicure</option>
                  <option value="pedicure">Pedicure</option>
                  <option value="cilios">Alongamento Cílios</option>
                  <option value="sobrancelhas">Sobrancelhas Designer</option>
                  <option value="cabelo">Cortes de Cabelo</option>
                  <option value="coloracao">Coloração Orgânica</option>
                  <option value="massagem">Massagem anti-tensões</option>
                  <option value="limpeza_facial">Estética Facial</option>
                  <option value="estetica_corporal">Estética Corporal</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e] block">3. Valor / Preço Cobrado (R$):</label>
                <input type="number" placeholder="Ex: 190" value={newSvcPrice || ''} onChange={(e) => setNewSvcPrice(parseFloat(e.target.value))} required className="w-full bg-white border p-2.5 rounded-xl font-sans" />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-[#3d232e] block">4. Tempo Estimado (Minutos):</label>
                <input type="number" placeholder="Ex: 90" value={newSvcDuration} onChange={(e) => setNewSvcDuration(parseInt(e.target.value))} required className="w-full bg-white border p-2.5 rounded-xl font-sans" />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="font-bold text-[#3d232e] block">5. Detalhes Visagistas do Procedimento:</label>
                <input type="text" placeholder="Ex: Aplicação de cílios fio a fio com cola premium..." value={newSvcDesc} onChange={(e) => setNewSvcDesc(e.target.value)} className="w-full bg-white border p-2.5 rounded-xl font-sans" />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-rose-950 text-white font-bold h-11 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-1 cursor-pointer font-sans uppercase tracking-widest text-[10px]"
                >
                  <PlusCircle className="w-4.5 h-4.5" /> Ativar Serviço
                </button>
              </div>
            </form>

            {/* List Services Active */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {servicesDb.map((svc) => (
                <div key={svc.id} className="border border-rose-100/40 p-4 rounded-2xl shadow-xs hover:shadow-sm space-y-3 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <img src={svc.image} alt={svc.name} className="w-full h-32 object-cover rounded-xl border" />
                    <div>
                      <span className="text-[8px] bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded-md uppercase font-sans tracking-wider">
                        {svc.category}
                      </span>
                      <h5 className="font-display font-medium text-[#3d232e] mt-1 text-xs truncate leading-snug">{svc.name}</h5>
                      <p className="text-[10px] text-stone-400 line-clamp-1">{svc.description}</p>
                    </div>
                  </div>

                  <div className="border-t pt-2.5 flex justify-between items-center bg-stone-50/50 p-2 rounded-xl">
                    <div>
                      <span className="text-[8px] text-stone-400 uppercase block">Tempo</span>
                      <span className="font-sans font-bold text-stone-800">{svc.duration} min</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-stone-400 uppercase block">Valor</span>
                      <span className="font-mono font-extrabold text-rose-900">R$ {svc.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={getWhatsAppServiceShareLink(svc)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-2 rounded-xl text-center flex items-center justify-center gap-1 transition-all text-[10px]"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Link WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(svc.id)}
                      className="bg-white hover:bg-red-50 text-red-600 border border-rose-100 p-2 rounded-xl"
                      title="Excluir Serviço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* subTab: GESTÃO DE STOCK */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="font-display font-semibold text-stone-850 flex items-center gap-2">
                <Archive className="w-5 h-5 text-[#3d232e]" /> Controle de Alertas de Stock & Inventários
              </h4>
              <span className="text-[10px] bg-amber-500/10 text-amber-800 border border-amber-300 font-mono font-bold px-2 py-0.5 rounded-lg uppercase">
                Estoque Baixo: {reportMetrics.lowStockCount} Itens
              </span>
            </div>

            {/* Low stock indicators warning banner */}
            {reportMetrics.lowStockCount > 0 && (
              <div className="bg-amber-100 border border-amber-300 p-4 rounded-2xl flex items-start gap-3.5 text-amber-900 animate-pulse text-xs select-none">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-sans">Atenção! Reposição Estética de Produtos Requerida:</strong>
                  <p className="font-sans font-light mt-0.5 text-[11px] leading-tight text-amber-800">
                    O estoque de alguns mimos de alta perfumaria ou dermocosméticos caíram abaixo do nível de segurança de segurança (abaixo de 5 unidades). Ajuste as quantidades para evitar cancelamento de vendas presenciais.
                  </p>
                </div>
              </div>
            )}

            {/* Stock management tables */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b text-stone-400 uppercase tracking-wider font-extrabold text-[9px] py-1">
                    <th className="py-3 px-2">Produto</th>
                    <th className="py-3 px-2">Categoria</th>
                    <th className="py-3 px-2">Quantidade Corrente em Stock</th>
                    <th className="py-3 px-2">Valor Total Estimado em Stock</th>
                    <th className="py-3 px-2">Status do Inventário</th>
                    <th className="py-3 px-2 text-right">Controles Rápidos</th>
                  </tr>
                </thead>
                <tbody>
                  {productsDb.map((prod) => (
                    <tr key={prod.id} className="border-b hover:bg-stone-50 transition-colors uppercase-none">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2.5">
                          <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border" />
                          <div>
                            <strong className="text-stone-900 block font-display leading-tight">{prod.name}</strong>
                            <span className="text-[10px] text-stone-450 block mt-0.5">ID: {prod.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-stone-500 font-sans">{prod.category}</td>
                      <td className="py-4 px-2">
                        {editingStockId === prod.id ? (
                          <div className="flex items-center gap-1.5 font-sans">
                            <input
                              type="number"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(parseInt(e.target.value))}
                              className="w-16 bg-white border rounded p-1 text-center font-bold"
                            />
                            <button
                              onClick={() => handleUpdateStock(prod.id, editingStockValue)}
                              className="bg-[#3d232e] text-white p-1 rounded-md"
                              type="button"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono font-extrabold text-sm">{prod.stock} unidades</span>
                        )}
                      </td>
                      <td className="py-4 px-2 font-mono text-[#3d232e]">
                        R$ {(prod.price * prod.stock).toFixed(2)}
                      </td>
                      <td className="py-4 px-2">
                        {prod.stock === 0 ? (
                          <span className="text-[9px] bg-red-100 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded-full uppercase">ESGOTADO</span>
                        ) : prod.stock < 5 ? (
                          <span className="text-[9px] bg-amber-100 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded-full uppercase">REPOSIÇÃO URGENTE</span>
                        ) : (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full uppercase">SAUDÁVEL</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingStockId(prod.id);
                              setEditingStockValue(prod.stock);
                            }}
                            className="bg-stone-100 hover:bg-[#3d232e] hover:text-white transition-all text-stone-700 text-[10px] uppercase font-bold p-1.5 px-3.5 rounded-lg cursor-pointer"
                            type="button"
                          >
                            Ajustar Count
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* subTab: PUBLICAR NA COMUNIDADE */}
        {activeTab === 'publicar' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="font-display font-semibold text-stone-850 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#3d232e]" /> Criar Promoções, Campanhas ou Publicações de Fórum
              </h4>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 max-w-xl text-xs font-sans">
              <div className="space-y-1 text-left">
                <label className="font-bold text-[#3d232e] block">Título do Comunicado / Tópico:</label>
                <input
                  type="text"
                  placeholder="Ex: Segredos do Cronograma Capilar Ideal + Promoção Exclusiva"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  required
                  className="w-full bg-stone-50 border p-3 rounded-xl focus:outline-rose-550"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="font-bold text-[#3d232e] block">Categoria:</label>
                  <select
                    value={newPostCategory}
                    onChange={(e: any) => setNewPostCategory(e.target.value)}
                    className="w-full bg-stone-50 border p-3 rounded-xl focus:outline-rose-550"
                  >
                    <option value="Beleza">Beleza</option>
                    <option value="Moda">Moda</option>
                    <option value="Autoesteem">Autoestima</option>
                    <option value="Empreendedorismo">Empreendedorismo</option>
                    <option value="Saúde">Saúde</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="font-bold text-[#3d232e] block">Foto de Destaque da Campanha (URL):</label>
                  <input
                    type="text"
                    value={newPostImage}
                    onChange={(e) => setNewPostImage(e.target.value)}
                    className="w-full bg-stone-50 border p-3 rounded-xl focus:outline-rose-550"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 font-sans">
                <input
                  type="checkbox"
                  id="campaign-trigger-box"
                  checked={isCampaign}
                  onChange={(e) => setIsCampaign(e.target.checked)}
                  className="w-4 h-4 text-[#3d232e] focus:ring-[#3d232e] border-stone-300 rounded"
                />
                <label htmlFor="campaign-trigger-box" className="font-bold text-rose-900 cursor-pointer">
                  Marcar como Campanha Promocional Especial (Informa clientes VIP e dá pontos extras)
                </label>
              </div>

              <div className="space-y-1 text-left">
                <label className="font-bold text-[#3d232e] block">Escreva o Conteúdo da Postagem / Campanha:</label>
                <textarea
                  rows={4}
                  placeholder="Escreva dicas estáticas, visagistas, ou detalhes de sorteios e promoções..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  required
                  className="w-full bg-stone-50 border p-3 rounded-xl focus:outline-rose-550 font-sans"
                />
              </div>

              <button
                type="submit"
                className="bg-rose-950 hover:bg-[#1a0f14] text-white py-3.5 px-6 rounded-xl font-sans font-bold uppercase tracking-wider text-xs shadow cursor-pointer"
              >
                Divulgar Postagem na Comunidade Next Lady
              </button>
            </form>
          </div>
        )}

        {/* subTab: RELATÓRIOS DIÁRIOS PDF */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h4 className="font-display font-semibold text-stone-850 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#3d232e]" /> Estatísticas de Atividade Diária
                </h4>
                <p className="text-[10px] text-stone-400">Relatórios fiscais, consolidados de estoques e agendamentos concluídos</p>
              </div>

              <button
                onClick={triggerPDFDownloadSimulation}
                className="bg-rose-950 hover:bg-[#1a1014] text-amber-200 text-xs font-sans font-bold px-5 py-3.5 rounded-xl flex items-center gap-2 transition-all border border-rose-800 shadow"
              >
                <FileText className="w-4.5 h-4.5" /> Baixar Relatório PDF
              </button>
            </div>

            {/* Micro Dashboard Grid metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-rose-100/40 text-left space-y-1">
                <span className="text-[9px] text-[#3d232e] font-sans font-bold uppercase tracking-wide">Receita Diária</span>
                <span className="font-mono text-xl font-black text-rose-950 block">R$ {reportMetrics.revenue.toFixed(2)}</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border border-rose-100/40 text-left space-y-1">
                <span className="text-[9px] text-[#3d232e] font-sans font-bold uppercase tracking-wide">Produtos Vendidos</span>
                <span className="font-mono text-xl font-black text-[#3d232e] block">{reportMetrics.productsSold} unidades</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border border-rose-100/40 text-left space-y-1">
                <span className="text-[9px] text-[#3d232e] font-sans font-bold uppercase tracking-wide">Serviços Estéticos</span>
                <span className="font-mono text-xl font-black text-[#3d232e] block">{reportMetrics.servicesPerformed} concluídos</span>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border border-rose-100/40 text-left space-y-1">
                <span className="text-[9px] text-[#3d232e] font-sans font-bold uppercase tracking-wide">Clientes Atendidos</span>
                <span className="font-mono text-xl font-black text-[#3d232e] block">{reportMetrics.clientsServed} Princesas</span>
              </div>
            </div>

            {/* Section printable layout preview (Ata PDF / Print target) */}
            <div className="bg-white border-2 border-dashed border-[#3d232e]/10 p-8 rounded-2xl max-w-2xl mx-auto space-y-6 text-stone-850 text-left shadow-xs print:p-0 print:border-none">
              
              <div className="flex justify-between items-start border-b-2 border-stone-850 pb-4">
                <div>
                  <h3 className="font-display font-black text-xl text-[#3d232e] leading-none uppercase tracking-wide">Next Lady S/A</h3>
                  <span className="text-[9px] text-stone-500 font-light block mt-1">Plataforma Tecnológica de Agenciamento Estético</span>
                  <p className="text-[9px] text-stone-400 mt-1">CNPJ: 50.123.456/0001-90</p>
                </div>
                <div className="text-right">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-[#3d232e]">ATA DE EXTRATO DIÁRIO</h4>
                  <span className="text-[10px] text-amber-600 block mt-1 font-mono font-bold">Data Fiscal: {new Date().toLocaleDateString('pt-BR')}</span>
                  <p className="text-[9px] text-[#25D366] font-semibold mt-0.5 uppercase tracking-wide">Sincronizado via WhatsApp</p>
                </div>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-bold text-[#3d232e] border-b pb-1 uppercase text-[10px] tracking-wide">CONSOLIDADO FINANCEIRO</h5>
                    <ul className="space-y-1.5 mt-2 font-mono text-[11px]">
                      <li className="flex justify-between"><span>Vendas do E-commerce:</span> <strong>R$ {(reportMetrics.productsSold * 110).toFixed(2)}</strong></li>
                      <li className="flex justify-between"><span>Atendimentos Visagistas:</span> <strong>R$ {(reportMetrics.completed * 180).toFixed(2)}</strong></li>
                      <li className="flex justify-between border-t pt-1.5 text-[#3d232e]"><span>RECEITA TOTAL BRUTA:</span> <strong>R$ {reportMetrics.revenue.toFixed(2)}</strong></li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#3d232e] border-b pb-1 uppercase text-[10px] tracking-wide">MOVIMENTAÇÃO DE FLUXOS</h5>
                    <ul className="space-y-1.5 mt-2 text-[11px]">
                      <li className="flex justify-between"><span>Solicitações de Reservas:</span> <strong>{reportMetrics.received}</strong></li>
                      <li className="flex justify-between"><span>Pedidos Aprovados e Concluídos:</span> <strong className="text-emerald-600 font-bold">{reportMetrics.completed}</strong></li>
                      <li className="flex justify-between"><span>Pedidos Rejeitados / Cancelados:</span> <strong className="text-red-500 font-bold">{reportMetrics.rejected}</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="font-bold text-[#3d232e] border-b pb-1 uppercase text-[10px] tracking-wide">RELATÓRIO DE ESTOQUE ATUAL</h5>
                  <div className="mt-2 text-[10px] font-mono grid grid-cols-2 gap-2 text-stone-500">
                    <div>
                      <p>• Total de produtos ativos: {productsDb.length}</p>
                      <p>• Itens com estoque saudável: {productsDb.filter(p => p.stock >= 5).length}</p>
                    </div>
                    <div>
                      <p>• Itens abaixo do nível crítico: {reportMetrics.lowStockCount}</p>
                      <p>• Valor de inventário estocado: R$ {productsDb.reduce((acc, p) => acc + (p.price * p.stock), 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 font-light italic leading-normal border-t-2 pt-4">
                  Documento emitido automaticamente pelo ecossistema digital **Next Lady**. Todas as transações são protegidas por leis locais. Este relatório pode ser anexado nas faturas de prestação de serviços nacionais com trancistas, manicures, e esteticistas cadastradas.
                </p>
              </div>

              <div className="flex justify-end gap-2 text-[10px]">
                <button
                  onClick={() => {
                    const shareText = `*Next Lady - Relatório Diário de Atividade*%0A%0A` +
                      `Fiscal: ${new Date().toLocaleDateString('pt-BR')}%0A` +
                      `• Receita Consolidada: R$ ${reportMetrics.revenue.toFixed(2)}%0A` +
                      `• Clientes Atendidas: ${reportMetrics.clientsServed}%0A` +
                      `• Serviços Concluídos: ${reportMetrics.servicesPerformed}%0A` +
                      `• Itens com Baixo Estoque: ${reportMetrics.lowStockCount}%0A%0A` +
                      `Relatório gerado em PDF com sucesso via painel Next Lady.`;
                    window.open(`https://wa.me/${salonProfile.whatsapp}?text=${shareText}`, '_blank');
                  }}
                  className="bg-[#25D366] text-white p-2.5 px-4 rounded-xl font-bold flex items-center gap-1.5 transition-all text-[11px]"
                >
                  <Share2 className="w-3.5 h-3.5" /> Enviar Relatório via WhatsApp
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
