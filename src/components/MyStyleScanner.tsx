import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Camera, Upload, Share2, Download, Check, 
  RefreshCw, Star, Heart, MessageSquare, ArrowRight, 
  UserCheck, Trash2, Calendar, FileText, Send, Save, Eye, Smartphone
} from 'lucide-react';
import { UserProfile } from '../types';

interface MyStyleScannerProps {
  userProfile: UserProfile;
  onAddNotification: (title: string, message: string, type: 'agendamento' | 'promocao' | 'loja' | 'comunidade' | 'sistema') => void;
  onNavigateToTab: (tab: string) => void;
  onUpdateUser: (updated: UserProfile) => void;
}

interface SavedAnalysis {
  id: string;
  date: string;
  photo: string;
  faceShape: string;
  skinTone: string;
  skinColor: string;
  hairType: string;
  hairLength: string;
  eyeShape: string;
  lipShape: string;
  facialStructure: string;
  generalCharacteristics: string;
  suggestions: {
    trancas: string;
    maquiagem: string;
    cortes: string;
    cores: string;
    penteados: string;
    sobrancelhas: string;
    cilios: string;
  };
}

interface FavoriteStyle {
  id: string;
  styleName: string;
  styleCategory: string;
  styleDesc: string;
  imageUrl: string;
  date: string;
}

const PORTRAIT_MODELS = [
  { id: 'm1', name: 'Alana (Cacheadas)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
  { id: 'm2', name: 'Gabriela (Crespas)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400' },
  { id: 'm3', name: 'Juliana (Lisos)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' },
  { id: 'm4', name: 'Yasmine (Tranças)', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400' }
];

export default function MyStyleScanner({ userProfile, onAddNotification, onNavigateToTab, onUpdateUser }: MyStyleScannerProps) {
  // Main face analysis states
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Analysis result structure
  const [analysisResult, setAnalysisResult] = useState<SavedAnalysis['suggestions'] & Omit<SavedAnalysis, 'id' | 'date' | 'photo' | 'suggestions'>>({
    faceShape: 'Oval Hexagonal (Formato de alto impacto visual e simetria áurea)',
    skinTone: 'Quente Dourado - Subtom Oliva Suave',
    skinColor: 'Negra Iluminada (Ébano Médio Real)',
    hairType: 'Crespo Cacho Tipo 4A',
    hairLength: 'Médio (na altura da clavícula)',
    eyeShape: 'Amendoados e Expressivos',
    lipShape: 'Volumosos e Perfeitamente Simétricos',
    facialStructure: 'Estrutura zigomática proeminente, osso mandibular bem definido',
    generalCharacteristics: 'Proporções faciais harmônicas, excelente simetria ocular de alto contraste.',
    trancas: 'Goddess Braids com design simétrico e acessórios dourados no comprimento.',
    maquiagem: 'Maquiagem Glamorous Sunset com sombras rose gold, delineado gatinho e pele iluminada.',
    cortes: 'Corte repicado redondo em camadas visagistas para volume natural.',
    cores: 'Iluminado Cobre Canela ou Mel Dourado nas pontas.',
    penteados: 'Afro Puff Imperial com joias ou Coque Alto estruturado.',
    sobrancelhas: 'Design natural arqueado com preenchimento em Henna suave.',
    cilios: 'Volume Russo Light, enfatizando os cantos externos.'
  });

  // Photo History & saved analyses
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [favoriteStyles, setFavoriteStyles] = useState<FavoriteStyle[]>([]);
  
  // Selection states for styling generator
  const [activeCategory, setActiveCategory] = useState<'trancas' | 'maquiagem' | 'cabelo' | 'sobrancelhas' | 'cilios'>('trancas');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customStyleNotes, setCustomStyleNotes] = useState<string>('');

  // AI Generation states
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [compareMode, setCompareMode] = useState<number>(50); // slider before/after percentage
  const [isSavedInFavs, setIsSavedInFavs] = useState(false);
  const [isSentToSalon, setIsSentToSalon] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Suggested style templates corresponding to each category
  const categoryStyles: Record<string, Array<{ name: string, desc: string }>> = {
    trancas: [
      { name: 'Box Braids Soltas', desc: 'Tranças clássicas de fibra sintética leve que garantem proteção, simetria e altíssimo impacto visual.' },
      { name: 'Knotless Braids Soft', desc: 'Preparo sem nós na raiz com divisão geométrica orgânica, reduzindo tração e oferecendo leveza natural.' },
      { name: 'Goddess Braids Douradas', desc: 'Tranças de luxo mescladas com pontas e mechas onduladas soltas que emolduram o queixo, enriquecidas com fios dourados.' },
      { name: 'Fulani Braids Boho', desc: 'Padrões milenares com tranças coladas na raiz direcionadas para as laterais, decoradas com miçangas translúcidas.' },
      { name: 'Tribal Braids Front', desc: 'Arranjo com duas ou três camadas de tranças robustas, oferecendo um caimento deslumbrante em todas as ocasiões.' },
      { name: 'Cornrows Clássicas', desc: 'Tranças coladas perfeitamente alinhadas do início até a nuca, realçando ao máximo a simetria facial visagista.' }
    ],
    maquiagem: [
      { name: 'Maquiagem Natural Glow', desc: 'Aspecto saudável e hidratado, corretivo iluminador leve, blush pêssego e lábios finalizados com lip tint natural.' },
      { name: 'Maquiagem Social Matte', desc: 'Cobertura impecável aveludada, contorno inteligente, esfumado neutro opaco perfeito para casamentos e banquetes.' },
      { name: 'Maquiagem Glam Sunset', desc: 'Alta cintilância metalizada rose-gold na pálpebra móvel, delineado firme e iluminador pontual de alta definição.' },
      { name: 'Maquiagem para Festas Deluxe', desc: 'Saturados marcantes, esfumado escuro sofisticado e batom vermelho selado de alta durabilidade.' },
      { name: 'Maquiagem Profissional Foto', desc: 'Foco em técnicas de contorno de passarela que reagem impecavelmente bem sob foco de luzes de estúdio profissionais.' }
    ],
    cabelo: [
      { name: 'Corte Repicado Redondo', desc: 'Camadas graduadas circulares que distribuem o volume dos fios, ideal para valorizar a definição dos cachos e crespos.' },
      { name: 'Butterfly Cut Elegante', desc: 'Franja longa desfiada unida a camadas de comprimento médio que simulam asas de borboleta em movimento.' },
      { name: 'Bob Médio Desconectado', desc: 'Corte sutilmente assimétrico na altura da clavícula que concede jovialidade e atitude moderna.' },
      { name: 'Ombré Canela Quente', desc: 'Tons calorosos caramelo e canela acobreado clareando de forma suave do meio para as pontas.' },
      { name: 'Coque Imperial Texturizado', desc: 'Penteado afro-chic volumoso estruturado de luxo, perfeito para destacar o pescoço e brincos sofisticados.' }
    ],
    sobrancelhas: [
      { name: 'Design com Henna Ombré', desc: 'Preenchimento em degradê sutil focado no arco e cauda da sobrancelha, proporcionando profundidade sem pesar.' },
      { name: 'Brow Lamination Alinhada', desc: 'Alinhamento completo dos pelos para cima com nutrição de queratina, concedendo um visual editorial de passarela.' },
      { name: 'Design Integrado Clínico', desc: 'Medição precisa baseada nas proporções ósseas áureas para suavizar ou acenar o olhar de forma natural.' }
    ],
    cilios: [
      { name: 'Lash Lifting Nutritivo', desc: 'Curvatura e coloração natural dos próprios cílios, infundido com óleos vitamínicos durantes 6 a 8 semanas.' },
      { name: 'Volume Russo Light', desc: 'Extensão sofisticada e macia de fios ultrafinos que conferem preenchimento ideal e leveza ao piscar.' },
      { name: 'Efeito Gatinho Sexy', desc: 'Comprimento alongado concentrado exclusivamente no canto externo dos olhos, levantando a moldura ocular.' }
    ]
  };

  useEffect(() => {
    // Load lists from LocalStorage
    const loadedAnalyses = localStorage.getItem('next_lady_saved_analyses');
    if (loadedAnalyses) {
      setSavedAnalyses(JSON.parse(loadedAnalyses));
    }
    const loadedFavs = localStorage.getItem('next_lady_favorite_styles');
    if (loadedFavs) {
      setFavoriteStyles(JSON.parse(loadedFavs));
    }
  }, []);

  const scanStepsText = [
    'Carregando arquivo de imagem facial em alta resolução...',
    'Detectando proporções ósseas, formato de olhos e lábios...',
    'Avaliando tom e subtom cromático da sua pele...',
    'Cruzando características com o catálogo estético da Next Lady...'
  ];

  const generationStepsText = [
    'Submetendoretrato original ao motor de retoque avançado...',
    'Aplicando modificações cosméticas fotorrealistas de alta precisão...',
    'Preservando sua estrutura facial e harmonia original...',
    'Renderizando textura fotorrealista final em altíssima resolução...'
  ];

  // File choice trigger
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhoto(event.target.result as string);
          setHasScanned(false);
          setGeneratedImage(null);
          setCameraActive(false);
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Camera handling
  const startCamera = async () => {
    setCameraActive(true);
    setSelectedPhoto(null);
    setHasScanned(false);
    setGeneratedImage(null);
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMessage('Não foi possível obter acesso à câmera do dispositivo. Por favor, envie uma foto da galeria.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setSelectedPhoto(dataUrl);
        
        // Kill camera stream
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setCameraActive(false);
      }
    }
  };

  // Run backend-integrated AI Face Analysis
  const handleStartScan = async () => {
    if (!selectedPhoto) return;
    setIsScanning(true);
    setScanStep(0);
    setErrorMessage(null);

    // Setup an interval to animate the progress steps
    const stepInterval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 1000);

    try {
      const response = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: selectedPhoto })
      });

      if (!response.ok) {
        throw new Error('Falha no processamento da análise facial pela rede.');
      }

      const data = await response.json();
      
      clearInterval(stepInterval);
      setAnalysisResult({
        faceShape: data.faceShape || 'Oval Simétrico',
        skinTone: data.skinTone || 'Subtom Quente',
        skinColor: data.skinColor || 'Tom Negro Iluminado',
        hairType: data.hairType || 'Crespo Cacho Tipo 4A',
        hairLength: data.hairLength || 'Médio',
        eyeShape: data.eyeShape || 'Amendoados',
        lipShape: data.lipShape || 'Volumosos',
        facialStructure: data.facialStructure || 'Estrutura zigomática proeminente',
        generalCharacteristics: data.generalCharacteristics || 'Beleza marcante simétrica.',
        trancas: data.suggestions?.trancas || 'Goddess Braids ou Knotless Braids.',
        maquiagem: data.suggestions?.maquiagem || 'Maquiagem Glam com brilho dourado.',
        cortes: data.suggestions?.cortes || 'Corte repicado redondo visagista.',
        cores: data.suggestions?.cores || 'Iluminado Cobre Canela.',
        penteados: data.suggestions?.penteados || 'Afro Puff Imperial.',
        sobrancelhas: data.suggestions?.sobrancelhas || 'Design com Henna suave.',
        cilios: data.suggestions?.cilios || 'Volume Russo Light.'
      });

      // Auto-select first recommended style of category
      const firstStyleOfCat = categoryStyles[activeCategory]?.[0]?.name || '';
      setSelectedStyle(firstStyleOfCat);

      setHasScanned(true);
      onAddNotification(
        'Dossiê Visagista Gerado! ✨',
        'Seu perfil de beleza foi minuciosamente mapeado por nossa Inteligência Artificial estética.',
        'sistema'
      );

    } catch (err: any) {
      console.error(err);
      setErrorMessage('Ocorreu um erro ao processar sua análise facial. Selecione um retrato iluminado de frente e tente de novo.');
    } finally {
      setIsScanning(false);
    }
  };

  // Run backend-integrated AI Style Photo Generator (preserving face)
  const handleGenerateStyleImage = async () => {
    if (!selectedPhoto || !selectedStyle) return;
    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedImage(null);
    setIsSavedInFavs(false);
    setIsSentToSalon(false);

    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 1100);

    try {
      const chosenTemplate = categoryStyles[activeCategory].find(s => s.name === selectedStyle);
      const styleDesc = `${chosenTemplate?.desc || ''} Notes: ${customStyleNotes}`;

      const response = await fetch('/api/generate-stylized-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalImage: selectedPhoto,
          styleCategory: activeCategory,
          styleName: selectedStyle,
          styleDesc: styleDesc
        })
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com o gerador de imagens de estilo.');
      }

      const data = await response.json();
      clearInterval(stepInterval);
      setGeneratedImage(data.imageUrl);

      onAddNotification(
        'Simulação Concluída! 🎭',
        `Sua foto vestindo o estilo "${selectedStyle}" foi gerada com perfeição fotorrealista.`,
        'sistema'
      );
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao gerar sua simulação estática. Tente novamente ou selecione outro modelo de estilo.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current face analysis report
  const handleSaveAnalysis = () => {
    const newAnalysis: SavedAnalysis = {
      id: 'analysis_' + Date.now(),
      date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      photo: selectedPhoto || '',
      faceShape: analysisResult.faceShape,
      skinTone: analysisResult.skinTone,
      skinColor: analysisResult.skinColor,
      hairType: analysisResult.hairType,
      hairLength: analysisResult.hairLength,
      eyeShape: analysisResult.eyeShape,
      lipShape: analysisResult.lipShape,
      facialStructure: analysisResult.facialStructure,
      generalCharacteristics: analysisResult.generalCharacteristics,
      suggestions: {
        trancas: analysisResult.trancas,
        maquiagem: analysisResult.maquiagem,
        cortes: analysisResult.cortes,
        cores: analysisResult.cores,
        penteados: analysisResult.penteados,
        sobrancelhas: analysisResult.sobrancelhas,
        cilios: analysisResult.cilios
      }
    };

    const updated = [newAnalysis, ...savedAnalyses];
    setSavedAnalyses(updated);
    localStorage.setItem('next_lady_saved_analyses', JSON.stringify(updated));
    alert('Análise visagista de inteligência artificial arquivada com sucesso para suas futuras consultas!');
  };

  // Save currently generated image with details to Favorite Styles
  const handleSaveToFavorites = () => {
    if (!generatedImage) return;

    const newFav: FavoriteStyle = {
      id: 'style_fav_' + Date.now(),
      styleName: selectedStyle,
      styleCategory: activeCategory,
      styleDesc: categoryStyles[activeCategory].find(s => s.name === selectedStyle)?.desc || '',
      imageUrl: generatedImage,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newFav, ...favoriteStyles];
    setFavoriteStyles(updated);
    localStorage.setItem('next_lady_favorite_styles', JSON.stringify(updated));
    setIsSavedInFavs(true);

    onAddNotification(
      'Estilo Favoritado! 💖',
      `O visual "${selectedStyle}" foi adicionado aos seus favoritos estéticos.`,
      'loja'
    );
  };

  // Download Generated visual locally
  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `nextlayer_ai_styling_${selectedStyle.toLowerCase().replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share visually directly on WhatsApp
  const handleShareToWhatsApp = () => {
    const styleInfo = categoryStyles[activeCategory].find(s => s.name === selectedStyle);
    const text = `✨ *Consultora de Beleza IA - Next Lady* ✨%0A%0A` +
      `Olá! Estive planejando minha mudança de visual pelo App Next Lady e quero compartilhar o estilo simulado por IA que adorei:%0A%0A` +
      `• *Canal:* Consultora de Beleza IA%0A` +
      `• *Serviço Escolhido:* ${selectedStyle} (${activeCategory.toUpperCase()})%0A` +
      `• *Dossiê do Estilo:* ${styleInfo?.desc}%0A%0A` +
      `Ficou maravilhoso! Vamos agendar uma data para mim? 👑`;
    
    window.open(`https://wa.me/5511991234567?text=${text}`, '_blank');
  };

  // Integration with Salões: Enviar Diretamente ao Salão (centralized synching)
  const handleSendToSalonProposals = () => {
    if (!generatedImage) return;

    const proposal = {
      id: 'proposal_' + Date.now(),
      clientName: userProfile.name || 'Princesa Registrada',
      clientPhone: userProfile.whatsapp || '(11) 99123-4567',
      clientLocation: userProfile.location || 'São Paulo',
      clientAvatar: userProfile.avatar,
      styleCategory: activeCategory,
      styleName: selectedStyle,
      styleDesc: categoryStyles[activeCategory].find(s => s.name === selectedStyle)?.desc || '',
      customNotes: customStyleNotes,
      generatedImage: generatedImage,
      originalImage: selectedPhoto,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDENTE'
    };

    const existing = JSON.parse(localStorage.getItem('next_lady_style_proposals') || '[]');
    localStorage.setItem('next_lady_style_proposals', JSON.stringify([proposal, ...existing]));
    setIsSentToSalon(true);

    onAddNotification(
      'Estilo Enviado ao Salão! 👑',
      `Sua imagem gerada e detalhes de "${selectedStyle}" foram transmitidos e integrados à fila corporativa.`,
      'agendamento'
    );
    alert('Dossiê visagista e estilo enviados com sucesso diretamente ao painel corporativo do Salão Next Lady! Nossos especialistas Gabriela, Beatriz e Mariana revisarão seu material para alinhar o resultado impecável durante sua próxima consulta.');
  };

  const handleDeleteAnalysis = (id: string, e: any) => {
    e.stopPropagation();
    const filtered = savedAnalyses.filter(a => a.id !== id);
    setSavedAnalyses(filtered);
    localStorage.setItem('next_lady_saved_analyses', JSON.stringify(filtered));
  };

  const handleDeleteFavStyle = (id: string, e: any) => {
    e.stopPropagation();
    const filtered = favoriteStyles.filter(f => f.id !== id);
    setFavoriteStyles(filtered);
    localStorage.setItem('next_lady_favorite_styles', JSON.stringify(filtered));
  };

  return (
    <div className="bg-[#faf8f8] rounded-3xl p-6 border border-rose-100 shadow-md space-y-8" id="consultora-beleza-ia-exclusive-area">
      
      {/* Visual Editorial Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#1d1014] to-[#3a1d26] p-6 rounded-2xl text-white">
        <div className="space-y-1.5">
          <span className="bg-amber-400 text-stone-950 font-sans text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 fill-stone-950 animate-pulse text-amber-950" /> Consultora de Beleza IA Next Lady
          </span>
          <h3 className="font-display font-semibold text-xl text-stone-100 flex items-center gap-2">
            Análise e Estilização Facial Avançada
          </h3>
          <p className="text-[11px] text-rose-100 font-light max-w-2xl leading-relaxed">
            Tire uma foto instantânea com o sensor da sua câmera, carregue um arquivo pessoal ou selecione fotos de nossas modelos. Deixe o motor de Inteligência Artificial Estética mapear seus traços físicos e propor designs incríveis de tranças, maquiagens e penteados preservando seu rosto original!
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block" />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Upload, capture, active view (Lg: 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-xs text-stone-800 uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <Camera className="w-3.5 h-3.5 text-rose-600" /> 1. Retrato de Referência
            </h4>

            {/* Interativo Camera/Photo Preview Window */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-900 border-2 border-dashed border-rose-200 flex flex-col justify-center items-center text-center p-3">
              {cameraActive ? (
                <div className="absolute inset-0 flex flex-col">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover flex-1" />
                  <div className="p-3 bg-stone-950 flex justify-center gap-2 z-10">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="bg-amber-400 hover:bg-amber-505 text-stone-950 font-bold font-sans text-xs px-5 py-3 rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      Bater Foto <Camera className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraActive(false)}
                      className="bg-white/10 text-stone-300 font-sans text-xs px-4 py-2 rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : selectedPhoto ? (
                <div className="absolute inset-0">
                  <img src={selectedPhoto} alt="Ref para IA" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#3d232ebf] backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 space-y-4">
                      <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center animate-spin border border-amber-300 shadow">
                        <RefreshCw className="w-6 h-6 text-stone-950" />
                      </div>
                      <p className="font-sans text-[11px] text-center font-bold tracking-wide text-amber-200">{scanStepsText[scanStep]}</p>
                      <div className="w-3/4 bg-white/20 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full transition-all duration-1000" 
                          style={{ width: `${(scanStep + 1) * 25}%` }} 
                        />
                      </div>
                    </div>
                  )}

                  {!isScanning && (
                    <button
                      type="button"
                      onClick={() => { setSelectedPhoto(null); setHasScanned(false); setGeneratedImage(null); }}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-xl p-2.5 transition-all shadow-md z-10 border border-red-500 cursor-pointer"
                      title="Deletar foto corrente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-stone-400 p-4">
                  <div className="w-16 h-16 bg-[#faf8f8] border border-rose-50 text-rose-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#3d232e] block">Arraste ou capture sua selfie de retrato</span>
                    <span className="text-[10px] text-stone-400 block max-w-xs mx-auto">Posicione o rosto de maneira frontal com iluminação clara para melhor precisão da inteligência visagista.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Inputs & action select buttons */}
            {!selectedPhoto && !cameraActive && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="bg-[#3d232e] hover:bg-[#201218] text-amber-200 py-3 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer border border-[#4d323d]"
                  >
                    <Camera className="w-4 h-4" /> Câmera Inteligente
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="bg-white hover:bg-stone-50 text-[#3d232e] border border-rose-200 py-3 rounded-xl font-sans font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4" /> Enviar da Galeria
                  </button>
                </div>
                
                <input
                  type="file"
                  id="exclusive-image-uploader"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Portrait model selection options for premium testing */}
                <div className="space-y-2 pt-1 border-t border-rose-50">
                  <span className="text-[9px] text-stone-400 font-mono font-bold uppercase tracking-wider block text-center">— OU PREFIRA MODELOS PRONTAS DE REFERÊNCIA —</span>
                  <div className="grid grid-cols-4 gap-2">
                    {PORTRAIT_MODELS.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => { setSelectedPhoto(model.url); setHasScanned(false); setGeneratedImage(null); }}
                        className="relative rounded-lg overflow-hidden h-14 border border-rose-100 hover:scale-105 transition-all cursor-pointer"
                        title={model.name}
                      >
                        <img src={model.url} alt={model.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-0 inset-x-0 bg-stone-950/65 text-white text-[7px] text-center truncate py-0.5">{model.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions once photo is loaded */}
            {selectedPhoto && !hasScanned && !isScanning && (
              <button
                type="button"
                onClick={handleStartScan}
                className="w-full bg-gradient-to-r from-rose-900 to-rose-950 hover:from-stone-900 hover:to-stone-950 text-amber-250 py-3.5 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer border border-[#3d232e]"
              >
                <Sparkles className="w-4 h-4 fill-amber-350" /> Executar Análise Facial Visagista IA
              </button>
            )}

            {hasScanned && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveAnalysis}
                  className="bg-white hover:bg-stone-50 text-[#3d232e] border border-rose-200 py-3 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Salvar Análise
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedPhoto(null); setHasScanned(false); setGeneratedImage(null); }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Nova Foto
                </button>
              </div>
            )}
          </div>

          {/* Saved Analyses list (Salvar fotos para análises futuras) */}
          {savedAnalyses.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs space-y-4">
              <h4 className="font-display font-semibold text-xs text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#3d232e]" /> Histórico de Análises Salvas ({savedAnalyses.length})
              </h4>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {savedAnalyses.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setSelectedPhoto(item.photo);
                      // Restore saved results in display state
                      setAnalysisResult({
                        faceShape: item.faceShape,
                        skinTone: item.skinTone,
                        skinColor: item.skinColor,
                        hairType: item.hairType,
                        hairLength: item.hairLength,
                        eyeShape: item.eyeShape,
                        lipShape: item.lipShape,
                        facialStructure: item.facialStructure,
                        generalCharacteristics: item.generalCharacteristics,
                        trancas: item.suggestions.trancas,
                        maquiagem: item.suggestions.maquiagem,
                        cortes: item.suggestions.cortes,
                        cores: item.suggestions.cores,
                        penteados: item.suggestions.penteados,
                        sobrancelhas: item.suggestions.sobrancelhas,
                        cilios: item.suggestions.cilios
                      });
                      setHasScanned(true);
                      setGeneratedImage(null);
                    }}
                    className="flex gap-3 bg-stone-50 hover:bg-stone-100/70 p-2.5 rounded-xl border border-rose-50 cursor-pointer transition-all items-center hover:scale-[1.01]"
                  >
                    <img src={item.photo} alt="Dossiê" className="w-12 h-12 object-cover rounded-lg border border-rose-100" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-stone-400 font-bold block">{item.date}</span>
                      <strong className="text-[11px] text-[#3d232e] block truncate">{item.faceShape}</strong>
                      <span className="text-[10px] text-stone-500 block truncate font-light">Skin: {item.skinColor}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={(e) => handleDeleteAnalysis(item.id, e)}
                      className="p-1 text-stone-400 hover:text-red-650 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Results displays & Styles Generator (Lg: 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {hasScanned ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                
                {/* 1. VISAGISM DETAILED CARD DISPLAY */}
                <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-rose-100 pb-3">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#3d232e] flex items-center gap-1.5">
                      👑 Seu Dossiê de Beleza Visagista
                    </h4>
                    <span className="text-[9px] bg-[#3d232e]/5 border border-[#3d232e]/10 text-[#3d232e] px-2 py-0.5 rounded-md font-sans">
                      Aparelhos Calibrados
                    </span>
                  </div>

                  {/* 3x3 Grid of features */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-stone-50 p-3 rounded-xl border border-rose-50">
                      <span className="text-[8px] text-stone-400 font-sans font-bold uppercase tracking-wider block">Formato de Rosto:</span>
                      <span className="text-[11px] font-bold text-stone-900 block mt-0.5 font-sans leading-tight">{analysisResult.faceShape}</span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-rose-50">
                      <span className="text-[8px] text-stone-400 font-sans font-bold uppercase tracking-wider block">Tom e Subtom:</span>
                      <span className="text-[11px] font-bold text-stone-900 block mt-0.5 font-sans leading-tight">{analysisResult.skinTone}</span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-rose-50">
                      <span className="text-[8px] text-stone-400 font-sans font-bold uppercase tracking-wider block">Cor de Pele:</span>
                      <span className="text-[11px] font-bold text-stone-900 block mt-0.5 font-sans leading-tight">{analysisResult.skinColor}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-rose-50">
                      <span className="text-[8px] text-stone-400 font-sans font-bold uppercase tracking-wider block">Tipo de Cabelo:</span>
                      <span className="text-[11px] font-bold text-stone-900 block mt-0.5 font-sans leading-tight">{analysisResult.hairType}</span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-rose-50">
                      <span className="text-[8px] text-stone-400 font-sans font-bold uppercase tracking-wider block">Comprimento:</span>
                      <span className="text-[11px] font-bold text-stone-900 block mt-0.5 font-sans leading-tight">{analysisResult.hairLength}</span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-rose-50">
                      <span className="text-[8px] text-stone-400 font-sans font-bold uppercase tracking-wider block">Formato dos Olhos:</span>
                      <span className="text-[11px] font-bold text-stone-900 block mt-0.5 font-sans leading-tight">{analysisResult.eyeShape}</span>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-xl border border-rose-50 sm:col-span-3">
                      <span className="text-[8px] text-stone-400 font-sans font-bold uppercase tracking-wider block">Estrutura Facial & Lábios:</span>
                      <div className="text-[11px] font-medium text-stone-850 mt-1 flex flex-col gap-0.5 font-sans">
                        <p><strong>Lábios:</strong> {analysisResult.lipShape}</p>
                        <p><strong>Estrutura:</strong> {analysisResult.facialStructure}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 text-[11px] text-stone-700 leading-relaxed font-sans">
                    <strong className="text-[#3d232e]">Características Gerais Recomendadas por Visagismo:</strong> {analysisResult.generalCharacteristics}
                  </div>
                </div>

                {/* 2. REALISTAS AI STYLE GENERATOR (Similar to Nano Banana) */}
                <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-xs space-y-5">
                  <div className="flex justify-between items-center border-b border-rose-50 pb-3">
                    <div>
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#3d232e]">Gerador de Imagens IA Realista</h4>
                      <p className="text-[10px] text-stone-450 mt-0.5">Tecnologia avançada de preservação de rosto da cliente</p>
                    </div>
                    <span className="bg-amber-100 border border-amber-200 text-amber-950 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-full shrink-0">
                      Estética Inteligente
                    </span>
                  </div>

                  {/* Tab Selector Categories */}
                  <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none">
                    {[
                      { id: 'trancas', name: 'Tranças' },
                      { id: 'maquiagem', name: 'Maquiagem' },
                      { id: 'cabelo', name: 'Cabelo (Cortes/Cores)' },
                      { id: 'sobrancelhas', name: 'Sobrancelha' },
                      { id: 'cilios', name: 'Cílios' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id as any);
                          const firstTemplate = categoryStyles[cat.id]?.[0]?.name || '';
                          setSelectedStyle(firstTemplate);
                          setGeneratedImage(null);
                        }}
                        className={`text-[10px] font-sans font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl shrink-0 transition-all cursor-pointer ${
                          activeCategory === cat.id 
                            ? 'bg-[#3d232e] text-amber-200 border border-transparent shadow' 
                            : 'bg-stone-50 text-stone-500 border border-stone-200/50 hover:text-stone-900'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Recommendation styling choices box */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] text-[#3d232e] font-sans font-extrabold uppercase tracking-wider block">
                      Escolha um Estilo Proposto:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {categoryStyles[activeCategory].map((styleItem) => (
                        <div
                          key={styleItem.name}
                          onClick={() => {
                            setSelectedStyle(styleItem.name);
                            setGeneratedImage(null);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all text-left space-y-1 hover:scale-[1.01] ${
                            selectedStyle === styleItem.name 
                              ? 'bg-rose-50/70 border-[#3d232e] shadow-xs' 
                              : 'bg-[#fff] border-stone-100 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <strong className="text-xs text-stone-900 font-sans">{styleItem.name}</strong>
                            {selectedStyle === styleItem.name && <Check className="w-3.5 h-3.5 text-[#3d232e]" />}
                          </div>
                          <p className="text-[10px] text-stone-500 leading-snug font-light">{styleItem.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Extra Prompt modifier comments */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-400 font-mono font-bold uppercase tracking-wider block">Anotações extras / Personalização para a IA:</label>
                    <input
                      type="text"
                      placeholder="Ex: Quero um acabamento mel dourado / batom pêssego mais leve etc..."
                      value={customStyleNotes}
                      onChange={(e) => setCustomStyleNotes(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-800"
                    />
                  </div>

                  {/* Trigger IA simulation design generation */}
                  {!generatedImage && !isGenerating && (
                    <button
                      type="button"
                      onClick={handleGenerateStyleImage}
                      className="w-full bg-[#3d232e] hover:bg-[#1f1117] text-amber-250 py-3.5 rounded-xl font-sans font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer border border-[#3d232e]"
                    >
                      <Sparkles className="w-4 h-4 fill-amber-250 text-indigo-900" /> Criar Simulação de Visual IA
                    </button>
                  )}

                  {/* Generation Spinner Block */}
                  {isGenerating && (
                    <div className="bg-stone-50 p-6 rounded-xl flex flex-col items-center justify-center space-y-4 border border-rose-50">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-[#3d232e]/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div className="text-center space-y-1.5">
                        <p className="text-xs text-stone-700 font-bold font-sans">
                          {generationStepsText[generationStep]}
                        </p>
                        <p className="text-[10px] text-stone-400 animate-pulse font-light">
                          Gerador de Estilos de alta fidelidade processando retrato...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3. GENERATION OUTPUT & OPTIONS (Save, Share, Compare Before/After, Download) */}
                  {generatedImage && !isGenerating && (
                    <div className="space-y-5 bg-stone-50 p-5 rounded-2xl border border-rose-100">
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-rose-100 pb-3">
                        <div>
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 font-sans font-bold px-2 py-0.5 rounded-full uppercase">
                            Visual IA Concluído
                          </span>
                          <h5 className="font-display font-bold text-xs text-stone-900 mt-1">
                            Sua Foto com {selectedStyle}
                          </h5>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400 font-bold">Rosto Preservado 100%</span>
                      </div>

                      {/* AMAZING BEFORE & AFTER INTERACTIVE DRAG SLIDER */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-stone-400 font-mono font-bold uppercase block text-center">
                          ↔ Arraste o botão amarelo para conferir antes e depois:
                        </span>
                        
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow border border-rose-100 max-w-sm mx-auto bg-stone-950">
                          {/* After Stylized Image behind */}
                          <img 
                            src={generatedImage} 
                            alt="Visual IA Depois" 
                            className="absolute inset-0 w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                          
                          {/* Before Original Image in clipped overlay */}
                          <div 
                            className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
                            style={{ clipPath: `polygon(0 0, ${compareMode}% 0, ${compareMode}% 100%, 0 100%)` }}
                          >
                            <img 
                              src={selectedPhoto} 
                              alt="Retrato Antes" 
                              className="absolute inset-0 w-full h-full object-cover" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>

                          {/* Interactive Separator slider bar */}
                          <div 
                            className="absolute inset-y-0 w-1 bg-amber-400 pointer-events-none z-10"
                            style={{ left: `${compareMode}%` }}
                          >
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-stone-900 border-2 border-amber-450 text-amber-250 flex items-center justify-center text-xs shadow-md shadow-stone-950 pointer-events-none">
                              ↔
                            </div>
                          </div>

                          {/* HTML Slider range input representing the mouse slider overlay */}
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={compareMode} 
                            onChange={(e) => setCompareMode(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                          />
                        </div>
                      </div>

                      {/* OPTIONS AFTER GENERATION CONTROLS (Salvar, Compartilhar, Integrar, Gerar Novas, Baixar) */}
                      <div className="space-y-4">
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleSaveToFavorites}
                            disabled={isSavedInFavs}
                            className={`py-3 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSavedInFavs 
                                ? 'bg-stone-200 text-stone-500 border border-stone-250' 
                                : 'bg-[#fff] border border-rose-200 hover:bg-stone-50 text-stone-850'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isSavedInFavs ? 'fill-rose-500 text-rose-500' : ''}`} />
                            {isSavedInFavs ? 'Estilo Salvo' : 'Salvar Estilo'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleDownloadImage}
                            className="bg-white hover:bg-stone-50 border border-rose-200 py-3 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-rose-500" /> Baixar Imagem
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleShareToWhatsApp}
                            className="bg-[#25D366] hover:bg-[#20ba57] text-white py-3 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer text-center"
                          >
                            <Share2 className="w-4 h-4 text-white" /> Enviar ao Whatsapp
                          </button>

                          <button
                            type="button"
                            onClick={handleSendToSalonProposals}
                            disabled={isSentToSalon}
                            className={`py-3 px-4 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                              isSentToSalon 
                                ? 'bg-stone-200 text-stone-500 border border-[#e0ddde] cursor-not-allowed' 
                                : 'bg-gradient-to-r from-rose-900 to-rose-950 text-amber-200 border border-[#3d232e]'
                            }`}
                          >
                            <Send className="w-4 h-4 text-amber-200" />
                            {isSentToSalon ? 'Estilo Enviado ao Salão' : 'Enviar ao Salão'}
                          </button>
                        </div>

                        <div className="flex justify-center border-t border-rose-100 pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStyle('');
                              setGeneratedImage(null);
                            }}
                            className="text-[10px] text-[#3d232e] font-sans font-extrabold uppercase tracking-widest hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" /> Gerar nova versão ou outro Estilo
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </motion.div>
            ) : (
              <div className="bg-white p-10 text-center rounded-2xl border border-rose-100 shadow-xs space-y-4">
                <div className="w-14 h-14 bg-rose-50 text-rose-550 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h5 className="font-display font-bold text-sm text-stone-850">Aguardando Retrato para Iniciar Análise</h5>
                <p className="text-xs text-stone-400 max-w-sm mx-auto font-light leading-relaxed">
                  Por favor, escolha uma de nossas modelos ou utilize a câmera para carregar sua foto pessoal de rosto, de forma a acionar o mapeador estético visagista com IA.
                </p>
                <div className="bg-amber-100/50 border border-amber-200/50 p-4 rounded-xl max-w-sm mx-auto text-[10px] text-amber-800 font-sans font-medium text-left">
                  🌟 <strong>Experiência Premium Next Lady:</strong> O diagnóstico determina minuciosamente tranças Box/Knotless/Goddess perfeitas e maquiagens ideais para seu biotipo!
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Favorited Styles Board Section (Favoritos salvos) */}
          {favoriteStyles.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-xs space-y-4">
              <h4 className="font-display font-semibold text-xs text-stone-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-550/10 pb-2.5">
                <Heart className="w-4 h-4 fill-rose-550 text-rose-550 animate-pulse" /> Meus Estilos Favoritos ({favoriteStyles.length})
              </h4>
              <p className="text-[10px] text-stone-400 leading-normal font-light">Seus designs visuais IA salvos que você pode selecionar para mostrar e agendar com suas especialistas de luxo Next Lady:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoriteStyles.map((fav) => (
                  <div 
                    key={fav.id}
                    className="relative flex gap-3 bg-stone-50 p-2.5 rounded-xl border border-rose-100 items-center justify-between group"
                  >
                    <div className="flex gap-2.5 items-center min-w-0">
                      <img src={fav.imageUrl} alt={fav.styleName} className="w-11 h-11 object-cover rounded-lg border border-rose-105" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <strong className="text-[11px] text-stone-900 block truncate leading-tight">{fav.styleName}</strong>
                        <span className="text-[9px] text-[#3d232e] bg-[#3d232e]/5 rounded-md px-1.5 py-0.5 font-sans mt-1 inline-block uppercase font-bold tracking-wider">{fav.styleCategory}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPhoto(fav.imageUrl);
                          setHasScanned(true);
                          setGeneratedImage(fav.imageUrl);
                          setActiveCategory(fav.styleCategory as any);
                          setSelectedStyle(fav.styleName);
                        }}
                        className="p-1.5 text-stone-400 hover:text-[#3d232e] cursor-pointer"
                        title="Ver styling gerado no slider"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteFavStyle(fav.id, e)}
                        className="p-1.5 text-stone-400 hover:text-red-650 cursor-pointer"
                        title="Remover dos Favoritos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
