/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Usuario } from '../types';
import { 
  Settings, 
  RefreshCw, 
  Check, 
  MapPin, 
  Phone, 
  Store, 
  Coins, 
  AlertOctagon, 
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ConfiguracionScreenProps {
  config: {
    pizzaMultiplier: number;
    lowStockAlertThreshold: number;
    establishmentName: string;
    currency: string;
    address: string;
    phone: string;
  };
  onUpdateConfig: (newConfig: any) => void;
  onResetDatabase: () => void;
  user: Usuario;
  onAddLog: (action: string, details: string) => void;
}

export default function ConfiguracionScreen({
  config,
  onUpdateConfig,
  onResetDatabase,
  user,
  onAddLog
}: ConfiguracionScreenProps) {
  // Local config states
  const [establishmentName, setEstablishmentName] = useState(config.establishmentName);
  const [pizzaMultiplier, setPizzaMultiplier] = useState(config.pizzaMultiplier);
  const [lowStockAlertThreshold, setLowStockAlertThreshold] = useState(config.lowStockAlertThreshold);
  const [currency, setCurrency] = useState(config.currency);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!establishmentName.trim()) {
      triggerToast('error', 'El nombre corporativo no puede quedar en blanco.');
      return;
    }

    onUpdateConfig({
      establishmentName: establishmentName.trim(),
      pizzaMultiplier,
      lowStockAlertThreshold,
      currency,
      address: address.trim(),
      phone: phone.trim()
    });

    onAddLog('Actualización General de Sistema', 'Modificó parámetros globales de Clandestinos Pizza.');
    triggerToast('success', 'Configuración guardada en LocalStorage exitosamente.');
  };

  const handleResetClick = () => {
    if (user.role !== 'JEFE') {
      triggerToast('error', 'Permiso denegado: Solo el rol JEFE puede forzar una desinflación de bodega.');
      return;
    }

    if (confirm('🚨 ATENCIÓN: Estás a punto de borrar todos tus cambios (insumos, proveedores, movimientos, usuarios nuevos) y restaurar los datos semilla iniciales de Clandestinos Pizza. ¿Deseas continuar?')) {
      onResetDatabase();
      triggerToast('success', 'Sistema reiniciado exitosamente. Recargando parámetros de Clandestinos de fábrica...');
      
      // Reload page in 1s to feed states
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 text-gray-800">

      {/* Alarm notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-900 shadow-lg' : 'bg-red-50 border-red-200 text-red-900 border-none'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} className="text-green-650" /> : <AlertTriangle size={20} className="text-red-650" />}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form parameter change */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono border-b border-gray-100 pb-2">
            Parámetros del Almacén Gastronómico
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Division Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                  Nombre del Establecimiento
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Store size={15} />
                  </span>
                  <input
                    type="text"
                    value={establishmentName}
                    onChange={(e) => setEstablishmentName(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-950 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                  Moneda Base Comercial
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#B22222]"
                  placeholder="CLP"
                />
              </div>
            </div>

            {/* Config Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                  Multiplicador Mermas de Producción
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="2"
                  value={pizzaMultiplier}
                  onChange={(e) => setPizzaMultiplier(parseFloat(e.target.value) || 1)}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#B22222]"
                />
                <span className="text-[10px] text-gray-400 font-mono mt-1 block">Factores estimados de masa inservible (ej: 1.15 = +15%)</span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                  Rango Default Alerta Stock bajo (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={lowStockAlertThreshold}
                  onChange={(e) => setLowStockAlertThreshold(parseInt(e.target.value) || 20)}
                  className="w-full bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#B22222]"
                />
              </div>
            </div>

            {/* Contact metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                  Dirección Local / Sucursal
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <MapPin size={15} />
                  </span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-950 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                  Teléfono de Emergencias
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Phone size={15} />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-955 pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>
              </div>
            </div>

            {/* Action Save button */}
            <div className="pt-4 border-t border-gray-100 text-right">
              {user.role === 'JEFE' ? (
                <button
                  type="submit"
                  className="bg-[#B22222] hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Check size={14} />
                  Guardar Configuración
                </button>
              ) : (
                <p className="text-[10px] text-gray-400 font-mono text-left">
                  🔒 Para re-escribir los metadatos o factores del restaurante, requieres firma del Jefe de Cocina (Rol: JEFE).
                </p>
              )}
            </div>

          </form>
        </div>

        {/* Right column: Seed Reset and backup details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recovery reset panel */}
          <div className="bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-red-900 uppercase tracking-wider font-mono flex items-center gap-1.5 border-none">
              <AlertOctagon size={16} className="text-[#B22222] animate-none" /> Danger Zone & Reinicios
            </h4>
            <p className="text-xs text-red-850 leading-relaxed">
              ¿Deseas vaciar los movimientos del local, desvincular usuarios creados por simulación y restaurar la base de datos de control original para la pizzería?
            </p>

            <button
              onClick={handleResetClick}
              disabled={user.role !== 'JEFE'}
              className={`w-full py-2.5 px-4 font-bold font-mono text-xs uppercase tracking-wider rounded-lg border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                user.role === 'JEFE'
                  ? 'bg-red-100 border-red-300 text-red-700 hover:bg-[#B22222] hover:text-white hover:border-transparent'
                  : 'bg-gray-100 border-gray-250 text-gray-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              Resetear a Semilla Inicial
            </button>
            
            {user.role !== 'JEFE' && (
              <span className="block text-[9px] font-mono text-red-800 leading-relaxed font-semibold">
                * Solo el Jefe ("jefe") posee los niveles de privilegios para forzar el vaciado y restauración inicial.
              </span>
            )}
          </div>

          {/* Core workstation identifier info */}
          <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider flex items-center gap-1.5 border-none">
              <Info size={14} className="text-[#B22222]" /> Metadatos del Sistema
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Esta aplicación guarda todas sus modificaciones directamente en el almacenamiento persistente del navegador del cliente (LocalStorage). 
              No requiere conexión ni servidor externo para la demo estática.
            </p>

            <div className="space-y-1.5 text-[10px] font-mono text-gray-400 pt-2 border-t border-gray-100 font-bold">
              <div className="flex justify-between">
                <span>Versión:</span>
                <span className="text-gray-700">2.5.0 STABLE</span>
              </div>
              <div className="flex justify-between">
                <span>Sesión Activa:</span>
                <span className="text-gray-750">{user.username} (IP Local)</span>
              </div>
              <div className="flex justify-between">
                <span>Ambiente:</span>
                <span className="text-green-700">SANDBOX OK</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
