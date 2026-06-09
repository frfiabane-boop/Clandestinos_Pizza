/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Insumo, MovimientoStock, Proveedor, Receta, Usuario } from '../types';
import { 
  TrendingUp, 
  AlertOctagon, 
  Users, 
  UtensilsCrossed, 
  ArrowUpRight, 
  ArrowDownRight,
  History,
  Coins,
  Package,
  CalendarDays,
  ExternalLink
} from 'lucide-react';

interface DashboardScreenProps {
  insumos: Insumo[];
  movimientos: MovimientoStock[];
  proveedores: Proveedor[];
  recetas: Receta[];
  usuarios: Usuario[];
  setActiveView: (view: any) => void;
  user: Usuario;
}

export default function DashboardScreen({ 
  insumos, 
  movimientos, 
  proveedores, 
  recetas, 
  usuarios, 
  setActiveView,
  user
}: DashboardScreenProps) {

  // Calculate stats
  const totalStockItems = insumos.length;
  
  // Total Valuation of Stocks (stock * unitCost)
  const totalStockValuation = insumos.reduce((acc, curr) => {
    return acc + (curr.stock * curr.unitCost);
  }, 0);

  const lowStockItems = insumos.filter((item) => item.stock <= item.minStock);
  const activeSuppliersCount = proveedores.filter((p) => p.status === 'activo').length;
  const totalRecipesCount = recetas.length;

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Get recent logs (sorted by date desc, taking first 4)
  const recentMovements = [...movimientos]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Group items by category to make an elegant visual breakdown
  const categoriesMap = insumos.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + (curr.stock * curr.unitCost);
    return acc;
  }, {} as Record<string, number>);

  const categoryEntries = Object.entries(categoriesMap);
  const maxCategoryVal = Math.max(...categoryEntries.map(([_, v]) => v), 1);

  // Focus Ingredients for Pizza Base Health Check meters
  const focusInsumoNames = [
    { targetId: 'ins-1', displayName: 'Harina de Fuerza', maxScale: 200, unit: 'kg' },
    { targetId: 'ins-2', displayName: 'Queso Mozzarella', maxScale: 80, unit: 'kg' },
    { targetId: 'ins-4', displayName: 'Salsa de Tomate de la Casa', maxScale: 150, unit: 'L' },
    { targetId: 'ins-3', displayName: 'Pepperoni Italiano', maxScale: 50, unit: 'kg' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-[#B22222] border border-[#B22222]/20 rounded-2xl p-6 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight font-sans">
              ¡Bienvenido, Chef pizzero <span className="text-red-100">{user.name.split(' ')[0]}</span>!
            </h2>
            <p className="text-red-100/80 text-sm mt-1 max-w-xl">
              Clandestinos Pizza está en línea. Revisa el estado de la masa madre, quesera y salsa, y registra mermas o despachos en tiempo real.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('inventario')}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-[#B22222] font-black text-xs uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <Package size={14} />
              Revisar Inventario
            </button>
            <button
              onClick={() => setActiveView('movimientos')}
              className="px-4 py-2 bg-black/20 hover:bg-black/30 text-white font-bold text-xs uppercase tracking-wider rounded-lg border border-white/20 transition-colors inline-flex items-center gap-2"
            >
              <History size={14} />
              Movimientos
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (4 columns Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Valuation */}
        <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-between text-[#1A1A1A]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">Valor Neto de Bodega</span>
            <h3 className="text-2xl font-bold mt-1 text-[#1A1A1A]">{formatCurrency(totalStockValuation)}</h3>
            <span className="text-[10px] font-mono text-green-600 flex items-center gap-1 mt-1">
              <Coins size={10} /> Valor de insumos actuales
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-650">
            <Coins size={22} />
          </div>
        </div>

        {/* KPI: Low Stock */}
        <div className={`p-5 rounded-xl border shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-between transition-colors ${
          lowStockItems.length > 0
            ? 'bg-amber-50 border-amber-300 text-amber-955'
            : 'bg-white border-[#E0E0E0] text-[#1A1A1A]'
        }`}>
          <div>
            <span className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${
              lowStockItems.length > 0 ? 'text-amber-800' : 'text-[#B22222]'
            }`}>Insumos Críticos</span>
            <h3 className="text-2xl font-bold mt-1">
              {lowStockItems.length} {lowStockItems.length === 1 ? 'insumo' : 'insumos'}
            </h3>
            <span className={`text-[10px] sm:text-[11px] font-mono mt-1 block truncate ${
              lowStockItems.length > 0 ? 'text-amber-700' : 'text-[#666666]'
            }`}>
              {lowStockItems.length > 0 ? '⚠️ ¡Requieren reabastecer urgente!' : '✅ Todo bajo control'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            lowStockItems.length > 0 ? 'bg-amber-100 text-amber-700 border border-amber-250' : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            <AlertOctagon size={22} />
          </div>
        </div>

        {/* KPI: Recipes */}
        <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-between text-[#1A1A1A]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">Recetas Secretas</span>
            <h3 className="text-2xl font-bold mt-1 text-[#1A1A1A]">{totalRecipesCount} preparaciones</h3>
            <span className="text-[10px] font-mono text-[#666666] flex items-center gap-1 mt-1">
              Fórmula de costos automatizada
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#B22222]">
            <UtensilsCrossed size={22} />
          </div>
        </div>

        {/* KPI: Suppliers */}
        <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-between text-[#1A1A1A]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">Proveedores Activos</span>
            <h3 className="text-2xl font-bold mt-1 text-[#1A1A1A]">{activeSuppliersCount} aliados</h3>
            <span className="text-[10px] font-mono text-[#666666] flex items-center gap-1 mt-1">
              Gestión de entregas y precios
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-650">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Main Core Breakdown & Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Quick Alert gauges on critical pizza components */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.05)] text-gray-800">
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                  Suministro Base de Pizza (KPI de Abasto)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Nivel actual respecto a la capacidad operativa del mes.</p>
              </div>
              <span className="text-[10px] font-mono bg-[#B22222]/10 border border-[#B22222]/20 text-[#B22222] px-2.5 py-0.5 rounded">
                Control de Tolvas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {focusInsumoNames.map((focus) => {
                const matchedInsumo = insumos.find(i => i.id === focus.targetId);
                const currentStock = matchedInsumo ? matchedInsumo.stock : 0;
                const minStock = matchedInsumo ? matchedInsumo.minStock : 0;
                const ratio = Math.min((currentStock / focus.maxScale) * 100, 100);
                const isUnderMin = currentStock <= minStock;

                return (
                  <div key={focus.targetId} className="bg-gray-50 p-4 rounded-xl border border-[#E0E0E0] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 uppercase">{focus.displayName}</h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Capacidad Ref: {focus.maxScale} {focus.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-[#1A1A1A]">
                          {currentStock} <span className="text-xs text-gray-500 font-light">{focus.unit}</span>
                        </span>
                        {isUnderMin ? (
                          <span className="block text-[9px] font-mono text-[#B22222] font-semibold animate-pulse mt-0.5">
                            ⚠️ BAJO LÍMITE CRÍTICO
                          </span>
                        ) : (
                          <span className="block text-[9px] font-mono text-green-600 mt-0.5">
                            Suficiente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar Gauge */}
                    <div className="space-y-1">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative border border-gray-300/30">
                        {/* Minimum stock marker */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10" 
                          style={{ left: `${(minStock / focus.maxScale) * 100}%` }}
                          title={`Mínimo de seguridad: ${minStock} ${focus.unit}`}
                        />
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isUnderMin ? 'bg-[#B22222]' : 'bg-red-700'
                          }`} 
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                        <span>0%</span>
                        <span className="text-yellow-600 font-bold">Mín. Alerta ({minStock} {focus.unit})</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Movements Board */}
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.05)] text-gray-800">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <History className="text-[#B22222]" size={18} />
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                  Últimos Movimientos de Stock
                </h3>
              </div>
              <button 
                onClick={() => setActiveView('movimientos')}
                className="text-xs text-[#B22222] hover:text-red-750 transition-colors inline-flex items-center gap-1 font-mono hover:underline"
              >
                Ver todo el historial
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead>
                  <tr className="border-b border-[#E0E0E0] text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Insumo</th>
                    <th className="py-2.5 px-3 text-center">Tipo</th>
                    <th className="py-2.5 px-3 text-right">Cantidad</th>
                    <th className="py-2.5 px-3">Motivo</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 text-xs font-mono">
                        No se han registrado movimientos de stock en esta bodega.
                      </td>
                    </tr>
                  ) : (
                    recentMovements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3 text-gray-500 font-mono">
                          {new Date(mov.date).toLocaleDateString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                        </td>
                        <td className="py-2.5 px-3 text-[#1A1A1A] font-bold">{mov.insumoName}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold leading-tight ${
                            mov.type === 'entrada' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {mov.type === 'entrada' ? 'ENTRADA' : 'SALIDA'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                          {mov.type === 'entrada' ? '+' : '-'}{mov.quantity} {mov.unit}
                        </td>
                        <td className="py-2.5 px-3 text-gray-650 font-medium">{mov.reason}</td>
                        <td className="py-2.5 px-3 text-gray-500 truncate max-w-[120px]" title={mov.requestedBy}>
                          {mov.requestedBy.split(' ')[0]}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Capital distribution and info cards */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Capital Distribution Summary */}
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.05)] text-gray-800">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono mb-4 border-b border-gray-100 pb-2">
              Capital por Categoría
            </h3>
            
            <div className="space-y-4">
              {categoryEntries.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Bodega vacía. Agrega insumos para valorizar.</p>
              ) : (
                categoryEntries
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, value]) => {
                    const perc = (value / totalStockValuation) * 100;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-800 font-semibold">{category}</span>
                          <span className="font-mono text-[#1A1A1A] font-bold">{formatCurrency(value)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-[#B22222] rounded-full transition-all"
                            style={{ width: `${perc}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-gray-500 text-right">
                          {perc.toFixed(1)}% del capital de bodega
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Patrimonio Total Estimado:</span>
              <strong className="text-[#1A1A1A] text-sm font-black">{formatCurrency(totalStockValuation)}</strong>
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-gray-100 p-5 rounded-xl border border-gray-250 shadow-inner flex flex-col justify-between text-gray-800">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UtensilsCrossed size={16} className="text-[#B22222]" />
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide font-mono">Control Diario Clandestinos</span>
              </div>
              <p className="text-xs text-gray-650 leading-relaxed">
                El control de inventario de insumos críticos es clave para mantener nuestros precios competitivos de venta. 
                Los cambios en los insumos se reflejan inmediatamente en el costo estimado de la carta en <strong>Recetas de Cocina</strong>.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] text-gray-500 font-mono">
              Estación de trabajo autorizada para: <strong className="text-[#B22222]">{user.role}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
