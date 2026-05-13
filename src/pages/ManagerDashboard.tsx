import { motion } from 'framer-motion';
import { Package, TrendingUp, Search, Filter, RefreshCcw, Bot, Clock } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function ManagerDashboard() {
  const { products, logs } = useInventory();
  const totalStock = products.reduce((acc, curr) => acc + curr.estoque, 0);
  const totalVm = products.reduce((acc, curr) => acc + curr.vm, 0);
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Automação CIGAM</p>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <p className="text-sm font-bold text-foreground tracking-wide text-glow">Sincronizado</p>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Hoje, 14:00 (Automático)</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 relative overflow-hidden group hover:shadow-glow transition-all">
          <div className="p-4 bg-surface text-foreground border border-border/50 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Estoque Total</p>
            <p className="font-display text-4xl font-extrabold">{totalStock} <span className="text-sm font-medium text-muted-foreground">un</span></p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 relative overflow-hidden group hover:shadow-glow transition-all">
          <div className="p-4 bg-surface text-foreground border border-border/50 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Mostruário (VM)</p>
            <p className="font-display text-4xl font-extrabold">{totalVm} <span className="text-sm font-medium text-muted-foreground">un</span></p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 relative overflow-hidden group hover:shadow-glow transition-all">
          <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Tendência Vendas</p>
            <p className="font-display text-4xl font-extrabold text-primary text-glow">+12<span className="text-2xl">%</span></p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel flex flex-col sm:flex-row gap-4 justify-between items-center p-4 rounded-[2rem]">
        <div className="relative w-full sm:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por SKU ou Nome..." 
            className="w-full bg-background border-2 border-border/50 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-3 bg-surface border border-border/50 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors flex">
            <Filter className="w-4 h-4" /> Filtros
          </button>
          <button 
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-3 bg-background border border-border/50 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-border transition-colors flex"
          >
            <RefreshCcw className="w-4 h-4" /> Forçar Sync
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={product.id}
            className="group flex flex-col glass-panel rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-glow"
          >
            <div className="relative aspect-square bg-white p-6 flex items-center justify-center border-b border-border/50 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest border border-border shadow-sm">
                SKU: {product.sku}
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1 bg-gradient-to-b from-card to-background">
              <h3 className="font-display font-semibold text-sm line-clamp-2 leading-relaxed mb-6 text-foreground">{product.name}</h3>
              
              <div className="mt-auto space-y-5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface border border-border/50 rounded-xl p-3 text-center transition-colors group-hover:border-border">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5">Estoque</p>
                    <p className={`font-display text-lg font-bold ${product.estoque === 0 ? 'text-destructive' : 'text-foreground'}`}>{product.estoque}</p>
                  </div>
                  <div className="bg-surface border border-border/50 rounded-xl p-3 text-center transition-colors group-hover:border-border">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5">Gaveta</p>
                    <p className="font-display text-lg font-bold text-foreground">{product.gaveta}</p>
                  </div>
                  <div className="bg-surface border border-border/50 rounded-xl p-3 text-center transition-colors group-hover:border-border">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5">VM</p>
                    <p className="font-display text-lg font-bold text-foreground">{product.vm}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-border/50">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Preço CIGAM</p>
                    <p className="font-display font-bold text-primary text-glow">R$ {product.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Giro</p>
                    <p className={`font-display font-bold text-sm ${product.trend.startsWith('+') ? 'text-primary' : 'text-destructive'}`}>
                      {product.trend}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Movement Logs */}
      <div className="glass-panel rounded-3xl overflow-hidden mt-10">
        <div className="p-6 border-b border-border/50 flex items-center gap-3 bg-surface/50">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="font-display text-sm font-bold uppercase tracking-widest">Últimas Movimentações</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center opacity-50">
              <RefreshCcw className="w-8 h-8 text-muted-foreground mb-3 animate-spin-slow" />
              <p className="text-sm font-medium">Nenhuma movimentação registrada na sessão atual.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-widest bg-surface text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold">Horário</th>
                  <th className="px-6 py-4 font-bold">SKU</th>
                  <th className="px-6 py-4 font-bold">Destino</th>
                  <th className="px-6 py-4 font-bold">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {logs.map(log => (
                  <motion.tr 
                    initial={{ opacity: 0, bg: 'hsl(var(--primary)/0.1)' }} 
                    animate={{ opacity: 1, bg: 'transparent' }} 
                    key={log.id} 
                    className="hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-6 py-5 whitespace-nowrap text-muted-foreground font-medium">{log.timestamp}</td>
                    <td className="px-6 py-5 font-bold font-mono">{log.sku}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        {log.destination}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground font-medium">{log.user}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
