import { motion } from 'framer-motion';
import { Package, TrendingUp, Search, Filter, RefreshCcw, Bot } from 'lucide-react';

const MOCK_PRODUCTS = [
  {
    id: 1,
    sku: '08003',
    name: 'Copo Térmico Everyday Stanley | 296ml',
    image: 'https://cdn.dooca.store/47855/products/copo-termico-everyday-stanley-296ml-polar_620x620.jpg?v=1710515155',
    price: 189.00,
    estoque: 12,
    gaveta: 4,
    vm: 2,
    trend: '+15%'
  },
  {
    id: 2,
    sku: '08021',
    name: 'Garrafa Térmica Classic Stanley | 946ml',
    image: 'https://cdn.dooca.store/47855/products/garrafa-termica-classic-stanley-946ml-matte-black_620x620.jpg?v=1710515155',
    price: 320.00,
    estoque: 5,
    gaveta: 1,
    vm: 1,
    trend: '+5%'
  },
  {
    id: 3,
    sku: '08055',
    name: 'Caneca Térmica de Cerveja Stanley | 709ml',
    image: 'https://cdn.dooca.store/47855/products/caneca-termica-de-cerveja-stanley-709ml-nightfall_620x620.jpg?v=1710515155',
    price: 220.00,
    estoque: 0,
    gaveta: 0,
    vm: 3,
    trend: '-2%'
  }
];

export default function ManagerDashboard() {
  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
              <Bot className="w-5 h-5" />
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Robô CIGAM</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <p className="text-sm font-bold text-foreground">Sincronizado</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Hoje, 14:00 (Automático)</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-primary/10 text-primary rounded-full">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Estoque Total</p>
            <p className="text-3xl font-bold">17 <span className="text-sm font-normal text-muted-foreground">itens</span></p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-primary/10 text-primary rounded-full">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Mostruário (VM)</p>
            <p className="text-3xl font-bold">6 <span className="text-sm font-normal text-muted-foreground">itens</span></p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Tendência Vendas</p>
            <p className="text-3xl font-bold text-emerald-500">+12% <span className="text-sm font-normal text-muted-foreground">mês</span></p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por SKU ou Nome..." 
            className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors flex">
            <Filter className="w-4 h-4" /> Filtros
          </button>
          <button 
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors flex text-muted-foreground hover:text-foreground"
          >
            <RefreshCcw className="w-4 h-4" /> Forçar Sync
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((product, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={product.id}
            className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
          >
            {/* Image Scraper Mock View */}
            <div className="relative aspect-square bg-white p-6 flex items-center justify-center border-b border-border/50">
              <img 
                src={product.image} 
                alt={product.name}
                className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-background/80 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-widest border border-border">
                SKU: {product.sku}
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-semibold text-sm line-clamp-2 leading-snug mb-4">{product.name}</h3>
              
              <div className="mt-auto space-y-4">
                {/* Locations */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted rounded-lg p-2 text-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Estoque</p>
                    <p className={`text-sm font-bold ${product.estoque === 0 ? 'text-red-500' : ''}`}>{product.estoque}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2 text-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Gaveta</p>
                    <p className="text-sm font-bold">{product.gaveta}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2 text-center">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">VM</p>
                    <p className="text-sm font-bold">{product.vm}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">Preço CIGAM</p>
                    <p className="font-bold text-primary">R$ {product.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-muted-foreground font-semibold">Giro</p>
                    <p className={`font-bold text-sm ${product.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                      {product.trend}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
