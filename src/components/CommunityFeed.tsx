import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, Share2, Plus, Filter, Send, Image as ImageIcon, Sparkles, User, Gift, Award, Check } from 'lucide-react';
import { CommunityPost, UserProfile } from '../types';
import { INITIAL_POSTS } from '../data';

interface CommunityFeedProps {
  userProfile: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onAddNotification: (title: string, message: string, type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema') => void;
}

export default function CommunityFeed({ userProfile, onUpdateUser, onAddNotification }: CommunityFeedProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('next_lady_community_posts');
    if (saved) return JSON.parse(saved);
    return INITIAL_POSTS;
  });

  const [filter, setFilter] = useState<string>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessPoints, setShowSuccessPoints] = useState<string | null>(null);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Cabelo' | 'Skincare' | 'Unhas' | 'Maquiagem' | 'Inspiração'>('Inspiração');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState(userProfile.name || '');
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Comment input state dictionary [postId]: commentText
  const [commentsInput, setCommentsInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (userProfile.name) {
      setNewAuthor(userProfile.name);
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('next_lady_community_posts', JSON.stringify(posts));
  }, [posts]);

  // Mock beauty stock photos that clients can pick for their tips
  const STOCK_PHOTOS = [
    { url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400', label: 'Salão & Cabelos' },
    { url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400', label: 'Skincare' },
    { url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400', label: 'Esmaltação' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400', label: 'Maquiagem' },
    { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400', label: 'Glow' }
  ];

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const hasLiked = !post.hasLiked;
        return {
          ...post,
          hasLiked,
          likes: hasLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleShare = (postTitle: string) => {
    navigator.clipboard.writeText(`Confira esta publicação inspiradora de beleza no Next Lady: "${postTitle}"`);
    alert('Link de compartilhamento copiado! Envie no WhatsApp para inspirar mulheres. 👑');
  };

  const handleCommentSubmit = (postId: string, e: FormEvent) => {
    e.preventDefault();
    const commentText = commentsInput[postId];
    if (!commentText || !commentText.trim()) return;

    // Grant +10 loyalty points for commenting
    const prevPoints = userProfile.points || 0;
    onUpdateUser({
      ...userProfile,
      points: prevPoints + 10
    });

    onAddNotification(
      'Interação Premiada! 💬',
      'Você comentou no mural e ganhou +10 pontos no painel de recompensas!',
      'comunidade'
    );

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c-${Date.now()}`,
              author: userProfile.name || 'Lady Integrante',
              content: commentText.trim(),
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return post;
    }));

    setCommentsInput(prev => ({ ...prev, [postId]: '' }));
    
    setShowSuccessPoints("Você ganhou +10 Pontos de Fidelidade!");
    setTimeout(() => {
      setShowSuccessPoints(null);
    }, 4000);
  };

  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Por favor preencha o título e o conteúdo da sua publicação.');
      return;
    }

    // Grant +20 loyalty points for creating post
    const prevPoints = userProfile.points || 0;
    onUpdateUser({
      ...userProfile,
      points: prevPoints + 20
    });

    onAddNotification(
      'Compartilhamento Premiado! 👑',
      'Parabéns! Sua publicação de beleza e visagismo foi enviada e rendeu +20 pontos no Loyalty HUB!',
      'comunidade'
    );

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: newAuthor.trim() || userProfile.name || 'Lady Integrante',
      avatar: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      likes: 1,
      hasLiked: true,
      comments: [],
      createdAt: new Date().toISOString(),
      image: selectedImage || undefined
    };

    setPosts([newPost, ...posts]);
    setShowAddModal(false);
    
    // Clear form
    setNewTitle('');
    setNewContent('');
    setSelectedImage('');

    setShowSuccessPoints("Seu Post deu +20 Pontos de Fidelidade!");
    setTimeout(() => {
      setShowSuccessPoints(null);
    }, 4500);
  };

  const categories = ['Todos', 'Cabelo', 'Skincare', 'Unhas', 'Maquiagem', 'Inspiração'];

  const filteredPosts = filter === 'Todos' 
    ? posts 
    : posts.filter(post => post.category.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6" id="community-feed-section">
      
      {/* Dynamic Score feedback overlay */}
      {showSuccessPoints && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-3xl flex items-center justify-between shadow-sm max-w-md mx-auto animate-fadeIn duration-300">
          <div className="flex items-center gap-2.5 text-xs text-emerald-800 font-sans font-bold">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{showSuccessPoints}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">LOYALTY RENEWED</span>
        </div>
      )}

      {/* Intro Bannner */}
      <div className="bg-gradient-to-r from-red-500/5 via-amber-250/5 to-transparent border border-rose-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-sans text-[11px] font-semibold border border-rose-100">
            <Gift className="w-3.5 h-3.5" /> Comunidade Amiga VIP
          </span>
          <h3 className="font-display font-semibold text-xl text-gray-800 leading-snug">Roda de Inspiração e Empatia</h3>
          <p className="text-xs font-sans text-gray-500 max-w-xl leading-relaxed font-light">
            Descubra relatos e hacks de rotinas estéticas criadas por outras Ladies. Publique suas resenhas sobre cortes, maquiagens e mimos. Participe ativamente e acumule pontos de fidelidade no Loyalty HUB!
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
          }}
          className="bg-[#29171e] hover:bg-black font-sans text-white font-bold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer active:scale-98"
          type="button"
        >
          <Plus className="w-4 h-4 text-amber-200" />
          Compartilhar Dica
        </button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setFilter(cat)}
            className={`font-sans text-[11px] font-bold px-4 py-2.5 rounded-2xl transition-all shrink-0 border uppercase tracking-wider cursor-pointer ${
              filter === cat
                ? 'bg-[#3d232e] text-amber-200 border-stone-850 shadow'
                : 'bg-white text-gray-400 border-rose-50 hover:border-stone-400 hover:text-stone-850'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {filteredPosts.map(post => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-rose-50 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row gap-6 p-5"
            >
              {/* Image Section if exists */}
              {post.image && (
                <div className="w-full md:w-80 h-48 md:h-auto rounded-2xl overflow-hidden shrink-0 relative bg-stone-50">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md shadow-xs px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold text-rose-600 uppercase tracking-wider">
                    {post.category}
                  </div>
                </div>
              )}

              {/* Text & Interactions Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    {/* User profile */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-8 h-8 rounded-full object-cover border border-rose-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h5 className="font-sans font-bold text-xs text-stone-850">{post.author}</h5>
                        <p className="text-[9px] text-gray-400 font-mono leading-none mt-0.5">
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')} às {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {!post.image && (
                      <span className="text-[9px] bg-rose-50 text-rose-600 font-sans font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider border border-rose-100">
                        {post.category}
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-semibold text-gray-900 text-base md:text-lg leading-snug">
                    {post.title}
                  </h4>
                  <p className="font-sans text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-light">
                    {post.content}
                  </p>
                </div>

                {/* Likes, Comments counter & interactive inputs */}
                <div className="border-t border-rose-50 pt-4 mt-4 space-y-4">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-sans font-bold hover:text-rose-600 transition-colors cursor-pointer ${
                        post.hasLiked ? 'text-rose-500' : 'text-gray-400'
                      }`}
                      type="button"
                    >
                      <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current text-rose-500' : ''}`} />
                      <span>{post.likes} Amei</span>
                    </button>

                    <span className="flex items-center gap-1.5 text-[11px] font-sans font-bold text-gray-450">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span>{post.comments.length} Comentários</span>
                    </span>

                    <button
                      onClick={() => handleShare(post.title)}
                      className="flex items-center gap-1.5 text-[11px] font-sans font-bold text-gray-400 hover:text-stone-850 transition-colors ml-auto cursor-pointer"
                      type="button"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartilhar</span>
                    </button>
                  </div>

                  {/* Active Comments of the Post */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-2xl border border-rose-50">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="text-[11px] font-sans leading-normal">
                          <p className="text-gray-700">
                            <strong className="text-stone-850 font-semibold mr-1">{comment.author}:</strong>
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment writing form */}
                  <form
                    onSubmit={(e) => handleCommentSubmit(post.id, e)}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Deixe uma palavra parceira ou elogio..."
                      value={commentsInput[post.id] || ''}
                      onChange={(e) => setCommentsInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-grow bg-stone-50 border border-stone-150 px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800 font-sans focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!(commentsInput[post.id] || '').trim()}
                      className="bg-stone-100 hover:bg-[#3d232e] text-stone-600 hover:text-amber-200 border border-stone-200 disabled:opacity-40 rounded-xl px-3 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-rose-100 rounded-3xl" id="empty-posts">
            <Sparkles className="w-8 h-8 text-rose-300 mx-auto mb-3 animate-pulse" />
            <h5 className="font-display font-medium text-gray-800 text-sm">Ainda sem publicações em {filter}</h5>
            <p className="text-xs text-gray-400 font-sans mt-1">Quer inspirar nossa comunidade? Compartilhe um relato seu!</p>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn" id="create-post-modal">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-rose-100">
            {/* Modal Header */}
            <div className="border-b border-rose-100 px-6 py-4.5 flex justify-between items-center bg-stone-50">
              <h4 className="font-display font-semibold text-gray-800 text-sm">Inspirar com publicação real</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-650 transition-colors text-base font-bold cursor-pointer"
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] text-stone-400 font-sans font-bold uppercase tracking-wider block mb-1">Seu Nome / Hashtag de Autora</label>
                <input
                  type="text"
                  placeholder="Ex: Luísa Vasconcelos @lady"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 text-gray-850 font-sans focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-stone-400 font-sans font-bold uppercase tracking-wider block mb-1">Título do Post</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Minha loção diária de Vitamina C"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 text-gray-850 font-sans focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-400 font-sans font-bold uppercase tracking-wider block mb-1">Assunto / Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 text-gray-850 font-sans cursor-pointer focus:bg-white"
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Unhas">Unhas</option>
                    <option value="Maquiagem">Maquiagem</option>
                    <option value="Inspiração">Inspiração</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 font-sans font-bold uppercase tracking-wider block mb-1">O que gostaria de compartilhar com o grupo? *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Conte sua rotina de skincare, transição capilar ou conselho de empoderamento..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 text-gray-850 font-sans resize-none focus:bg-white"
                />
              </div>

              {/* Decorative Image selector */}
              <div>
                <label className="text-[10px] text-stone-400 font-sans font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-400" /> Escolha uma Foto Ilustrativa:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {STOCK_PHOTOS.map((photo, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setSelectedImage(photo.url)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                        selectedImage === photo.url ? 'border-[#3d232e] scale-95 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-rose-50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-stone-50 hover:bg-stone-100 text-gray-700 font-sans text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="bg-[#29171e] hover:bg-black text-amber-200 font-sans text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow shadow-rose-950/20 cursor-pointer flex items-center gap-1"
                >
                  <Award className="w-4 h-4 animate-bounce" /> Publicar (+20 Pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
