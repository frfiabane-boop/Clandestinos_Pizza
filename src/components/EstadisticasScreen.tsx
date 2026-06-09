/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Insumo, LogAccion, MovimientoStock, Proveedor, Receta, Usuario } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  HelpCircle, 
  Calendar, 
  Activity, 
  ShieldAlert, 
  Package, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface EstadisticasScreenProps {
  insumos: Insumo[];
  movimientos: MovimientoStock[];
  proveedores: Proveedor[];
  recetas: Receta[];
  logs: LogAccion[];
}

export default function EstadisticasScreen({
  insumos,
  movimientos,
  proveedores,
  recetas,
  logs
}: EstadisticasScreenProps) {
  const [selectedTab, setSelectedTab] = useState<'kpi' | 'mermas' | 'auditoria'>('kpi');

  // Calculates stats
  const totalStockValuation = insumos.reduce((acc, curr) => acc + (curr.stock * curr.unitCost), 0);
  const belowMinCount = insumos.filter((item) => item.stock <= item.minStock).length;
  
  // Consumos y mermas totals
  const totalMermasCount = movimientos.filter((m) => m.reason === 'Merma / Desperdicio').length;
  const totalMermasValue = movimientos
    .filter((m) => m.reason === 'Merma / Desperdicio')
    .reduce((acc, curr) => {
      const MATCHED_INS = insumos.find((i) => i.id === curr.insumoId);
      const unitCostVal = MATCHED_INS ? MATCHED_INS.unitCost : 0;
      return acc + (curr.quantity * unitCostVal);
    }, 0);

  // Group items by category to render a beautiful cost weight report
  const categoriesMap = insumos.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + (curr.stock * curr.unitCost);
    return acc;
  }, {} as Record<string, number>);

  const categoryEntries = Object.entries(categoriesMap);

  // Filter out recent logs sorted by date desc
  const sortedAuditLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatCLP = (v: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(v);
  };

  return (
    <div className="space-y-6 text-gray-800">
      
      {/* Sub menu tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-[#E0E0E0] flex flex-col sm:flex-row gap-2 shadow-sm">
        <button
          onClick={() => setSelectedTab('kpi')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold font-mono text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
            selectedTab === 'kpi'
              ? 'bg-[#B22222] text-white shadow-sm'
              : 'text-gray-505 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <BarChart3 size={15} />
          Valor de Insumos
        </button>

        <button
          onClick={() => setSelectedTab('mermas')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold font-mono text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
            selectedTab === 'mermas'
              ? 'bg-[#B22222] text-white shadow-sm'
              : 'text-gray-505 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle size={15} />
          Mermas & Escasez
        </button>

        <button
          onClick={() => setSelectedTab('auditoria')}
          className={`flex-1 py-2 px-3 rounded-lg font-bold font-mono text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
            selectedTab === 'auditoria'
              ? 'bg-[#B22222] text-white shadow-sm'
              : 'text-gray-505 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Activity size={15} />
          Auditoría de Acciones
        </button>
      </div>

      {/* Renders Tab Content */}
      {selectedTab === 'kpi' && (
        <div className="space-y-6 animate-fade-in">
          {/* Custom SVG Bar Chart of supply valuations */}
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono mb-1.5 flex items-center gap-2">
              <TrendingUp size={16} className="text-[#B22222]" />
              Valor Neto de Bodega por Categoría ($ CLP)
            </h3>
            <p className="text-xs text-gray-500 mb-6">Comparativa de capital estancado en bodega según rubros de ingredientes.</p>

            {categoryEntries.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-12 font-mono">No hay insumos registrados para valorizar.</p>
            ) : (
              <div className="space-y-5">
                {/* SVG Graphics container */}
                <div className="relative h-64 w-full bg-gray-50 rounded-xl border border-gray-150 p-4 flex items-end justify-around gap-2 pt-8">
                  {/* Absolute Guidelines */}
                  <div className="absolute inset-x-0 top-1/4 border-t border-gray-255 text-[9px] font-mono text-gray-400 pl-2">75% cap</div>
                  <div className="absolute inset-x-0 top-2/4 border-t border-gray-255 text-[9px] font-mono text-gray-400 pl-2">50% cap</div>
                  <div className="absolute inset-x-0 top-3/4 border-t border-gray-225 text-[9px] font-mono text-gray-400 pl-2">25% cap</div>

                  {categoryEntries.map(([category, val]) => {
                    const maxVal = Math.max(...categoryEntries.map(([_, v]) => v), 1);
                    const heightRatio = (val / maxVal) * 80; // percent height maximum 80%

                    return (
                      <div key={category} className="flex flex-col items-center group relative z-10 w-full max-w-[80px]">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 bg-[#B22222] text-white text-[10px] font-mono py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none z-20">
                          {formatCLP(val)}
                        </div>

                        {/* Bar pillar */}
                        <div 
                          className="w-full bg-[#B22222] hover:bg-red-700 rounded-t transition-all duration-1000 shadow-sm h-0 group-hover:brightness-110" 
                          style={{ height: `${Math.max(heightRatio, 4)}%` }}
                        />

                        {/* Label */}
                        <span className="text-[10px] font-mono font-bold text-gray-700 mt-2 truncate w-full text-center" title={category}>
                          {category}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400 font-bold block">
                          {((val / totalStockValuation) * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend list metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-[#E0E0E0] shadow-sm">
                    <span className="text-[10px] text-gray-400 font-mono block uppercase">Patrimonio Bodega:</span>
                    <strong className="text-[#1A1A1A] text-base font-black mt-1 block font-mono">{formatCLP(totalStockValuation)}</strong>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#E0E0E0] shadow-sm">
                    <span className="text-[10px] text-gray-400 font-mono block uppercase">Categoría Líder:</span>
                    <strong className="text-[#B22222] text-sm font-black mt-1 block uppercase">
                      {categoryEntries.length > 0 ? [...categoryEntries].sort((a,b) => b[1]-a[1])[0][0] : 'Ninguno'}
                    </strong>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#E0E0E0] shadow-sm">
                    <span className="text-[10px] text-gray-400 font-mono block uppercase">Bajo Mínimo:</span>
                    <strong className="text-yellow-600 text-sm font-black mt-1 block uppercase">{belowMinCount} insumos críticos</strong>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#E0E0E0] shadow-sm">
                    <span className="text-[10px] text-gray-400 font-mono block uppercase">Proveedores:</span>
                    <strong className="text-green-750 text-sm font-black mt-1 block uppercase">{proveedores.length} calificados</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'mermas' && (
        <div className="space-y-6 animate-fade-in">
          {/* Mermas cost report card */}
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono mb-1.5 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#B22222]" />
              Pérdidas y Mermas por Desperdicio de Masa o Caducados
            </h3>
            <p className="text-xs text-gray-500 mb-6">Auditoría financiera del valor de materias primas desechadas en la preparación o control.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 shadow-sm">
                <span className="text-[10px] text-[#666666] font-mono block uppercase">Total Eventos Registrados:</span>
                <strong className="text-[#1A1A1A] text-xl font-bold block mt-1">{totalMermasCount} incidentes</strong>
              </div>

              <div className="bg-[#B22222]/5 p-4 rounded-xl border border-[#B22222]/20 shadow-sm">
                <span className="text-[10px] text-[#B22222] font-mono block uppercase font-bold">Valorizador de Pérdidas:</span>
                <strong className="text-[#B22222] text-xl font-black block mt-1 font-mono">{formatCLP(totalMermasValue)}</strong>
                <span className="text-[9px] text-[#B22222]/70 font-mono">Deducción neta de coste del mes</span>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                <span className="text-[10px] text-green-800 font-mono block uppercase font-bold">Insumos bajo alerta de abasto:</span>
                <strong className="text-green-850 text-xl font-black block mt-1">{belowMinCount} / {insumos.length}</strong>
                <span className="text-[9px] text-green-700 font-mono">Frecuencia de reabastecimiento: Semanal</span>
              </div>
            </div>

            {/* List of concrete mermas registered with description */}
            <div className="overflow-x-auto border border-[#E0E0E0] rounded-xl shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E0E0E0] text-[9px] font-mono text-gray-505 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Insumo Desechado</th>
                    <th className="py-2.5 px-3 text-right">Cant. Descarte</th>
                    <th className="py-2.5 px-3 text-right">Costo Subtotal</th>
                    <th className="py-2.5 px-3">Registrado Por</th>
                    <th className="py-2.5 px-3">Explicativa / Causa de Merma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {movimientos.filter((m) => m.reason === 'Merma / Desperdicio').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-mono bg-white">
                        👍 ¡Excelente trabajo corporativo! No se han digitado pérdidas por mermas en este periodo.
                      </td>
                    </tr>
                  ) : (
                    movimientos
                      .filter((m) => m.reason === 'Merma / Desperdicio')
                      .map((m) => {
                        const targetIns = insumos.find((i) => i.id === m.insumoId);
                        const singleCost = targetIns ? targetIns.unitCost : 0;
                        const costTotal = singleCost * m.quantity;

                        return (
                          <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 px-3 text-gray-500 font-mono">
                              {new Date(m.date).toLocaleDateString('es-ES', {hour:'2-digit', minute:'2-digit'})}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-gray-900 uppercase">{m.insumoName}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-gray-900 font-bold">
                              {m.quantity} {m.unit}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-[#B22222] font-black">
                              {formatCLP(costTotal)}
                            </td>
                            <td className="py-2.5 px-3 text-gray-700 font-medium">{m.requestedBy}</td>
                            <td className="py-2.5 px-3 text-yellow-750 font-medium italic">{m.notes || 'No se detallaron notas'}</td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'auditoria' && (
        <div className="space-y-6 animate-fade-in">
          {/* Audit Logs actions screen */}
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono mb-1.5 flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#B22222]" />
              Historial de Auditoría de Acciones Importantes (Security Logs)
            </h3>
            <p className="text-xs text-gray-505 mb-6">Registro intransferible de autorizaciones, ingresos de login, borrado de insumos o cambio de recetas.</p>

            <div className="overflow-x-auto border border-[#E0E0E0] rounded-xl shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-[#E0E0E0] text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Fecha Evento</th>
                    <th className="py-3 px-4">Usuario Responsable</th>
                    <th className="py-3 px-4">Hito / Acción Ejecutada</th>
                    <th className="py-3 px-4">Descripción de Tránsito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-mono text-xs text-gray-700">
                  {sortedAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400 bg-white">
                        No hay logs de seguridad guardados en esta estación de control.
                      </td>
                    </tr>
                  ) : (
                    sortedAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-450">
                          {new Date(log.date).toLocaleString('es-ES')}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#B22222]">
                          {log.userName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block bg-white border border-[#E0E0E0] px-2.5 py-1 rounded font-bold text-[10px] text-gray-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-sans font-medium">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
