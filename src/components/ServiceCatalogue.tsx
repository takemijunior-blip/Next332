import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Star, Clock, Filter, Sparkles, AlertCircle, Award } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceCatalogueProps {
  onSelectService: (service: ServiceItem) => void;
  servicesDb: ServiceItem[];
}

export default function ServiceCatalogue({ onSelectService, servicesDb }: ServiceCatalogueProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const beautyCategories = [
    { value: 'todos', label: 'Todos' },
    { value: 'cabelo', label: 'Cortes' },
    { value: 'coloracao', label: 'Coloração' },
    { value: 'trancas', label: 'Tranças' },
    { value: 'penteados', label: 'Penteados' },
    { value: 'maquiagem', label: 'Maquiagem' },
    { value: 'manicure', label: 'Manicure' },
    { value: 'pedicure', label: 'Pedicure' },
    { value: 'alongamento_unhas', label: 'Alongamento' },
    { value: 'sobrancelhas', label: 'Sobrancelhas' },
    { value: 'cilios', label: 'Cílios' },
    { value: 'limpeza_facial', label: 'Limpeza Pele' },
    { value: 'massagem', label: 'Massagem' },
    { value: 'spa', label: 'SPA' },
    { value: 'estetica_corporal', label: 'Estética' }
  ];

  // Filtering Logic
  const filteredServices = servicesDb.filter(service => {
    const matchesCategory = selectedCategory === 'todos' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6" id="service-catalogue-section">
      {/* Search and Filters Header */}
      <div className="bg-white border border-rose-100/50 p-6 rounded-3xl flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Procure cortes, tranças, cílios, massagens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 py-3 pl-10 pr-4 border border-rose-50 rounded-2xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#3d232e] text-gray-850 focus:bg-white transition-all"
          />
        </div>

        {/* Category Pill selections with custom scroll */}
        <div className="flex gap-2.5 overflow-x-auto w-full lg:w-auto pb-1.5 lg:pb-0 scrollbar-thin scrollbar-thumb-stone-150">
          {beautyCategories.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`font-sans text-[11px] font-bold px-4 py-2.5 rounded-2xl transition-all uppercase tracking-wider shrink-0 select-none cursor-pointer border ${
                selectedCategory === cat.value
                  ? 'bg-[#3d232e] text-amber-200 border-stone-850 shadow-md shadow-rose-950/20'
                  : 'bg-white text-gray-500 border-rose-50 hover:border-stone-400 hover:text-stone-900 shadow-xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map(service => (
          <motion.div
            layout
            key={service.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-rose-50/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
          >
            {/* Aspect image frame */}
            <div className="h-44 overflow-hidden relative bg-stone-100">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 right-3 bg-[#1c1214]/90 backdrop-blur-md shadow text-amber-200 font-mono text-[10px] font-semibold px-2.5 py-1 rounded-xl">
                R$ {service.price.toFixed(2)}
              </span>
              <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md shadow text-gray-700 font-sans text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {service.category.replace('_', ' ')}
              </span>
            </div>

            {/* Treatment Information detail */}
            <div className="p-4.5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-display font-semibold text-gray-900 group-hover:text-rose-500 transition-colors text-xs line-clamp-1">
                    {service.name}
                  </h4>
                  <div className="flex items-center gap-1 text-amber-500 text-[10px] shrink-0 font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{service.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 font-sans leading-relaxed line-clamp-3 font-light">
                  {service.description}
                </p>
              </div>

              <div className="border-t border-rose-50 pt-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 font-sans font-medium flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {service.duration} min
                  </span>
                  <span className="text-[9px] text-[#b45309] font-sans font-semibold flex items-center gap-0.5">
                    <Award className="w-3 h-3" />
                    +50 fidelidade pts
                  </span>
                </div>

                <button
                  onClick={() => onSelectService(service)}
                  className="bg-[#3d232e] hover:bg-[#1f1116] text-white font-sans text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow"
                  type="button"
                >
                  Agendar
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty visual indicators */}
      {filteredServices.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-rose-100 rounded-3xl" id="services-empty">
          <AlertCircle className="w-8 h-8 text-rose-300 mx-auto mb-3 animate-bounce" />
          <h5 className="font-display font-medium text-gray-800 text-sm">Nenhum procedimento encontrado</h5>
          <p className="text-xs text-gray-400 font-sans mt-1 leading-normal max-w-sm mx-auto">Toda nossa base foi verificada. Tente buscar por outros termos ou verifique se utilizou uma categoria diferente.</p>
        </div>
      )}
    </div>
  );
}
