import { useState, useMemo, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Users, Award, ShoppingCart, Calendar, Edit, Plus, Trash2, TrendingUp, CheckCircle, Save, PlusCircle, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { ServiceItem, Specialist, Product, EventItem, UserProfile } from '../types';
import { SERVICES, SPECIALISTS, PRODUCTS, EVENTS } from '../data';

interface AdminPanelProps {
  onAddNotification: (title: string, message: string, type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema') => void;
  userProfile: UserProfile;
}

export default function AdminPanel({ onAddNotification, userProfile }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'services' | 'products' | 'events' | 'announcements' | 'moderation' | 'users'>('stats');

  // Load interactive state arrays
  const [adminServices, setAdminServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('next_lady_services_db');
    return saved ? JSON.parse(saved) : SERVICES;
  });

  const [adminProducts, setAdminProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('next_lady_products_db');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  const [adminEvents, setAdminEvents] = useState<EventItem[]>(() => {
    return EVENTS;
  });

  // Load local community posts to support moderation
  const [forumPosts, setForumPosts] = useState<any[]>(() => {
    const saved = localStorage.getItem('next_lady_community_posts');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Load and sync local next_lady_users_list for user management & banning
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('next_lady_users_list');
    if (saved) return JSON.parse(saved);

    // Initial mock user list + current live profile
    const initialList: UserProfile[] = [
      {
        name: 'Gabriela Vasconcelos',
        age: '29',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        points: 450,
        role: 'client',
        favoriteProducts: [],
        rsvpEvents: [],
        redeemedRewards: [],
        email: 'gabi.vasco@gmail.com',
        whatsapp: '+55 11 98877-6655',
        location: 'Pinheiros, São Paulo',
        isBanned: false
      },
      {
        name: 'Ana Beatriz Souza',
        age: '32',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        points: 820,
        role: 'client',
        favoriteProducts: [],
        rsvpEvents: [],
        redeemedRewards: [],
        email: 'ana.beatriz@hotmail.com',
        whatsapp: '+55 11 97766-5544',
        location: 'Jardins, São Paulo',
        isBanned: false
      },
      {
        name: 'Mariana Silva',
        age: '24',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        points: 1500,
        role: 'client',
        favoriteProducts: [],
        rsvpEvents: [],
        redeemedRewards: [],
        email: 'mariana.silva@outlook.com',
        whatsapp: '+55 11 96655-4433',
        location: 'Vila Madalena, São Paulo',
        isBanned: false
      },
      {
        name: 'Roberta Almeida',
        age: '41',
        avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=150',
        points: 150,
        role: 'client',
        favoriteProducts: [],
        rsvpEvents: [],
        redeemedRewards: [],
        email: 'roberta.almeida@gmail.com',
        whatsapp: '+55 11 95544-3322',
        location: 'Moema, São Paulo',
        isBanned: true
      }
    ];

    if (userProfile && userProfile.name) {
      initialList.push(userProfile);
    }

    localStorage.setItem('next_lady_users_list', JSON.stringify(initialList));
    return initialList;
  });

  const handleSaveForumPosts = (updated: any[]) => {
    setForumPosts(updated);
    localStorage.setItem('next_lady_community_posts', JSON.stringify(updated));
  };

  const handleSaveUsersList = (updated: UserProfile[]) => {
    setUsersList(updated);
    localStorage.setItem('next_lady_users_list', JSON.stringify(updated));
    
    // If we updated current logged in user (e.g. points change or ban toggled)
    const foundMe = updated.find(u => u.email === userProfile.email);
    if (foundMe) {
      localStorage.setItem('next_lady_user_profile', JSON.stringify(foundMe));
    }
  };

  // Edit states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServicePrice, setEditingServicePrice] = useState<number>(0);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductStock, setEditingProductStock] = useState<number>(0);

  // New forms
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(150);
  const [newServiceCategory, setNewServiceCategory] = useState<any>('cabelo');

  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementMessage, setNewAnnouncementMessage] = useState('');
  const [newAnnouncementType, setNewAnnouncementType] = useState<any>('promocao');

  // Save changes locally helper
  const handleSaveServices = (updated: ServiceItem[]) => {
    setAdminServices(updated);
    localStorage.setItem('next_lady_services_db', JSON.stringify(updated));
  };

  const handleSaveProducts = (updated: Product[]) => {
    setAdminProducts(updated);
    localStorage.setItem('next_lady_products_db', JSON.stringify(updated));
  };

  // Dispatch announcements to system notifications
  const handleDispatchAnnouncement = (e: FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementMessage.trim()) return;

    onAddNotification(
      newAnnouncementTitle,
      newAnnouncementMessage,
      newAnnouncementType
    );

    // Alert simulation
    alert('Comunicado geral transmitido com sucesso no ecossistema Next Lady! 📣');
    setNewAnnouncementTitle('');
    setNewAnnouncementMessage('');
  };

  // Add Service Handler
  const handleCreateService = (e: FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newService: ServiceItem = {
      id: `s-${Date.now()}`,
      name: newServiceName,
      category: newServiceCategory,
      price: newServicePrice,
      duration: 60,
      description: 'Procedimento estético profissional cadastrado pelo painel administrativo Next Lady.',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400'
    };

    const updated = [...adminServices, newService];
    handleSaveServices(updated);
    
    setNewServiceName('');
    setNewServicePrice(150);
    alert('Serviço cadastrado com sucesso!');
  };

  // Delete Service
  const handleDeleteService = (id: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      const updated = adminServices.filter(s => s.id !== id);
      handleSaveServices(updated);
    }
  };

  // Delete Product
  const handleDeleteProduct = (id: string) => {
    if (confirm('Deseja excluir este item da loja online?')) {
      const updated = adminProducts.filter(p => p.id !== id);
      handleSaveProducts(updated);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-panel-root">
      
      {/* Upper Guard Screen */}
      <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-amber-500/25 p-5 rounded-3xl flex items-center gap-4.5">
        <ShieldAlert className="w-9 h-9 text-amber-600 shrink-0" />
        <div className="space-y-0.5 text-xs">
          <p className="font-display font-bold text-stone-800 uppercase tracking-widest flex items-center gap-1.5">
            Módulo Administrativo Autorizado
            <span className="bg-amber-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none uppercase">Admin</span>
          </p>
          <p className="text-gray-500 font-sans font-light">
            Olá, <strong>{userProfile.name}</strong>. Gerencie profissionais, altere taxas, reabasteça produtos e envie alertas gerais em tempo real.
          </p>
        </div>
      </div>

      {/* Sub Tabs menu */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-rose-100/55">
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`font-sans text-xs font-bold px-4 py-2.5 rounded-t-2xl uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'stats'
              ? 'text-rose-500 border-rose-500 bg-rose-50/15'
              : 'text-gray-500 border-transparent hover:text-rose-400'
          }`}
        >
          📈 Estatísticas
        </button>
        <button
          onClick={() => setActiveSubTab('services')}
          className={`font-sans text-xs font-bold px-4 py-2.5 rounded-t-2xl uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'services'
              ? 'text-rose-500 border-rose-500 bg-rose-50/15'
              : 'text-gray-500 border-transparent hover:text-rose-400'
          }`}
        >
          💇‍♀️ Serviços & Catálogo
        </button>
        <button
          onClick={() => setActiveSubTab('products')}
          className={`font-sans text-xs font-bold px-4 py-2.5 rounded-t-2xl uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'products'
              ? 'text-rose-500 border-rose-500 bg-rose-50/15'
              : 'text-gray-500 border-transparent hover:text-rose-400'
          }`}
        >
          🛍️ Produtos & Estoque
        </button>
        <button
          onClick={() => setActiveSubTab('announcements')}
          className={`font-sans text-xs font-bold px-4 py-2.5 rounded-t-2xl uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'announcements'
              ? 'text-rose-500 border-rose-500 bg-rose-50/15'
              : 'text-gray-500 border-transparent hover:text-rose-400'
          }`}
        >
          📣 Transmissão Alertas
        </button>
        <button
          onClick={() => setActiveSubTab('moderation')}
          className={`font-sans text-xs font-bold px-4 py-2.5 rounded-t-2xl uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'moderation'
              ? 'text-rose-500 border-rose-500 bg-rose-50/15'
              : 'text-gray-500 border-transparent hover:text-rose-400'
          }`}
        >
          🛡️ Ferramentas Moderação
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`font-sans text-xs font-bold px-4 py-2.5 rounded-t-2xl uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'text-rose-500 border-rose-500 bg-rose-50/15'
              : 'text-gray-500 border-transparent hover:text-rose-400'
          }`}
        >
          👥 Utilizadores & Banimentos
        </button>
      </div>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-3xl p-5 border-stone-100 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="text-gray-400 block leading-none">Clientes Cadastradas</span>
                <strong className="text-lg font-mono font-bold text-gray-800">142</strong>
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-5 border-stone-100 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="text-gray-400 block leading-none">Pontos Distribuídos</span>
                <strong className="text-lg font-mono font-bold text-gray-800">4.850</strong>
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-5 border-stone-100 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="text-gray-400 block leading-none">Vendas Loja</span>
                <strong className="text-lg font-mono font-bold text-gray-800">R$ 2.490</strong>
              </div>
            </div>

            <div className="bg-white border rounded-3xl p-5 border-stone-100 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="text-gray-400 block leading-none">Horários Atendimento</span>
                <strong className="text-lg font-mono font-bold text-gray-800">32 marcas</strong>
              </div>
            </div>
          </div>

          {/* Interactive Statistics Custom SVG Chart Graph */}
          <div className="bg-white border border-rose-50 rounded-3xl p-6.5 shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h4 className="font-display font-semibold text-gray-800 text-sm">Faturamento Estimado Semanal</h4>
                <p className="text-[10px] text-gray-400 font-sans">Proporção comparativa das últimas 5 semanas operacionais (Next Lady E-commerce vs. Spa/Tratamentos)</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-mono text-[9px] font-bold">
                <TrendingUp className="w-3.5 h-3.5" /> +22.4% Crescente em Visagismo
              </span>
            </div>

            <div className="relative pt-6">
              {/* Responsive SVG chart view */}
              <svg className="w-full h-44" viewBox="0 0 500 150" id="admin-chart-svg">
                {/* Horizontal grid lines */}
                <line x1="40" y1="20" x2="480" y2="20" className="stroke-stone-100" strokeWidth="1" />
                <line x1="40" y1="60" x2="480" y2="60" className="stroke-stone-100" strokeWidth="1" />
                <line x1="40" y1="100" x2="480" y2="100" className="stroke-stone-100" strokeWidth="1" />
                <line x1="40" y1="130" x2="480" y2="130" className="stroke-stone-200" strokeWidth="1.5" />

                {/* Bars or path representations */}
                {/* Week 1 */}
                <rect x="75" y="55" width="22" height="75" rx="4" className="fill-[#b88c97] hover:fill-[#29171e] transition-colors cursor-pointer" />
                <text x="86" y="145" className="fill-stone-400 font-sans text-[8px] text-center" textAnchor="middle">Sem 1</text>
                <text x="86" y="45" className="fill-stone-600 font-mono text-[8px] font-bold" textAnchor="middle">1.2k</text>

                {/* Week 2 */}
                <rect x="155" y="45" width="22" height="85" rx="4" className="fill-[#b88c97] hover:fill-[#29171e] transition-colors cursor-pointer" />
                <text x="166" y="145" className="fill-stone-400 font-sans text-[8px] text-center" textAnchor="middle">Sem 2</text>
                <text x="166" y="35" className="fill-stone-600 font-mono text-[8px] font-bold" textAnchor="middle">1.5k</text>

                {/* Week 3 */}
                <rect x="235" y="30" width="22" height="100" rx="4" className="fill-stone-800 hover:fill-[#29171e] transition-colors cursor-pointer" />
                <text x="246" y="145" className="fill-stone-400 font-sans text-[8px] text-center" textAnchor="middle">Sem 3</text>
                <text x="246" y="20" className="fill-stone-800 font-mono text-[8px] font-bold" textAnchor="middle">1.8k</text>

                {/* Week 4 */}
                <rect x="315" y="40" width="22" height="90" rx="4" className="fill-[#b88c97] hover:fill-[#29171e] transition-colors cursor-pointer" />
                <text x="326" y="145" className="fill-stone-400 font-sans text-[8px] text-center" textAnchor="middle">Sem 4</text>
                <text x="326" y="30" className="fill-stone-600 font-mono text-[8px] font-bold" textAnchor="middle">1.6k</text>

                {/* Week 5 */}
                <rect x="395" y="15" width="22" height="115" rx="4" className="fill-rose-500 hover:fill-rose-600 transition-colors cursor-pointer" />
                <text x="406" y="145" className="fill-stone-400 font-sans text-[8px] text-center" textAnchor="middle">Sem 5</text>
                <text x="406" y="8" className="fill-rose-600 font-mono text-[8px] font-bold" textAnchor="middle">2.2k</text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'services' && (
        <div className="space-y-6">
          {/* Create new service */}
          <div className="bg-white border rounded-3xl p-5 border-stone-100 shadow-sm space-y-4">
            <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-stone-800">
              <PlusCircle className="w-4 h-4 text-rose-500" /> Cadastrar Novo Procedimento de Beleza
            </h4>

            <form onSubmit={handleCreateService} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block">Nome do Procedimento</label>
                <input
                  type="text"
                  placeholder="Ex: Corte Bob Curto"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:bg-white pl-3.5 pr-3.5 py-2 rounded-xl text-xs font-sans focus:outline-none focus:border-rose-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block">Categoria</label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 pl-3.5 pr-3.5 py-2.5 rounded-xl text-xs font-sans focus:outline-none focus:bg-white"
                >
                  <option value="cabelo">Cabelo</option>
                  <option value="coloracao">Coloração</option>
                  <option value="trancas">Tranças Afro</option>
                  <option value="penteados">Penteados</option>
                  <option value="maquiagem">Maquiagem</option>
                  <option value="manicure">Manicure</option>
                  <option value="alongamento_unhas">Alongamento Unhas</option>
                  <option value="limpeza_facial">Limpeza Facial</option>
                  <option value="spa">Spa</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block">Cobrança (R$)</label>
                <input
                  type="number"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 focus:bg-white pl-3.5 pr-3.5 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-rose-300"
                />
              </div>

              <button
                type="submit"
                className="bg-[#29171e] hover:bg-black text-amber-200 font-sans text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer hover:shadow"
              >
                Cadastrar
              </button>
            </form>
          </div>

          {/* List existing */}
          <div className="bg-white border rounded-3xl p-5 border-stone-100 shadow-sm space-y-4">
            <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider">Lista Cadastrada Ativa</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]/none pb-3">
                    <th className="py-2.5">Nome</th>
                    <th className="py-2.5">Categoria</th>
                    <th className="py-2.5 text-right">Preço</th>
                    <th className="py-2.5 text-right pr-6">Gerenciador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {adminServices.map(s => (
                    <tr key={s.id} className="hover:bg-amber-500/5">
                      <td className="py-3 font-display font-semibold text-stone-800">{s.name}</td>
                      <td className="py-3 uppercase text-[9px] font-mono font-semibold text-[#b88c97]">{s.category}</td>
                      <td className="py-3 text-right font-mono font-semibold">
                        {editingServiceId === s.id ? (
                          <input
                            type="number"
                            value={editingServicePrice}
                            onChange={(e) => setEditingServicePrice(Number(e.target.value))}
                            className="bg-stone-50 border border-stone-300 w-16 text-right px-1 py-0.5 rounded focus:outline-none"
                          />
                        ) : (
                          `R$ ${s.price.toFixed(2)}`
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {editingServiceId === s.id ? (
                            <button
                              onClick={() => {
                                const updated = adminServices.map(item =>
                                  item.id === s.id ? { ...item, price: editingServicePrice } : item
                                );
                                handleSaveServices(updated);
                                setEditingServiceId(null);
                              }}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-1 rounded-lg"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingServiceId(s.id);
                                setEditingServicePrice(s.price);
                              }}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-500 p-1 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            className="bg-rose-50 text-rose-500 hover:bg-rose-100 p-1 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'products' && (
        <div className="bg-white border rounded-3xl p-5 border-stone-100 shadow-sm space-y-4">
          <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider">Produtos do E-commerce & Estoque Geral</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]/none pb-3">
                  <th className="py-2.5">Nome do Item</th>
                  <th className="py-2.5">Departamento</th>
                  <th className="py-2.5 text-right">Preço</th>
                  <th className="py-2.5 text-center">Contagem Estoque</th>
                  <th className="py-2.5 text-right pr-6">Modificar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {adminProducts.map(p => (
                  <tr key={p.id} className="hover:bg-amber-500/5">
                    <td className="py-3 font-display font-semibold text-stone-800">{p.name}</td>
                    <td className="py-3 uppercase text-[9px] font-mono text-[#b88c97]">{p.category}</td>
                    <td className="py-3 text-right font-mono">R$ {p.price.toFixed(2)}</td>
                    <td className="py-3 text-center font-mono font-semibold">
                      {editingProductId === p.id ? (
                        <input
                          type="number"
                          value={editingProductStock}
                          onChange={(e) => setEditingProductStock(Number(e.target.value))}
                          className="bg-stone-50 border border-stone-350 w-14 text-center py-0.5 rounded"
                        />
                      ) : (
                        p.stock
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {editingProductId === p.id ? (
                          <button
                            onClick={() => {
                              const updated = adminProducts.map(item =>
                                item.id === p.id ? { ...item, stock: editingProductStock } : item
                              );
                              handleSaveProducts(updated);
                              setEditingProductId(null);
                            }}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-1 rounded-lg"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingProductId(p.id);
                              setEditingProductStock(p.stock);
                            }}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-500 p-1 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="bg-rose-50 text-rose-500 hover:bg-rose-100 p-1 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {activeSubTab === 'announcements' && (
        <div className="bg-white border rounded-3xl p-5 border-stone-100 shadow-sm space-y-4">
          <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-rose-500" /> Transmissão de Notificações Gerais no Ecossistema
          </h4>
          <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
            Escreva avisos sobre fechamento de datas, cancelamento de agendas, novos mimos liberados no Loyalty HUB, ou descontos surpresa que aparecerão no painel de Notificações das clientes em tempo de execução.
          </p>

          <form onSubmit={handleDispatchAnnouncement} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block">Título do Alerta</label>
                <input
                  type="text"
                  placeholder="Ex: Promoção Surpresa do Fim de Semana!"
                  value={newAnnouncementTitle}
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:bg-white pl-3.5 pr-3.5 py-2.5 rounded-xl text-xs font-sans focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block">Categoria</label>
                <select
                  value={newAnnouncementType}
                  onChange={(e) => setNewAnnouncementType(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-200 text-xs font-sans pl-3.5 pr-3 py-2.5 rounded-xl focus:outline-none focus:bg-white"
                >
                  <option value="promocao">🏷️ Promoção / Loja</option>
                  <option value="agendamento">📅 Agendamentos / Calendário</option>
                  <option value="comunidade">💬 Comunidade / Rodas</option>
                  <option value="sistema">📢 Importante / Geral</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-stone-400 uppercase font-sans font-bold block">Corpo da Notificação</label>
              <textarea
                rows={3}
                placeholder="Ex e corpo detalhado: Traga uma amiga para fazer alongamento de cílios com a Camilla e ganhe manicure inclusa!"
                value={newAnnouncementMessage}
                onChange={(e) => setNewAnnouncementMessage(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-xs font-sans p-3.5 rounded-xl focus:outline-none focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#29171e] hover:bg-black text-amber-200 font-sans text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Transmitir Agora
            </button>
          </form>
        </div>
      )}

      {activeSubTab === 'moderation' && (
        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-5 border-stone-100 shadow-sm space-y-4">
            <div>
              <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                🛡️ Moderação do Fórum Comunitário
              </h4>
              <p className="text-[10px] text-gray-400 font-sans mt-1">
                Monitore dicas de beleza e comentários postados pelas clientes. Você pode remover publicações ou comentários prejudiciais ou ofensivos imediatamente.
              </p>
            </div>

            {forumPosts.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-rose-100 text-stone-400 text-xs">
                Nenhuma publicação encontrada no fórum local para moderação.
              </div>
            ) : (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                {forumPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2">
                        <img 
                          src={post.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"} 
                          alt={post.author} 
                          className="w-7 h-7 rounded-full object-cover border"
                        />
                        <div>
                          <h5 className="text-xs font-semibold text-stone-850">{post.author}</h5>
                          <span className="text-[9px] text-[#b88c97] font-mono uppercase bg-rose-50/60 px-1.5 py-0.5 rounded">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta publicação definitivamente?')) {
                            const updated = forumPosts.filter(p => p.id !== post.id);
                            handleSaveForumPosts(updated);
                            onAddNotification('Publicação Moderada 🚫', 'Uma dica foi removida por descumprir as diretrizes da comunidade.', 'como_admin' as any);
                          }
                        }}
                        className="text-[10px] bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1 rounded-xl font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Excluir Post
                      </button>
                    </div>

                    <div className="space-y-1 pl-1">
                      <h6 className="text-xs font-bold text-stone-800">{post.title}</h6>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-light">{post.content}</p>
                    </div>

                    {/* Comments on this post */}
                    <div className="pl-4 border-l border-rose-100 space-y-1.5">
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Comentários ({post.comments?.length || 0}):</p>
                      {(!post.comments || post.comments.length === 0) ? (
                        <p className="text-[10px] text-stone-400 font-light italic">Sem comentários até o momento.</p>
                      ) : (
                        post.comments.map((comment: any) => (
                          <div key={comment.id} className="bg-white p-2 rounded-xl border border-stone-100/70 flex justify-between items-center gap-4 text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-stone-700 text-[10px]">{comment.author}:</span>
                              <span className="text-gray-500 text-[11px] leading-tight font-light">{comment.text}</span>
                            </div>
                            <button
                              onClick={() => {
                                const updatedPosts = forumPosts.map(p => {
                                  if (p.id === post.id) {
                                    return {
                                      ...p,
                                      comments: p.comments.filter((c: any) => c.id !== comment.id)
                                    };
                                  }
                                  return p;
                                });
                                handleSaveForumPosts(updatedPosts);
                              }}
                              className="text-stone-300 hover:text-red-500 p-1"
                              title="Remover Comentário"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border rounded-3xl p-5 border-stone-100 shadow-sm space-y-4">
            <div>
              <h4 className="font-display font-semibold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                👥 Gestão de Utilizadores e Sistema de Banimento
              </h4>
              <p className="text-[10px] text-gray-400 font-sans mt-1">
                Visualize todos os membros cadastrados no ecossistema Next Lady. Gerencie seu saldo de pontos de fidelidade e aplique banimentos se necessário.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]/none pb-3">
                    <th className="py-2.5">Nome / Email</th>
                    <th className="py-2.5">WhatsApp / Cidade</th>
                    <th className="py-2.5 text-center">Fidelidade</th>
                    <th className="py-2.5 text-center">Nível</th>
                    <th className="py-2.5 text-center">Status</th>
                    <th className="py-2.5 text-right pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {usersList.map((user, uIdx) => {
                    const isMe = user.email === userProfile.email;
                    return (
                      <tr key={uIdx} className="hover:bg-amber-500/5 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <img 
                              src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'} 
                              alt={user.name} 
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                            <div className="flex flex-col">
                              <span className="font-display font-semibold text-stone-850">
                                {user.name} {isMe && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded-md font-mono">Você</span>}
                              </span>
                              <span className="text-[10px] text-stone-400">{user.email || 'Sem e-mail cadastrado'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 font-light">
                          <div className="flex flex-col">
                            <span>{user.whatsapp || '(Não informado)'}</span>
                            <span className="text-[10px] text-stone-400 font-light">{user.location || '(Não informado)'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                const newPoints = Math.max(0, (user.points || 0) - 50);
                                const updated = usersList.map((u, i) => i === uIdx ? { ...u, points: newPoints } : u);
                                handleSaveUsersList(updated);
                              }}
                              className="w-5 h-5 bg-stone-100 rounded text-stone-600 font-bold flex items-center justify-center hover:bg-stone-200"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold w-12 text-center text-stone-800">{user.points || 0}</span>
                            <button
                              onClick={() => {
                                const newPoints = (user.points || 0) + 50;
                                const updated = usersList.map((u, i) => i === uIdx ? { ...u, points: newPoints } : u);
                                handleSaveUsersList(updated);
                              }}
                              className="w-5 h-5 bg-stone-100 rounded text-stone-600 font-bold flex items-center justify-center hover:bg-stone-200"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            user.isBanned 
                              ? 'bg-red-100 text-red-650' 
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.isBanned ? '🚫 Banido' : '✅ Ativo'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-4">
                          <button
                            onClick={() => {
                              const message = user.isBanned 
                                ? `Deseja realmente desbanir o utilizador ${user.name}?`
                                : `Tem certeza absoluta que deseja BANIR o utilizador ${user.name}? Esta conta perderá acesso ao ecossistema imediatamente.`;
                              
                              if (confirm(message)) {
                                const updated = usersList.map((u, i) => i === uIdx ? { ...u, isBanned: !u.isBanned } : u);
                                handleSaveUsersList(updated);
                                
                                if (!user.isBanned) {
                                  onAddNotification(
                                    'Punição Administrativa 🚨', 
                                    `O e-mail ${user.email} foi banido por descumprimento de regras.`, 
                                    'sistema'
                                  );
                                  
                                  // If self-banned, reload page to trigger block immediately
                                  if (isMe) {
                                    window.location.reload();
                                  }
                                } else {
                                  onAddNotification(
                                    'Acesso Restaurado 💚', 
                                    `O e-mail ${user.email} foi desbanido pela administração.`, 
                                    'sistema'
                                  );
                                }
                              }
                            }}
                            className={`text-[10px] font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                              user.isBanned
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-650 hover:bg-red-100'
                            }`}
                          >
                            {user.isBanned ? 'Desbanir' : 'Banir'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
