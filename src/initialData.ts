/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Insumo, Proveedor, Receta, MovimientoStock, Usuario, LogAccion, LocalStorageState } from './types';

export const INITIAL_PROVEEDORES: Proveedor[] = [
  {
    id: 'prov-1',
    name: 'Distribuidora Lácteos del Sur',
    contactName: 'Carlos Mendoza',
    phone: '+56 9 8765 4321',
    email: 'ventas@lacteosdelsur.cl',
    category: 'Quesos y Cremas',
    address: 'Av. Industrial 1240, Santiago',
    status: 'activo'
  },
  {
    id: 'prov-2',
    name: 'Molino Harinero Central',
    contactName: 'Lucía Fernández',
    phone: '+56 9 7654 3210',
    email: 'contacto@molinocentral.cl',
    category: 'Harinas y Masas',
    address: 'Camino Agrícola 450, Talca',
    status: 'activo'
  },
  {
    id: 'prov-3',
    name: 'Tomates y Verduras del Valle',
    contactName: 'Roberto Gómez',
    phone: '+56 9 6543 2109',
    email: 'pedidos@valledeverduras.cl',
    category: 'Salsas y Vegetales',
    address: 'Camino El Noviciado S/N, Pudahuel',
    status: 'activo'
  },
  {
    id: 'prov-4',
    name: 'Distribuidora Carnes del Chef',
    contactName: 'Mariana Silva',
    phone: '+56 9 5432 1098',
    email: 'msilva@carnesdelchef.cl',
    category: 'Carnes e Insumos Secos',
    address: 'La Vega Central Local 120, Recoleta',
    status: 'activo'
  },
  {
    id: 'prov-5',
    name: 'Envases y Embalajes de Chile',
    contactName: 'Héctor Tapia',
    phone: '+56 9 4321 0987',
    email: 'ventas@envasesdechile.cl',
    category: 'Embalajes',
    address: 'Vicuña Mackenna 3020, Macul',
    status: 'activo'
  }
];

export const INITIAL_INSUMOS: Insumo[] = [
  {
    id: 'ins-1',
    name: 'Harina de Fuerza Tipo 00',
    category: 'Harinas',
    stock: 120, // 120kg
    unit: 'kg',
    minStock: 50,
    unitCost: 1800, // $1800 por kg
    supplierId: 'prov-2',
    supplierName: 'Molino Harinero Central',
    updatedAt: '2026-06-08T18:00:00Z'
  },
  {
    id: 'ins-2',
    name: 'Queso Mozzarella de Fara',
    category: 'Quesos',
    stock: 15, // 15kg (Alerta de stock bajo!)
    unit: 'kg',
    minStock: 30,
    unitCost: 6500, // $6500 por kg
    supplierId: 'prov-1',
    supplierName: 'Distribuidora Lácteos del Sur',
    updatedAt: '2026-06-08T18:00:00Z'
  },
  {
    id: 'ins-3',
    name: 'Pepperoni Italiano Clandestino',
    category: 'Carnes',
    stock: 25,
    unit: 'kg',
    minStock: 10,
    unitCost: 9500,
    supplierId: 'prov-4',
    supplierName: 'Distribuidora Carnes del Chef',
    updatedAt: '2026-06-07T14:30:00Z'
  },
  {
    id: 'ins-4',
    name: 'Salsa de Tomate de la Casa',
    category: 'Salsas',
    stock: 80, // 80 litros
    unit: 'L',
    minStock: 25,
    unitCost: 1500,
    supplierId: 'prov-3',
    supplierName: 'Tomates y Verduras del Valle',
    updatedAt: '2026-06-08T10:00:00Z'
  },
  {
    id: 'ins-5',
    name: 'Albahaca Fresca Orgánica',
    category: 'Vegetales',
    stock: 2.5, // 2.5 kg
    unit: 'kg',
    minStock: 4, // Alerta stock bajo
    unitCost: 4000,
    supplierId: 'prov-3',
    supplierName: 'Tomates y Verduras del Valle',
    updatedAt: '2026-06-08T09:00:00Z'
  },
  {
    id: 'ins-6',
    name: 'Jamón Serrano Reserva',
    category: 'Carnes',
    stock: 18,
    unit: 'kg',
    minStock: 8,
    unitCost: 14000,
    supplierId: 'prov-4',
    supplierName: 'Distribuidora Carnes del Chef',
    updatedAt: '2026-06-05T12:00:00Z'
  },
  {
    id: 'ins-7',
    name: 'Cajas de Pizza 33cm Kraft',
    category: 'Embalajes',
    stock: 500,
    unit: 'un',
    minStock: 150,
    unitCost: 280,
    supplierId: 'prov-5',
    supplierName: 'Envases y Embalajes de Chile',
    updatedAt: '2026-06-08T16:00:00Z'
  },
  {
    id: 'ins-8',
    name: 'Champiñones laminados',
    category: 'Vegetales',
    stock: 12,
    unit: 'kg',
    minStock: 10,
    unitCost: 3500,
    supplierId: 'prov-3',
    supplierName: 'Tomates y Verduras del Valle',
    updatedAt: '2026-06-08T10:00:00Z'
  },
  {
    id: 'ins-9',
    name: 'Aceitunas Negras Sin Carozo',
    category: 'Vegetales',
    stock: 6,
    unit: 'kg',
    minStock: 5,
    unitCost: 5000,
    supplierId: 'prov-3',
    supplierName: 'Tomates y Verduras del Valle',
    updatedAt: '2026-06-08T10:00:00Z'
  }
];

export const INITIAL_RECETAS: Receta[] = [
  {
    id: 'rec-1',
    name: 'Pizza Margherita Suprema',
    category: 'Pizzas',
    description: 'La clásica de clásicas con nuestra salsa clandestina, queso mozzarella fresca y albahaca fresca del huerto cortada en el momento.',
    portions: 1, // 1 pizza familiar
    prepTime: 12,
    salePrice: 10900,
    ingredients: [
      { insumoId: 'ins-1', name: 'Harina de Fuerza Tipo 00', quantity: 0.25, unit: 'kg' }, // 250g
      { insumoId: 'ins-2', name: 'Queso Mozzarella de Fara', quantity: 0.22, unit: 'kg' }, // 220g
      { insumoId: 'ins-4', name: 'Salsa de Tomate de la Casa', quantity: 0.15, unit: 'L' }, // 150ml
      { insumoId: 'ins-5', name: 'Albahaca Fresca Orgánica', quantity: 0.03, unit: 'kg' }, // 30g
      { insumoId: 'ins-7', name: 'Cajas de Pizza 33cm Kraft', quantity: 1, unit: 'un' }
    ]
  },
  {
    id: 'rec-2',
    name: 'Pizza Pepperoni Clandestina',
    category: 'Pizzas',
    description: 'Deliciosa y picante. Doble porción de pepperoni ahumado de la casa, abundante mozzarella y salsa de tomate italiana.',
    portions: 1,
    prepTime: 10,
    salePrice: 12900,
    ingredients: [
      { insumoId: 'ins-1', name: 'Harina de Fuerza Tipo 00', quantity: 0.25, unit: 'kg' },
      { insumoId: 'ins-2', name: 'Queso Mozzarella de Fara', quantity: 0.20, unit: 'kg' },
      { insumoId: 'ins-3', name: 'Pepperoni Italiano Clandestino', quantity: 0.12, unit: 'kg' }, // 120g
      { insumoId: 'ins-4', name: 'Salsa de Tomate de la Casa', quantity: 0.15, unit: 'L' },
      { insumoId: 'ins-7', name: 'Cajas de Pizza 33cm Kraft', quantity: 1, unit: 'un' }
    ]
  },
  {
    id: 'rec-3',
    name: 'Pizza Serrano & Fungi',
    category: 'Pizzas',
    description: 'Una combinación gourmet para amantes de lo salado: jamón serrano premium, champiñones laminados frescos, aceitunas y orégano.',
    portions: 1,
    prepTime: 15,
    salePrice: 14900,
    ingredients: [
      { insumoId: 'ins-1', name: 'Harina de Fuerza Tipo 00', quantity: 0.25, unit: 'kg' },
      { insumoId: 'ins-2', name: 'Queso Mozzarella de Fara', quantity: 0.18, unit: 'kg' },
      { insumoId: 'ins-4', name: 'Salsa de Tomate de la Casa', quantity: 0.15, unit: 'L' },
      { insumoId: 'ins-6', name: 'Jamón Serrano Reserva', quantity: 0.10, unit: 'kg' }, // 100g
      { insumoId: 'ins-8', name: 'Champiñones laminados', quantity: 0.08, unit: 'kg' }, // 80g
      { insumoId: 'ins-9', name: 'Aceitunas Negras Sin Carozo', quantity: 0.05, unit: 'kg' }, // 50g
      { insumoId: 'ins-7', name: 'Cajas de Pizza 33cm Kraft', quantity: 1, unit: 'un' }
    ]
  }
];

export const INITIAL_MOVIMIENTOS: MovimientoStock[] = [
  {
    id: 'mov-1',
    insumoId: 'ins-1',
    insumoName: 'Harina de Fuerza Tipo 00',
    type: 'entrada',
    quantity: 100,
    unit: 'kg',
    reason: 'Compra / Recepción',
    date: '2026-06-08T09:15:00Z',
    requestedBy: 'Carlos Mendoza (Jefe)',
    notes: 'Pedido mensual estándar para masado.'
  },
  {
    id: 'mov-2',
    insumoId: 'ins-2',
    insumoName: 'Queso Mozzarella de Fara',
    type: 'salida',
    quantity: 15,
    unit: 'kg',
    reason: 'Consumo en producción',
    date: '2026-06-08T22:30:00Z',
    requestedBy: 'Andrés Vera (Chef)',
    notes: 'Jornada intensa del lunes. Consumo de pizzeria.'
  },
  {
    id: 'mov-3',
    insumoId: 'ins-5',
    insumoName: 'Albahaca Fresca Orgánica',
    type: 'salida',
    quantity: 2,
    unit: 'kg',
    reason: 'Merma / Desperdicio',
    date: '2026-06-07T11:00:00Z',
    requestedBy: 'Andrés Vera (Chef)',
    notes: 'Hojas marchitas descartadas en control matutino.'
  },
  {
    id: 'mov-4',
    insumoId: 'ins-3',
    insumoName: 'Pepperoni Italiano Clandestino',
    type: 'entrada',
    quantity: 20,
    unit: 'kg',
    reason: 'Compra / Recepción',
    date: '2026-06-07T14:30:00Z',
    requestedBy: 'Carlos Mendoza (Jefe)',
    notes: 'Stock extra para el fin de semana largo.'
  },
  {
    id: 'mov-5',
    insumoId: 'ins-7',
    insumoName: 'Cajas de Pizza 33cm Kraft',
    type: 'salida',
    quantity: 120,
    unit: 'un',
    reason: 'Consumo en producción',
    date: '2026-06-08T23:45:00Z',
    requestedBy: 'Andrés Vera (Chef)',
    notes: 'Despachos del día.'
  }
];

export const INITIAL_USUARIOS: Usuario[] = [
  {
    id: 'usr-1',
    username: 'jefe',
    password: '123',
    name: 'Carlos Mendoza (Administrador)',
    role: 'JEFE',
    email: 'carlos.jefe@clandestinos.com',
    status: 'activo',
    createdAt: '2026-01-15T12:00:00Z'
  },
  {
    id: 'usr-2',
    username: 'empleado',
    password: '123',
    name: 'Andrés Vera (Ayudante de Cocina)',
    role: 'EMPLEADO',
    email: 'andres.vera@clandestinos.com',
    status: 'activo',
    createdAt: '2026-03-10T10:30:00Z'
  },
  {
    id: 'usr-3',
    username: 'pizzaiolo',
    password: '123',
    name: 'Gennaro De Luca (Maestro)',
    role: 'EMPLEADO',
    email: 'gennaro@clandestinos.com',
    status: 'activo',
    createdAt: '2026-04-01T08:00:00Z'
  }
];

export const INITIAL_LOGS: LogAccion[] = [
  {
    id: 'log-1',
    userId: 'usr-1',
    userName: 'Carlos Mendoza',
    action: 'Inicio de Sesión',
    details: 'Sesión iniciada exitosamente en el módulo de control.',
    date: '2026-06-09T03:40:00Z'
  },
  {
    id: 'log-2',
    userId: 'usr-1',
    userName: 'Carlos Mendoza',
    action: 'Creación de Insumo',
    details: 'Se agregó un nuevo insumo: Aceitunas Negras Sin Carozo.',
    date: '2026-06-08T10:00:00Z'
  }
];

export const INITIAL_CONFIG = {
  pizzaMultiplier: 1.15, // 15% mermas estimadas
  lowStockAlertThreshold: 20, // 20%
  establishmentName: 'Clandestinos Pizza',
  currency: 'CLP',
  address: 'Calle del Misterio #404, Providencia, Santiago',
  phone: '+56 2 9876 5432'
};

export const getInitialState = (): LocalStorageState => {
  return {
    insumos: INITIAL_INSUMOS,
    proveedores: INITIAL_PROVEEDORES,
    recetas: INITIAL_RECETAS,
    movimientos: INITIAL_MOVIMIENTOS,
    usuarios: INITIAL_USUARIOS,
    logs: INITIAL_LOGS,
    config: INITIAL_CONFIG,
  };
};

/**
 * Loads the current state from LocalStorage, seeding if empty.
 */
export const loadLocalStorageState = (): LocalStorageState => {
  try {
    const serialized = localStorage.getItem('clandestinos_pizza_state');
    if (!serialized) {
      const defaultState = getInitialState();
      localStorage.setItem('clandestinos_pizza_state', JSON.stringify(defaultState));
      return defaultState;
    }
    const state = JSON.parse(serialized);
    
    // Ensure all critical sections exist in case of partial storage
    if (!state.insumos) state.insumos = INITIAL_INSUMOS;
    if (!state.proveedores) state.proveedores = INITIAL_PROVEEDORES;
    if (!state.recetas) state.recetas = INITIAL_RECETAS;
    if (!state.movimientos) state.movimientos = INITIAL_MOVIMIENTOS;
    if (!state.usuarios) state.usuarios = INITIAL_USUARIOS;
    if (!state.logs) state.logs = INITIAL_LOGS;
    if (!state.config) state.config = INITIAL_CONFIG;
    
    return state;
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
    return getInitialState();
  }
};

/**
 * Saves state to LocalStorage
 */
export const saveLocalStorageState = (state: LocalStorageState): void => {
  try {
    localStorage.setItem('clandestinos_pizza_state', JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
};
