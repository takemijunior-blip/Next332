import { ServiceItem, Specialist, CommunityPost, Product, EventItem, LoyaltyReward } from './types';

export const SERVICES: ServiceItem[] = [
  {
    id: 's-1',
    name: 'Corte Visagista & Modelagem',
    category: 'cabelo',
    price: 160,
    duration: 60,
    description: 'Corte adaptado com técnicas avançadas de visagismo para valorizar seu formato de rosto e autoimagem.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-2',
    name: 'Coloração Orgânica de Alta Costura',
    category: 'coloracao',
    price: 290,
    duration: 120,
    description: 'Coloração livre de conservantes agressivos e metais pesados. Cobertura uniforme sem agredir a fibra.',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-3',
    name: 'Tranças Afro & Boxer Braids Negras',
    category: 'trancas',
    price: 195,
    duration: 150,
    description: 'Estilo de tranças de raiz ou boxer braids com fibra premium, excelente tração confortável e proteção dos fios.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1620331702302-268k8b4b7a12?auto=format&fit=crop&q=80&w=400', // Unsplash braids placeholder
  },
  {
    id: 's-4',
    name: 'Penteado de Gala Real',
    category: 'penteados',
    price: 220,
    duration: 90,
    description: 'Coque clássico desestruturado, semi-preso boho chic ou rabo texturizado de altíssima durabilidade.',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-5',
    name: 'Maquiagem Deluxe Editorial',
    category: 'maquiagem',
    price: 250,
    duration: 75,
    description: 'Com marcas premium importadas e selamento de altíssima resistência (blindagem facial inclusa).',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-6',
    name: 'Manicure Inteligente Tradicional',
    category: 'manicure',
    price: 55,
    duration: 40,
    description: 'Limpeza, hidratação profunda com micro-luvas ativas e esmaltação impecável com brilho duradouro.',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1522337094846-8a8111352163?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-7',
    name: 'Pedicure Relaxante c/ Argila',
    category: 'pedicure',
    price: 65,
    duration: 45,
    description: 'Cuidado nos calcanhares com esfoliador físico, máscara de argila branca purificante e hidratação.',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1519415510236-8a5d6004746f?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-8',
    name: 'Alongamento de Unhas em Gel Premium',
    category: 'alongamento_unhas',
    price: 180,
    duration: 125,
    description: 'Extensão em molde ou fibra, lixamento técnico motorizado de visual ultra natural e resistente.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-9',
    name: 'Sobrancelhas Áureas henna / Pinça',
    category: 'sobrancelhas',
    price: 85,
    duration: 45,
    description: 'Mapeamento baseado nas proporções do visagismo Lady, com pigmento orgânico henna durável.',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1493489814421-4b13ee3ff7f6?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-10',
    name: 'Extensão de Cílios Fio a Fio Luxo',
    category: 'cilios',
    price: 210,
    duration: 120,
    description: 'Aplicação híbrida ou clássica com fios sintéticos de seda levíssimos e cola hipoalergênica aprovada.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-11',
    name: 'Limpeza de Pele Profunda + Fototerapia',
    category: 'limpeza_facial',
    price: 170,
    duration: 90,
    description: 'Extração inteligente com vapor de ozônio, seguidos de feixe de LED azul cicatrizante tensor.',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-12',
    name: 'Massagem Craniana & Shiatsu Antiestresse',
    category: 'massagem',
    price: 140,
    duration: 60,
    description: 'Terapia de pontos de tensão nos ombros, costas e cabeça com óleos essenciais de lavanda pura.',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-13',
    name: 'Spa Integrativo Lady Imperial',
    category: 'spa',
    price: 320,
    duration: 150,
    description: 'Glow capilar, spa de pés com ozonioterapia, massagem com pedras quentes e chá aromático da tarde.',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 's-14',
    name: 'Estética Corporal Redutora Drenante',
    category: 'estetica_corporal',
    price: 190,
    duration: 75,
    description: 'Terapia manual firmadora com ativos bio-estimulantes que ativam o sistema circulatório.',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400',
  }
];

export const SPECIALISTS: Specialist[] = [
  {
    id: 'sp-1',
    name: 'Gisele Bündchen Souza',
    role: 'Hairstylist Master & Visagista',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=150',
    rating: 4.9,
    specialties: ['cabelo', 'coloracao', 'trancas', 'penteados'],
  },
  {
    id: 'sp-2',
    name: 'Dra. Viviane Araujo',
    role: 'Dermatofuncional & Esteticista',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    rating: 4.8,
    specialties: ['limpeza_facial', 'estetica_corporal', 'massagem', 'spa'],
  },
  {
    id: 'sp-3',
    name: 'Camilla Vasconcelos',
    role: 'Nail Designer Master',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=150',
    rating: 4.9,
    specialties: ['manicure', 'pedicure', 'alongamento_unhas'],
  },
  {
    id: 'sp-4',
    name: 'Luiza Possi Sobral',
    role: 'Makeup & Lash Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    rating: 4.9,
    specialties: ['maquiagem', 'sobrancelhas', 'cilios'],
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Elixir Capilar Next Remedy (60ml)',
    category: 'Capilar',
    price: 185.00,
    rating: 4.9,
    description: 'Óleo essencial restaurador feito com sementes amazônicas para selar pontas duplas e controlar o frizz intensamente.',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=300',
    stock: 12,
    pointsGranted: 50
  },
  {
    id: 'p-2',
    name: 'Sérum Ácido Hialurônico 3D Glow',
    category: 'Cosméticos',
    price: 145.00,
    rating: 4.8,
    description: 'Hidratação profunda biomimética que devolve vitalidade aos tecidos e reduz poros imediatamente.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=300',
    stock: 20,
    pointsGranted: 40
  },
  {
    id: 'p-3',
    name: 'Batom Matte Blindagem Lady',
    category: 'Maquiagem',
    price: 89.90,
    rating: 4.7,
    description: 'Alta fixação de 16 horas sem craquelar. Textura suave aveludada em tom Rose Gold clássico.',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=300',
    stock: 35,
    pointsGranted: 25
  },
  {
    id: 'p-4',
    name: 'Parfum Royal Lady Gold (75ml)',
    category: 'Perfumes',
    price: 490.00,
    rating: 5.0,
    description: 'Fragrância majestosa floral oriental com notas de jasmim d’água, flor de laranjeira e baunilha preta.',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=300',
    stock: 8,
    pointsGranted: 150
  },
  {
    id: 'p-5',
    name: 'Brincos Crown Royalty Rose Gold',
    category: 'Acessórios',
    price: 120.00,
    rating: 4.9,
    description: 'Par de brincos folheado premium a ouro rosé com brilhantes zircônia inspirados no luxo feminino Next Lady.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=300',
    stock: 15,
    pointsGranted: 30
  }
];

export const EVENTS: EventItem[] = [
  {
    id: 'e-101',
    title: 'Workshop de Automaquiagem Lady Real',
    description: 'Domine a arte do delineado gatinho perfeito, preparação de pele glow para o dia a dia e aplicação de cílios postiços sem mistério.',
    instructor: 'Luiza Possi Sobral',
    date: '2026-06-15',
    time: '14:30',
    category: 'Curso de Automaquiagem',
    pointsGranted: 100,
    attendeesCount: 28,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'e-102',
    title: 'Congresso Mulheres em Ação & Negócios',
    description: 'Uma rodada de pitches e palestras inspiradoras sobre gerenciamento de marcas femininas, mídias sociais e crescimento financeiro.',
    instructor: 'Dra. Viviane Araujo & Convidadas',
    date: '2026-06-28',
    time: '19:00',
    category: 'Congresso de Empreendedoras',
    pointsGranted: 150,
    attendeesCount: 52,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400'
  }
];

export const LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    id: 'r-1',
    title: 'Corte Visagista Gratuito',
    cost: 300,
    description: 'Trocando 300 pontos você ganha um corte visagista completo com lavagem relaxante.',
    type: 'servico'
  },
  {
    id: 'r-2',
    title: 'Desconto de R$ 50,00 na Loja',
    cost: 150,
    description: 'Desconto liberado no carrinho do e-commerce Next Lady para qualquer produto capilar ou cosmético.',
    type: 'desconto'
  },
  {
    id: 'r-3',
    title: 'Kit Skinbooster Vitamina C',
    cost: 400,
    description: 'Ganhe um frasco exclusivo do Sérum Ativo Glow com alta absorção para usar em casa.',
    type: 'produto'
  },
  {
    id: 'r-4',
    title: 'Membro Vip Lady Diamond (1 Mês)',
    cost: 500,
    description: 'Acesso prioritário a agendamentos, double points em todas as compras e espumante cortesia em todas as visitas presenciais.',
    type: 'vip'
  }
];

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Gabriela Vasques',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    title: 'Como comecei meu próprio negócio no ramo estético!',
    category: 'Empreendedorismo',
    content: 'Meninas, essa semana completei 1 ano da minha loja virtual de óleos fitoterápicos! O conselho que dou para quem está começando é: não esperem pela perfeição. Lancem seus projetos e ajustem pelo caminho. Autoestima e disciplina andam de mãos dadas! Quem mais quer empreender?',
    likes: 48,
    hasLiked: false,
    comments: [
      {
        id: 'c-1',
        author: 'Sandra Pinheiro',
        content: 'Que inspiração linda Gabi! Também quero muito iniciar meu negócio de sabonetes artesanais este mês.',
        createdAt: '2026-05-30T10:12:00Z'
      }
    ],
    createdAt: '2026-05-30T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=500'
  },
  {
    id: 'post-2',
    author: 'Patrícia Alcântara',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
    title: 'Autoestima: Você é a sua maior prioridade de hoje!',
    category: 'Autoestima',
    content: 'Gosto sempre de lembrar que tirar 30 minutos por dia para fazer uma hidratação de pele ou massagear o colo não é futilidade, é amor-próprio e saúde mental. Mantenham-se hidratadas, elegantes e poderosas.',
    likes: 92,
    hasLiked: false,
    comments: [],
    createdAt: '2026-05-29T18:00:00Z'
  }
];
