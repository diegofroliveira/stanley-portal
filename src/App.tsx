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
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary-foreground" />
              <h1 className="text-xl font-bold uppercase tracking-widest text-primary-foreground">Stanley Hub</h1>
            </div>
            <nav className="flex gap-4">
              <Link to="/operator" className="flex items-center gap-2 text-sm font-medium hover:text-primary-foreground/80 transition">
                <Move className="w-4 h-4" /> Operador
              </Link>
              <Link to="/manager" className="flex items-center gap-2 text-sm font-medium hover:text-primary-foreground/80 transition">
                <LineChart className="w-4 h-4" /> Gestor
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
