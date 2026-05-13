import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInventory } from '../context/InventoryContext';

type Feedback = {
  type: 'success' | 'error';
  text: string;
};

export default function OperatorView() {
  const [skuInput, setSkuInput] = useState('');
  const [skus, setSkus] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { moveItem } = useInventory();

  const STATUS_OPTIONS = ['ESTOQUE', 'GAVETA', 'MOSTRUÁRIO (VM)'];

  const addSkusFromValue = (value: string) => {
    const sanitized = value
      .split(/[\n,;\s]+/)
      .map((code) => code.trim())
      .filter(Boolean);
    if (!sanitized.length) return;
    setSkus((prev) => {
      const next = [...prev];
      for (const code of sanitized) {
        if (!next.includes(code)) {
          next.push(code);
        }
      }
      return next;
    });
    setSkuInput('');
  };

  const handleSkuKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkusFromValue(skuInput);
    }
  };

  const removeSku = (code: string) => {
    setSkus((prev) => prev.filter((item) => item !== code));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (skus.length === 0) {
      setFeedback({ type: 'error', text: 'Informe ao menos um SKU ou Código de Barras.' });
      return;
    }
    if (!status) {
      setFeedback({ type: 'error', text: 'Selecione o destino do produto.' });
      return;
    }

    setSubmitting(true);
    // Simulate API call for MVP
    setTimeout(() => {
      // Actually move items in context
      skus.forEach(sku => {
        moveItem(sku, status);
      });
      
      setFeedback({ type: 'success', text: `Movimentação de ${skus.length} itens para ${status} registrada com sucesso!` });
      setSkus([]);
      setStatus('');
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-[2rem] p-8 sm:p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="text-center mb-10">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-3">Módulo Operacional</p>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-widest text-foreground">Movimentação</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              SKU ou Código de Barras *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                onKeyDown={handleSkuKeyDown}
                placeholder="Escaneie com a pistola ou digite..."
                className="flex-1 bg-surface border-2 border-border/50 rounded-2xl px-5 py-4 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/50"
              />
              <button
                type="button"
                onClick={() => addSkusFromValue(skuInput)}
                className="px-8 py-4 bg-surface border-2 border-border/50 rounded-2xl text-xs font-bold uppercase tracking-wider hover:border-primary/50 hover:bg-muted transition-all"
              >
                Add
              </button>
            </div>
            
            {skus.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-wrap gap-2 mt-4 p-5 bg-surface/50 rounded-2xl border border-border/30"
              >
                {skus.map((sku) => (
                  <span key={sku} className="inline-flex items-center gap-2 px-3 py-1.5 bg-background border border-border/50 rounded-lg text-xs font-bold shadow-sm animate-fade-in">
                    {sku}
                    <button type="button" onClick={() => removeSku(sku)} className="text-muted-foreground hover:text-destructive transition-colors">×</button>
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Destino *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatus(opt)}
                  className={`relative overflow-hidden py-4 px-4 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    status === opt 
                      ? 'bg-primary/10 border-primary text-primary shadow-glow' 
                      : 'bg-surface border-border/50 text-muted-foreground hover:border-border hover:bg-muted/50'
                  }`}
                >
                  {status === opt && (
                     <div className="absolute inset-0 bg-primary/10 animate-pulse-slow" />
                  )}
                  <span className="relative z-10">{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl text-sm font-bold flex items-center justify-center text-center ${
              feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {feedback.text}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group relative w-full py-5 rounded-2xl bg-primary text-primary-foreground text-sm font-extrabold uppercase tracking-widest overflow-hidden transition-all disabled:opacity-50 hover:shadow-glow hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[slide-in_1s_ease-in-out_infinite]" />
            <span className="relative z-10">{submitting ? 'Registrando...' : 'Confirmar Movimentação'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
