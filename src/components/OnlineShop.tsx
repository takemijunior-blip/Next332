import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Search, Star, Trash2, ShieldCheck, ArrowRight, Check, Sparkles, Tag, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product, CartItem, UserProfile } from '../types';
import { PRODUCTS } from '../data';

interface OnlineShopProps {
  userProfile: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onAddNotification: (title: string, message: string, type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema') => void;
}

export default function OnlineShop({ userProfile, onUpdateUser, onAddNotification }: OnlineShopProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [latestOrder, setLatestOrder] = useState<{ id: string; total: number; points: number } | null>(null);

  // Load products dynamically from shared database
  const products = useMemo(() => {
    const saved = localStorage.getItem('next_lady_products_db');
    return saved ? JSON.parse(saved) : PRODUCTS;
  }, []);

  // Filter Categories
  const categories = useMemo(() => {
    return ['Todos', 'Cosméticos', 'Capilar', 'Maquiagem', 'Perfumes', 'Acessórios'];
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(prod => {
      const matchSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === 'Todos' || prod.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, activeCategory]);

  // Toggle favorite
  const handleToggleFavorite = (productId: string) => {
    const favorites = userProfile.favoriteProducts || [];
    let updated: string[];
    if (favorites.includes(productId)) {
      updated = favorites.filter(id => id !== productId);
    } else {
      updated = [...favorites, productId];
    }
    onUpdateUser({ ...userProfile, favoriteProducts: updated });
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    // Trigger tiny slide open of cart to notify user
    setIsCartOpen(true);
  };

  // Modify cart quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0)
    );
  };

  // Calculate cart metrics
  const totalAmount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const totalPoints = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.pointsGranted * item.quantity, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Checkout Handler
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const orderId = `NL-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPointsEarned = totalPoints;
    
    // Decrease stock in next_lady_products_db
    const savedProducts = localStorage.getItem('next_lady_products_db');
    const currentProducts: Product[] = savedProducts ? JSON.parse(savedProducts) : PRODUCTS;
    const updatedProducts = currentProducts.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    });
    localStorage.setItem('next_lady_products_db', JSON.stringify(updatedProducts));

    // Add gained points to user profile
    const currentPoints = userProfile.points || 0;
    const newPoints = currentPoints + finalPointsEarned;

    // Save order history local simulation
    const oldPurchases = JSON.parse(localStorage.getItem('next_lady_purchases') || '[]');
    const newPurchase = {
      orderId,
      date: new Date().toLocaleDateString('pt-BR'),
      items: cart.map(i => ({ name: i.product.name, price: i.product.price, qty: i.quantity })),
      total: totalAmount,
      pointsEarned: finalPointsEarned
    };
    
    localStorage.setItem('next_lady_purchases', JSON.stringify([newPurchase, ...oldPurchases]));

    onUpdateUser({
      ...userProfile,
      points: newPoints
    });

    onAddNotification(
      'Compra Realizada! 🛍️',
      `Seu pedido ${orderId} foi confirmado. Você acumulou +${finalPointsEarned} pontos de fidelidade Next Lady!`,
      'loja'
    );

    setLatestOrder({ id: orderId, total: totalAmount, points: finalPointsEarned });
    setCart([]);
    setIsCartOpen(false);
    setOrderSuccess(true);
  };

  return (
    <div className="space-y-8" id="online-shop-root">
      
      {/* Search and Promotion Strip */}
      <div className="relative bg-gradient-to-br from-[#1c1214] to-[#2e1d22] rounded-3xl p-6 md:p-8 text-white border border-[#3f262e] shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-rose-500/10 to-[#b58c97]/20 rounded-full blur-3xl -z-10" />
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-sans text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
            <Tag className="w-3.5 h-3.5" /> Ganhe Pontos Extras no E-commerce
          </span>
          <h2 className="font-display font-light text-2xl md:text-4xl leading-tight">
            Cosméticos Reais de <strong className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-100 italic">Alta Geração Estética</strong>
          </h2>
          <p className="text-xs md:text-sm text-stone-300 leading-relaxed font-light">
            Nossos elixires, maquiagens e acessórios são testados dermatologicamente em protocolo limpo vegano. Cada compra retorna de 10% a 30% do valor em pontos de fidelidade VIP!
          </p>

          {/* Search Inputs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquise por marcas, cremes, sérum, batom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-stone-100 focus:text-stone-900 border border-white/10 focus:border-rose-400 pl-10 pr-4 py-3 rounded-2xl text-xs font-sans placeholder-stone-400 focus:outline-none transition-all"
              />
            </div>
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-500 hover:to-rose-650 px-5 py-3 rounded-2xl font-sans text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 relative active:scale-98"
            >
              <ShoppingCart className="w-4 h-4" />
              Ver Carrinho 
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-[#1c1214]">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Filter Category */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`font-sans text-xs font-bold px-4 py-2.5 rounded-2xl uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#29171e] text-amber-200 border-[#3d232e] shadow-sm'
                : 'bg-white text-gray-500 border-rose-50/50 hover:bg-stone-50 hover:text-rose-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-rose-100/50 space-y-3">
          <p className="text-sm font-sans text-stone-500 font-light">Nenhum produto encontrado correspondente a esta busca.</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); }}
            className="text-xs font-sans text-[#b88c97] font-bold underline"
          >
            Limpar filtros e pesquisar de novo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => {
            const isFav = (userProfile.favoriteProducts || []).includes(product.id);
            return (
              <div
                key={product.id}
                className="bg-white border border-rose-50/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                {/* Image panel */}
                <div className="relative h-44 bg-stone-50 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                    onClick={() => setSelectedProduct(product)}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-stone-100 text-stone-700 font-sans text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    {product.category}
                  </span>

                  {/* Favorite action icon overlay */}
                  <button
                    onClick={() => handleToggleFavorite(product.id)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow ${
                      isFav 
                        ? 'bg-rose-50 text-rose-500 scale-105' 
                        : 'bg-white/85 backdrop-blur-md text-stone-400 hover:text-rose-500 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Info Text */}
                <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[10px] font-semibold font-mono text-stone-700">{product.rating.toFixed(1)}</span>
                      <span className="text-[9px] text-stone-400 font-sans font-light">(Avaliado)</span>
                    </div>
                    <h4 
                      onClick={() => setSelectedProduct(product)}
                      className="font-display font-semibold text-gray-800 text-xs line-clamp-1 hover:text-rose-500 cursor-pointer"
                    >
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-sans line-clamp-2 leading-relaxed font-light">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-stone-50 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-stone-400 font-sans block leading-none">Preço Lady</span>
                      <span className="text-xs font-bold text-gray-900 font-mono">R$ {product.price.toFixed(2)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[8px] text-rose-400 font-semibold block leading-none">Retorna</span>
                      <span className="text-[10px] font-bold text-rose-500 font-mono">+{product.pointsGranted} pts</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#3d232e] hover:bg-[#201116] text-white font-sans text-[11px] font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-300" />
                    Adicionar Sacola
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-rose-100 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-all z-10 font-bold"
              >
                ✕
              </button>

              <div className="h-60 relative">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-5 text-white">
                  <div>
                    <span className="bg-amber-400 text-stone-950 font-sans font-bold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 inline-block">
                      {selectedProduct.category}
                    </span>
                    <h3 className="font-display font-bold text-lg leading-tight">{selectedProduct.name}</h3>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-stone-600 font-sans leading-relaxed font-light">
                  {selectedProduct.description}
                </p>

                <div className="bg-stone-50 p-3.5 rounded-2xl flex justify-between items-center border border-stone-100">
                  <div>
                    <span className="text-[9px] text-stone-400 block font-light font-sans leading-none">Estoque disponível</span>
                    <span className="text-xs font-semibold text-stone-800 font-mono">{selectedProduct.stock} unidades</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-400 block font-light font-sans leading-none">Fidelidade Next Lady</span>
                    <span className="text-xs font-bold text-rose-500 font-semibold font-sans">Acumula +{selectedProduct.pointsGranted} pontos</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <div className="bg-stone-100 text-stone-900 border border-stone-200 px-4 py-3.5 rounded-2xl font-mono text-sm font-bold flex items-center gap-1.5 shrink-0">
                    R$ {selectedProduct.price.toFixed(2)}
                  </div>
                  
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#29171e] to-[#4c2d3a] hover:from-[#3a202a] hover:to-[#5e3848] text-white font-sans text-xs font-bold py-3.5 rounded-2xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-200" />
                    Adicionar à Sacola
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Slider Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-stone-950/45 backdrop-blur-xs z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white max-w-md w-full h-full shadow-2xl border-l border-rose-100 flex flex-col overflow-hidden"
            >
              {/* Cart Header */}
              <div className="p-5 border-b border-rose-50 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#3d232e]" />
                  <h3 className="font-display font-medium text-gray-800 text-sm uppercase tracking-wider">Sua Sacola Lady</h3>
                  <span className="bg-rose-100 text-rose-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalItemsCount}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-rose-50 rounded-xl text-stone-500 hover:text-rose-500 font-bold text-sm cursor-pointer transition-colors"
                >
                  Fechar ✕
                </button>
              </div>

              {/* Cart Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-400">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-display font-semibold text-stone-700 text-sm">Sacola vazia</p>
                      <p className="text-xs text-stone-400 font-sans max-w-[240px] leading-relaxed">Navegue pelas ofertas cosméticas Next Lady e adicione produtos para acumular pontos!</p>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="bg-stone-100 hover:bg-stone-200 text-[#3d232e] font-sans text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Continuar Comprando
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex gap-3.5 items-center justify-between"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-250 shrink-0"
                        referrerPolicy="no-referrer"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-display font-semibold text-stone-800 text-xs truncate leading-normal">
                          {item.product.name}
                        </h4>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-[#b88c97] block">
                            R$ {item.product.price.toFixed(2)}
                          </span>
                          
                          <div className="flex items-center gap-2 border border-stone-250 bg-white rounded-lg px-2 py-0.5">
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, -1)}
                              className="text-stone-400 hover:text-[#3d232e] p-0.5 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-xs font-semibold text-stone-800 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, 1)}
                              className="text-stone-400 hover:text-[#3d232e] p-0.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, -item.quantity)}
                        className="p-1.5 text-stone-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer Summary */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-rose-50 bg-stone-50 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-stone-500 font-light">
                      <span>Total de itens</span>
                      <span className="font-mono">{totalItemsCount}</span>
                    </div>
                    <div className="flex justify-between text-stone-500 font-light items-center">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        Ganho de Pontos Fidelidade
                      </span>
                      <span className="font-semibold text-rose-600">+{totalPoints} pts</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-stone-200">
                      <span className="font-sans font-bold text-stone-800">Valor Total</span>
                      <span className="font-mono text-base font-bold text-stone-900">R$ {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-sans text-xs font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Finalizar Compra Segura
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Success Sheet Alert */}
      <AnimatePresence>
        {orderSuccess && latestOrder && (
          <div className="fixed inset-0 bg-[#0000004d] backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-rose-100 shadow-2xl p-6.5 max-w-sm w-full text-center space-y-5"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-display font-medium text-stone-800 text-base">Compra Concluída!</h3>
                <p className="text-[11px] text-stone-400 font-sans tracking-wide">Código do pedido: <strong className="font-mono text-stone-800">{latestOrder.id}</strong></p>
                <p className="text-xs text-stone-500 font-sans leading-relaxed pt-2">
                  Muito obrigada por confiar na Next Lady. Seu pedido já foi enviado ao setor de expedição! 
                </p>
              </div>

              <div className="bg-[#fff9fa] border border-rose-50 p-3 rounded-2xl text-[11px] text-[#3d232e] leading-snug font-sans flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
                <span>Você resgatou <strong>{latestOrder.points} pontos</strong> de fidelidade! Saldo atualizado: <strong>{userProfile.points} pts</strong>.</span>
              </div>

              <button
                onClick={() => setOrderSuccess(false)}
                className="w-full bg-[#3d232e] hover:bg-[#1a0f14] text-white font-sans text-xs font-bold py-3 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Voltar à Loja
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
