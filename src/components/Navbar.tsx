/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Insumo, Usuario } from '../types';
import { Menu, Bell, AlertTriangle, User, Calendar, ExternalLink } from 'lucide-react';
import React, { useState } from 'react';

interface NavbarProps {
  user: Usuario;
  activeView: string;
  insumosList: Insumo[];
  setSidebarOpen: (open: boolean) => void;
  onQuickMovementClick: () => void;
}

export default function Navbar({ user, activeView, insumosList, setSidebarOpen, onQuickMovementClick }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter low stock items for warnings
  const lowStockItems = insumosList.filter((item) => item.stock <= item.minStock);

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Dashboard de Operaciones';
      case 'inventario':
        return 'Control de Inventario e Insumos';
      case 'movimientos':
        return 'Historial de Movimientos de Stock';
      case 'proveedores':
        return 'Directorio de Proveedores';
      case 'recetas':
        return 'Fórmulas y Recetas Secreta';
      case 'estadisticas':
        return 'Análisis y Estadísticas Operativas';
      case 'usuarios':
        return 'Administración de Personal de Cocina';
      case 'configuracion':
        return 'Configuración Global del Sistema';
      default:
        return 'Clandestinos Pizza';
    }
  };

  const getFormattedDate = () => {
    const opts: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('es-ES', opts);
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E0E0E0] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Boton hamburguesa para móviles */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-500 hover:text-[#1A1A1A] p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B22222]"
        >
          <Menu size={24} />
        </button>
 
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-[#1A1A1A] tracking-tight">{getTitle()}</h1>
          <p className="text-[11px] text-gray-500 font-mono capitalize">
            {getFormattedDate()}
          </p>
        </div>
        <div className="sm:hidden">
          <h1 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">{getTitle().slice(0, 16)}...</h1>
        </div>
      </div>
 
      {/* Acciones de la derecha */}
      <div className="flex items-center gap-4">
        {/* Quick stock movement trigger button */}
        <button
          id="btn-quick-mov"
          onClick={onQuickMovementClick}
          className="hidden md:flex items-center gap-2 bg-[#B22222]/10 hover:bg-[#B22222]/20 border border-[#B22222]/30 text-[#B22222] font-semibold font-mono text-xs px-3 py-1.5 rounded-lg transition-all"
        >
          <AlertTriangle size={14} className="text-[#B22222] animate-pulse" />
          Registrar Stock
        </button>
 
        {/* Campana de Notificaciones de Stock Crítico */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors relative"
          >
            <Bell size={20} />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B22222] animate-ping" />
            )}
            {lowStockItems.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B22222]" />
            )}
          </button>
 
          {/* Menú desplegable de alertas */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E0E0E0] rounded-xl shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-[#E0E0E0] flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-805 font-mono uppercase tracking-wider">Alertas de Stock</h4>
                  <span className="text-[10px] bg-[#B22222]/10 border border-[#B22222]/20 text-[#B22222] px-1.5 py-0.5 rounded font-mono">
                    {lowStockItems.length} críticas
                  </span>
                </div>
                
                <div className="max-h-64 overflow-y-auto mt-1">
                  {lowStockItems.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-gray-550">
                      👍 Todos los insumos clave están por sobre el nivel crítico.
                    </div>
                  ) : (
                    lowStockItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="px-4 py-3 hover:bg-gray-50 border-b border-[#E0E0E0] last:border-none flex items-start gap-2.5 transition-colors"
                      >
                        <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Stock actual: <strong className="text-red-650">{item.stock} {item.unit}</strong> (Mín. {item.minStock} {item.unit})
                          </p>
                          <span className="inline-block mt-1 text-[9px] font-mono bg-yellow-500/10 border border-yellow-500/30 text-yellow-650 px-1 rounded">
                            Reabastecer con {item.supplierName}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="px-4 py-1.5 text-center border-t border-[#E0E0E0] bg-gray-50">
                  <span className="text-[10px] text-gray-400 font-mono">
                    Clandestinos Real-Time Control
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
 
        {/* Info del Establecimiento */}
        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="text-right">
            <span className="block text-xs font-bold text-[#1A1A1A] leading-none font-mono tracking-wide">CLANDESTINOS</span>
            <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-mono text-green-600 font-bold leading-none">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              PROD V2.5
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
