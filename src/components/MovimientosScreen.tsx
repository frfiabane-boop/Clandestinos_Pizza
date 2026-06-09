/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Insumo, MovimientoStock, Usuario } from '../types';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  User, 
  FileText,
  AlertTriangle,
  CheckCircle,
  X 
} from 'lucide-react';

interface MovimientosScreenProps {
  movimientos: MovimientoStock[];
  insumos: Insumo[];
  user: Usuario;
  onAddMovimiento: (mov: Omit<MovimientoStock, 'id' | 'date'>) => boolean; // returns success status
}

export default function MovimientosScreen({
  movimientos,
  insumos,
  user,
  onAddMovimiento
}: MovimientosScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entrada' | 'salida'>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  
  // New movement registration state
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [movType, setMovType] = useState<'entrada' | 'salida'>('entrada');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<MovimientoStock['reason']>('Compra / Recepción');
  const [notes, setNotes] = useState('');

  // Toast alert
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenForm = () => {
    if (insumos.length === 0) {
      triggerToast('error', 'No hay insumos registrados en el inventario. Agrega al menos uno primero.');
      return;
    }
    setSelectedInsumoId(insumos[0].id);
    setMovType('entrada');
    setQuantity(0);
    setReason('Compra / Recepción');
    setNotes('');
    setShowFormModal(true);
  };

  const handleInsumoChange = (id: string) => {
    setSelectedInsumoId(id);
    const item = insumos.find((i) => i.id === id);
    if (item) {
      // Suggest realistic default reason
      if (item.category === 'Embalajes') {
        setReason(movType === 'entrada' ? 'Compra / Recepción' : 'Consumo en producción');
      }
    }
  };

  const handleTypeChange = (type: 'entrada' | 'salida') => {
    setMovType(type);
    if (type === 'entrada') {
      setReason('Compra / Recepción');
    } else {
      setReason('Consumo en producción');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInsumoId) {
      triggerToast('error', 'Debes seleccionar un insumo.');
      return;
    }

    if (quantity <= 0) {
      triggerToast('error', 'La cantidad del movimiento debe ser un número mayor que 0.');
      return;
    }

    const targetedInsumo = insumos.find((i) => i.id === selectedInsumoId);
    if (!targetedInsumo) {
      triggerToast('error', 'Insumo inválido.');
      return;
    }

    // Check if exit movement exceeds actual stock
    if (movType === 'salida' && targetedInsumo.stock < quantity) {
      triggerToast(
        'error', 
        `Operación Denegada: El stock actual de "${targetedInsumo.name}" es ${targetedInsumo.stock} ${targetedInsumo.unit}, lo que es insuficiente para retirar ${quantity} ${targetedInsumo.unit}.`
      );
      return;
    }

    // Attempt to register
    const success = onAddMovimiento({
      insumoId: selectedInsumoId,
      insumoName: targetedInsumo.name,
      type: movType,
      quantity,
      unit: targetedInsumo.unit,
      reason,
      requestedBy: user.name,
      notes: notes.trim() ? notes.trim() : undefined
    });

    if (success) {
      triggerToast(
        'success', 
        `Se registró con éxito la ${movType === 'entrada' ? 'entrada' : 'salida'} de ${quantity} ${targetedInsumo.unit} de: ${targetedInsumo.name}`
      );
      setShowFormModal(false);
    } else {
      triggerToast('error', 'Ocurrió un error inesperado al actualizar el inventario.');
    }
  };

  // Filter list
  const filteredMovimientos = movimientos.filter((m) => {
    const matchesSearch = m.insumoName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                          m.requestedBy.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                          (m.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase().trim());
    
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesReason = reasonFilter === 'all' || m.reason === reasonFilter;

    return matchesSearch && matchesType && matchesReason;
  });

  // Sort: Chronological desc by default 
  const sortedMovimientos = [...filteredMovimientos].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">

      {/* Floating toast alerts */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
          toast.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-900 shadow-lg' 
            : 'bg-red-50 border-red-200 text-red-900 shadow-lg'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle size={20} className="text-green-650" />
          ) : (
            <AlertTriangle size={20} className="text-red-650" />
          )}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Intro block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm text-gray-800">
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Bitácora de Pesaje e Ingresos</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Ingresa compras a proveedores, consumo matutino de masa madre o merma por sobre-cocción. Automatiza la reposición física.
          </p>
        </div>
        
        <button
          id="btn-register-mov"
          onClick={handleOpenForm}
          className="bg-[#B22222] hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg inline-flex items-center gap-2 transition-colors shadow-md cursor-pointer"
        >
          <ArrowLeftRight size={16} />
          Registrar Movimiento
        </button>
      </div>

      {/* Search and Advanced Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-gray-800">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Buscar por ingrediente, operador o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E0E0E0] text-gray-900 pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-3 relative flex items-center gap-1.5">
          <label className="text-[10px] font-mono uppercase text-[#666666] whitespace-nowrap">Historial:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-white border border-[#E0E0E0] text-gray-905 px-2 py-2 rounded-lg text-xs focus:outline-none focus:border-[#B22222]"
          >
            <option value="all">Filtro de Flujo</option>
            <option value="entrada">📥 Entradas de Insumo</option>
            <option value="salida">📤 Salidas / Consumos</option>
          </select>
        </div>

        {/* Reason Filter */}
        <div className="sm:col-span-4 relative flex items-center gap-1.5">
          <label className="text-[10px] font-mono uppercase text-[#666666] whitespace-nowrap">Motivo:</label>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="w-full bg-white border border-[#E0E0E0] text-gray-905 px-2 py-2 rounded-lg text-xs focus:outline-none focus:border-[#B22222]"
          >
            <option value="all">Todos los Motivos</option>
            <option value="Compra / Recepción">Compra / Recepción</option>
            <option value="Consumo en producción">Consumo en producción</option>
            <option value="Merma / Desperdicio">Merma / Desperdicio</option>
            <option value="Ajuste manual">Ajuste manual</option>
            <option value="Devolución">Devolución</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden shadow-sm text-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E0E0E0] text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Insumo Afectado</th>
                <th className="py-3 px-4 text-center">Operación</th>
                <th className="py-3 px-4 text-right">Cantidad de Pesaje</th>
                <th className="py-3 px-4">Motivo Justificado</th>
                <th className="py-3 px-4">Operador Responsable</th>
                <th className="py-3 px-4">Notas / Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {sortedMovimientos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-mono">
                    No hay registros de movimientos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                sortedMovimientos.map((mov) => {
                  const isEntrada = mov.type === 'entrada';
                  return (
                    <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400 animate-none" />
                          <span>
                            {new Date(mov.date).toLocaleString('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black">
                        <span className="text-[#1A1A1A] text-sm font-bold">{mov.insumoName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                          isEntrada
                            ? 'bg-green-100 border border-green-200 text-green-800'
                            : 'bg-red-100 border border-red-200 text-red-800'
                        }`}>
                          {isEntrada ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {isEntrada ? 'ENTRADA' : 'SALIDA'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#1A1A1A]">
                        {isEntrada ? '+' : '-'}{mov.quantity} <span className="text-xs text-gray-500 font-light">{mov.unit}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-gray-800 font-semibold">{mov.reason}</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                        <div className="flex items-center gap-1">
                          <User size={13} className="text-gray-400" />
                          <span>{mov.requestedBy}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 italic max-w-[200px] truncate" title={mov.notes || 'Ninguna'}>
                        <div className="flex items-center gap-1 min-w-0">
                          {mov.notes && <FileText size={12} className="text-gray-400 shrink-0" />}
                          <span className="truncate">{mov.notes || '—'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/55 z-40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-gray-800">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-[#E0E0E0]">
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-widest font-mono border-none">
                Registrar Movimiento en Clandestinos
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-gray-500 hover:text-gray-850 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Type toggle selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
                  Tipo de Flujo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('entrada')}
                    className={`py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider text-center border transition-all cursor-pointer ${
                      movType === 'entrada'
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-white border-gray-300 text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    📥 Entrada (Abasto / Compra)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('salida')}
                    className={`py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider text-center border transition-all cursor-pointer ${
                      movType === 'salida'
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-white border-gray-300 text-gray-500 hover:text-gray-850'
                    }`}
                  >
                    📤 Salida (Consumo / Merma)
                  </button>
                </div>
              </div>

              {/* Insumo selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                  Insumo a modificar
                </label>
                <select
                  required
                  value={selectedInsumoId}
                  onChange={(e) => handleInsumoChange(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                >
                  {insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} — [Stock: {i.stock} {i.unit}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Cantidad ({insumos.find((i) => i.id === selectedInsumoId)?.unit || 'unidad'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    placeholder="ej. 15.5"
                    value={quantity || ''}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>

                {/* Reason Select */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Motivo Detallado
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  >
                    {movType === 'entrada' ? (
                      <>
                        <option value="Compra / Recepción">Compra / Recepción</option>
                        <option value="Ajuste manual">Ajuste manual (Inventariado)</option>
                        <option value="Devolución">Devolución de Cliente / Merma cancelada</option>
                      </>
                    ) : (
                      <>
                        <option value="Consumo en producción">Consumo en producción (Despachos)</option>
                        <option value="Merma / Desperdicio">Merma / Desperdicio (Vencido/Dañado)</option>
                        <option value="Ajuste manual">Ajuste manual (Pesaje)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Optional Description Notes */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                  Notas explicativas (Requerido para mermas o ajustes manuales)
                </label>
                <textarea
                  placeholder="ej. Recepción de palet dañado Nº123, o descarte de hojas marchitas albahaca por humedad."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:outline-none placeholder-gray-400 focus:border-[#B22222]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-200 hover:text-gray-900 transition-colors border border-gray-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#B22222] text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-red-700 active:bg-red-800 transition-colors shadow-lg cursor-pointer"
                >
                  Aplicar al Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
