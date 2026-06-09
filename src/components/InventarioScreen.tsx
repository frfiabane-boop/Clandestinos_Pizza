/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Insumo, InsumoCategory, Proveedor, Usuario } from '../types';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Filter,
  X,
  PlusCircle,
  Calendar,
  DollarSign
} from 'lucide-react';

interface InventarioScreenProps {
  insumos: Insumo[];
  proveedores: Proveedor[];
  user: Usuario;
  onAddInsumo: (insumo: Omit<Insumo, 'id' | 'updatedAt'>) => void;
  onUpdateInsumo: (id: string, insumo: Partial<Insumo>) => void;
  onDeleteInsumo: (id: string) => void;
  onAddLog: (action: string, details: string) => void;
}

const CATEGORIES: InsumoCategory[] = ['Harinas', 'Quesos', 'Carnes', 'Vegetales', 'Salsas', 'Embalajes', 'Otros'];

export default function InventarioScreen({
  insumos,
  proveedores,
  user,
  onAddInsumo,
  onUpdateInsumo,
  onDeleteInsumo,
  onAddLog
}: InventarioScreenProps) {
  // Lists, Search, filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'bajo' | 'suficiente'>('all');
  
  // Modal toggles
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InsumoCategory>('Harinas');
  const [stock, setStock] = useState<number>(0);
  const [unit, setUnit] = useState<Insumo['unit']>('kg');
  const [minStock, setMinStock] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [supplierId, setSupplierId] = useState('');

  // Toast / messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const triggerMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Open modal for blank adding
  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCategory('Harinas');
    setStock(0);
    setUnit('kg');
    setMinStock(0);
    setUnitCost(0);
    setSupplierId(proveedores[0]?.id || '');
    setShowFormModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (ins: Insumo) => {
    setEditingId(ins.id);
    setName(ins.name);
    setCategory(ins.category);
    setStock(ins.stock);
    setUnit(ins.unit);
    setMinStock(ins.minStock);
    setUnitCost(ins.unitCost);
    setSupplierId(ins.supplierId);
    setShowFormModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      triggerMessage('error', 'El nombre del insumo es obligatorio.');
      return;
    }
    if (stock < 0 || minStock < 0 || unitCost < 0) {
      triggerMessage('error', 'Los valores numéricos no pueden ser negativos.');
      return;
    }
    if (!supplierId) {
      triggerMessage('error', 'Debes asociar un proveedor.');
      return;
    }

    const matchedSupplier = proveedores.find((p) => p.id === supplierId);
    const supplierName = matchedSupplier ? matchedSupplier.name : 'Sin Proveedor';

    if (editingId) {
      // Update
      onUpdateInsumo(editingId, {
        name: name.trim(),
        category,
        stock,
        unit,
        minStock,
        unitCost,
        supplierId,
        supplierName
      });
      onAddLog('Modificación de Insumo', `Actualizó campos de: ${name.trim()}`);
      triggerMessage('success', `Insumo "${name.trim()}" actualizado correctamente.`);
    } else {
      // Add
      onAddInsumo({
        name: name.trim(),
        category,
        stock,
        unit,
        minStock,
        unitCost,
        supplierId,
        supplierName
      });
      onAddLog('Creación de Insumo', `Agregó un nuevo insumo: ${name.trim()}`);
      triggerMessage('success', `Insumo "${name.trim()}" agregado al inventario.`);
    }

    setShowFormModal(false);
  };

  // Deletion logic with Role limitation
  const handleDeleteClick = (ins: Insumo) => {
    if (user.role !== 'JEFE') {
      triggerMessage('error', 'Permiso denegado: Solo el Jefe de Cocina puede eliminar insumos críticos.');
      onAddLog('Permiso Denegado', `Empleado intentó eliminar insumo ${ins.name}`);
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el insumo: "${ins.name}"? Esta acción no se puede deshacer.`)) {
      onDeleteInsumo(ins.id);
      onAddLog('Eliminación de Insumo', `Se eliminó el insumo: ${ins.name}`);
      triggerMessage('success', `Se eliminó "${ins.name}" con éxito.`);
    }
  };

  // Formatter for prices
  const formatCLP = (v: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(v);
  };

  // Advanced search and filters
  const filteredInsumos = insumos.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                          item.supplierName.toLowerCase().includes(searchTerm.toLowerCase().trim());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    const matchesStockStatus = 
      stockStatusFilter === 'all' || 
      (stockStatusFilter === 'bajo' && item.stock <= item.minStock) ||
      (stockStatusFilter === 'suficiente' && item.stock > item.minStock);

    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notice */}
      {message && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-900 shadow-lg' 
            : 'bg-red-50 border-red-200 text-red-900 shadow-lg'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} className="text-green-650" /> : <AlertTriangle size={20} className="text-red-650" />}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Header Summary Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm text-gray-800">
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Ficha General de Bodega</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Gestiona la lista principal de harina, quesos, embutidos y empaques secundarios para el restaurante.
          </p>
        </div>
        
        <button
          id="btn-add-insumo"
          onClick={handleOpenAdd}
          className="bg-[#B22222] hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg inline-flex items-center gap-2 transition-colors shadow-md shadow-red-950/10 cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Insumo
        </button>
      </div>

      {/* Filters & Search controls */}
      <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 text-gray-800">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, tipo, proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E0E0E0] text-gray-900 pl-9 pr-4 py-2 rounded-lg text-xs placeholder-gray-500 focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4 relative flex items-center gap-2">
          <label className="text-[10px] font-mono uppercase text-[#666666] whitespace-nowrap">Categoría:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-[#E0E0E0] text-gray-900 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
          >
            <option value="all">Todas las Categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Stock Alert Filter */}
        <div className="md:col-span-4 relative flex items-center gap-2">
          <label className="text-[10px] font-mono uppercase text-[#666666] whitespace-nowrap">Estado Stock:</label>
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="w-full bg-white border border-[#E0E0E0] text-gray-900 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
          >
            <option value="all">Todos los Niveles</option>
            <option value="bajo">⚠️ Bajo Stock Crítico</option>
            <option value="suficiente">✅ Stock Estable / Adecuado</option>
          </select>
        </div>
      </div>

      {/* Main Grid Table */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden shadow-sm text-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E0E0E0] text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                <th className="py-3 px-4">Código / ID</th>
                <th className="py-3 px-4">Insumo</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Stock Actual</th>
                <th className="py-3 px-4 text-right">Límite Mínimo</th>
                <th className="py-3 px-4 text-right">Costo / U</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-750">
              {filteredInsumos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-mono">
                    No se encontraron insumos que coincidan con la búsqueda o filtros activos.
                  </td>
                </tr>
              ) : (
                filteredInsumos.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-500 font-semibold">{item.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div>
                            <span className="font-bold text-[#1A1A1A] text-sm block">{item.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              Modificado: {new Date(item.updatedAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-gray-100 text-gray-700 border border-gray-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex flex-col items-end">
                          <span className={`font-black text-sm font-mono ${isLow ? 'text-red-700' : 'text-green-700'}`}>
                            {item.stock} <span className="text-xs font-light text-gray-500">{item.unit}</span>
                          </span>
                          {isLow && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-mono text-[#B22222] font-black uppercase tracking-wider animate-pulse mt-0.5">
                              <AlertTriangle size={8} /> ¡Pedido ya!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-gray-600">
                        {item.minStock} <span className="text-[10px] text-gray-400">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-900 font-bold">
                        {formatCLP(item.unitCost)}
                        <span className="text-[10px] text-gray-500 font-light block">/{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-gray-700 font-medium truncate block max-w-[150px]" title={item.supplierName}>
                          {item.supplierName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Editar Insumo"
                            onClick={() => handleOpenEdit(item)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 p-1.5 rounded transition-colors border border-gray-200 cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            title="Eliminar Insumo"
                            onClick={() => handleDeleteClick(item)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 p-1.5 rounded transition-colors border border-red-250 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* Adding / Editing Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in text-gray-800">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-[#E0E0E0]">
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                {editingId ? 'Editar Parámetros Insumo' : 'Registrar Nuevo Insumo'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                  Nombre del Insumo / Sabor
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Jamón de Pierna Artesanal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InsumoCategory)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  >
                    <option value="kg">kilogramo (kg)</option>
                    <option value="g">gramo (g)</option>
                    <option value="L">litro (L)</option>
                    <option value="un">unidades (un)</option>
                    <option value="cajas">cajas</option>
                    <option value="paquetes">paquetes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Stock Mín. Alerta
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="1"
                    placeholder="Límite"
                    value={minStock}
                    onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Costo x Unidad ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Costo"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                  Proveedor Autorizado
                </label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                >
                  <option value="" disabled>Selecciona un Proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
                {proveedores.length === 0 && (
                  <p className="text-[10px] text-red-650 mt-1">
                    ⚠️ No hay proveedores disponibles. Registra primero uno en "Proveedores" para linkearlo.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer border border-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#B22222] text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-red-700 active:bg-red-800 transition-colors shadow-lg cursor-pointer"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
