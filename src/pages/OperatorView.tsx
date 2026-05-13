import { useState } from 'react';
import { motion } from 'framer-motion';

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
    // TODO: Connect to Supabase
    setTimeout(() => {
      setFeedback({ type: 'success', text: `Movimentação de ${skus.length} itens para ${status} registrada com sucesso!` });
      setSkus([]);
      setStatus('');
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/40 rounded-3xl p-8 shadow-xl"
      >
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Módulo Operacional</p>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-foreground">Movimentação</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              SKU ou Código de Barras *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                onKeyDown={handleSkuKeyDown}
                placeholder="Escaneie com a pistola ou digite"
                className="flex-1 bg-background border border-input rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => addSkusFromValue(skuInput)}
                className="px-6 py-3 bg-muted border border-border rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-muted/80 transition-colors"
              >
                Add
              </button>
            </div>
            
            {skus.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                {skus.map((sku) => (
                  <span key={sku} className="inline-flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-full text-xs font-medium">
                    {sku}
                    <button type="button" onClick={() => removeSku(sku)} className="text-muted-foreground hover:text-foreground">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Destino *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatus(opt)}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all ${
                    status === opt 
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' 
                      : 'bg-background border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className={`p-4 rounded-2xl text-sm font-medium ${
              feedback.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {feedback.text}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/10 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Registrando...' : 'Confirmar Movimentação'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
