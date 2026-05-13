import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Product = {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  estoque: number;
  gaveta: number;
  vm: number;
  trend: string;
};

export type MovementLog = {
  id: string;
  sku: string;
  timestamp: string;
  destination: string;
  user: string;
};

type InventoryContextType = {
  products: Product[];
  logs: MovementLog[];
  moveItem: (sku: string, destination: string) => void;
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [logs, setLogs] = useState<MovementLog[]>([]);

  const moveItem = (sku: string, destination: string) => {
    // Note: destination will be 'ESTOQUE', 'GAVETA', 'MOSTRUÁRIO (VM)'
    const destKey = destination === 'ESTOQUE' ? 'estoque' : destination === 'GAVETA' ? 'gaveta' : 'vm';
    
    setProducts(prev => prev.map(p => {
      if (p.sku === sku || p.sku.includes(sku)) {
        // Decrease from estoque, increase in destination
        // If already in target destination, just return
        const newProduct = { ...p };
        // For the MVP, let's just increment the destination and decrement 'estoque' if it's not going to estoque
        if (destKey !== 'estoque' && newProduct.estoque > 0) {
           newProduct.estoque -= 1;
           newProduct[destKey] += 1;
        } else if (destKey === 'estoque') {
           // Move from gaveta or vm back to estoque (simplification: we just add 1 to estoque)
           newProduct.estoque += 1;
        } else {
           // No stock in ESTOQUE to move
           newProduct[destKey] += 1;
        }
        return newProduct;
      }
      return p;
    }));

    // Add to log
    const newLog: MovementLog = {
      id: Math.random().toString(36).substring(7),
      sku,
      timestamp: new Date().toLocaleTimeString(),
      destination,
      user: 'Operador 1' // Mock user
    };
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <InventoryContext.Provider value={{ products, logs, moveItem }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
