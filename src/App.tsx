import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Package, LineChart, Move } from 'lucide-react';
import { InventoryProvider } from './context/InventoryContext';

const OperatorView = lazy(() => import('./pages/OperatorView'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const Home = lazy(() => import('./pages/Home'));

function App() {
  return (
    <InventoryProvider>
      <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground dark">
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-glow">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-xl font-bold uppercase tracking-[0.2em] text-foreground">
                Stanley <span className="text-primary text-glow">Hub</span>
              </h1>
            </div>
            <nav className="flex gap-2 bg-surface p-1 rounded-2xl border border-border/50">
              <Link to="/operator" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
                <Move className="w-4 h-4" /> Operação
              </Link>
              <Link to="/manager" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
                <LineChart className="w-4 h-4" /> Gestão
              </Link>
            </nav>
          </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/operator" element={<OperatorView />} />
              <Route path="/manager" element={<ManagerDashboard />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
    </InventoryProvider>
  );
}

export default App;
