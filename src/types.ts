/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'JEFE' | 'EMPLEADO';

export interface Usuario {
  id: string;
  username: string;
  password?: string; // Solo para guardar localmente
  name: string;
  role: UserRole;
  email: string;
  status: 'activo' | 'inactivo';
  createdAt: string;
}

export type InsumoCategory = 'Harinas' | 'Quesos' | 'Carnes' | 'Vegetales' | 'Salsas' | 'Embalajes' | 'Otros';

export interface Insumo {
  id: string;
  name: string;
  category: InsumoCategory;
  stock: number;
  unit: 'kg' | 'g' | 'L' | 'un' | 'cajas' | 'paquetes';
  minStock: number;
  unitCost: number; // Costo por unidad de medida
  supplierId: string;
  supplierName: string;
  updatedAt: string;
}

export interface Proveedor {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  category: string;
  address: string;
  status: 'activo' | 'inactivo';
}

export interface RecetaIngrediente {
  insumoId: string;
  name: string;
  quantity: number; // Cantidad requerida en la unidad del insumo
  unit: string;
}

export type RecetaCategory = 'Pizzas' | 'Entradas' | 'Salsas' | 'Postres' | 'Otros';

export interface Receta {
  id: string;
  name: string;
  category: RecetaCategory;
  description: string;
  portions: number; // Porciones que rinde la preparación
  prepTime: number; // Tiempo de preparación en minutos
  salePrice: number; // Precio de venta recomendado
  ingredients: RecetaIngrediente[];
}

export interface MovimientoStock {
  id: string;
  insumoId: string;
  insumoName: string;
  type: 'entrada' | 'salida';
  quantity: number;
  unit: string;
  reason: 'Compra / Recepción' | 'Merma / Desperdicio' | 'Consumo en producción' | 'Ajuste manual' | 'Devolución';
  date: string;
  requestedBy: string; // Nombre del usuario que realiza
  notes?: string;
}

export interface LogAccion {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  date: string;
}

export interface LocalStorageState {
  insumos: Insumo[];
  proveedores: Proveedor[];
  recetas: Receta[];
  movimientos: MovimientoStock[];
  usuarios: Usuario[];
  logs: LogAccion[];
  config: {
    pizzaMultiplier: number;
    lowStockAlertThreshold: number; // percentage increment, e.g. 10%
    establishmentName: string;
    currency: string;
    address: string;
    phone: string;
  };
}
