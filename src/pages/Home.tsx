import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Barcode, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-foreground">
          Stanley Hub
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
          Plataforma centralizada de gestão de estoque e relacionamento com clientes para franquias Stanley.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link 
            to="/operator"
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-border/50 bg-card hover:bg-muted/50 transition-colors shadow-lg"
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Barcode className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold uppercase tracking-wider">Operador de Loja</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Leitura de SKUs, movimentação de estoque para gaveta ou mostruário.
              </p>
            </div>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link 
            to="/manager"
            className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-border/50 bg-card hover:bg-muted/50 transition-colors shadow-lg"
          >
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <LayoutDashboard className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold uppercase tracking-wider">Gestor</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Visão do estoque, dashboards, CIGAM e tendências de vendas (CRM).
              </p>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
