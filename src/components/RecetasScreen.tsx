/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Insumo, Receta, RecetaCategory, RecetaIngrediente, Usuario } from '../types';
import { 
  Plus, 
  Search, 
  UtensilsCrossed, 
  Clock, 
  ChefHat, 
  Trash2, 
  Edit2, 
  Coins, 
  HelpCircle, 
  X, 
  PlusCircle, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

interface RecetasScreenProps {
  recetas: Receta[];
  insumos: Insumo[];
  user: Usuario;
  onAddReceta: (receta: Omit<Receta, 'id'>) => void;
  onUpdateReceta: (id: string, receta: Partial<Receta>) => void;
  onDeleteReceta: (id: string) => void;
  onAddLog: (action: string, details: string) => void;
}

const RECETA_CATEGORIES: RecetaCategory[] = ['Pizzas', 'Entradas', 'Salsas', 'Postres', 'Otros'];

export default function RecetasScreen({
  recetas,
  insumos,
  user,
  onAddReceta,
  onUpdateReceta,
  onDeleteReceta,
  onAddLog
}: RecetasScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Receta | null>(recetas[0] || null);

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RecetaCategory>('Pizzas');
  const [description, setDescription] = useState('');
  const [portions, setPortions] = useState<number>(1);
  const [prepTime, setPrepTime] = useState<number>(15);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [formIngredients, setFormIngredients] = useState<Omit<RecetaIngrediente, 'unit' | 'name'>[]>([]);

  // Helpers for temporary recipe ingredients selection inside modal
  const [tempInsumoId, setTempInsumoId] = useState('');
  const [tempQuantity, setTempQuantity] = useState<number>(0);

  // Alert toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper: Calculate total raw food cost of a recipe
  const calculateFoodCost = (recipe: Receta) => {
    return recipe.ingredients.reduce((acc, ing) => {
      const ins = insumos.find((i) => i.id === ing.insumoId);
      const costPerUnit = ins ? ins.unitCost : 0;
      return acc + (ing.quantity * costPerUnit);
    }, 0);
  };

  const handleOpenAdd = () => {
    if (user.role !== 'JEFE') {
      triggerToast('error', 'Permiso denegado: Solo el Jefe de Cocina puede registrar nuevas recetas secretas.');
      return;
    }
    setEditingId(null);
    setName('');
    setCategory('Pizzas');
    setDescription('');
    setPortions(1);
    setPrepTime(15);
    setSalePrice(0);
    setFormIngredients([]);
    setTempInsumoId(insumos[0]?.id || '');
    setTempQuantity(0);
    setShowFormModal(true);
  };

  const handleOpenEdit = (receta: Receta) => {
    if (user.role !== 'JEFE') {
      triggerToast('error', 'Permiso denegado: Solo el Jefe de Cocina puede modificar recetas.');
      return;
    }
    setEditingId(receta.id);
    setName(receta.name);
    setCategory(receta.category);
    setDescription(receta.description);
    setPortions(receta.portions);
    setPrepTime(receta.prepTime);
    setSalePrice(receta.salePrice);
    
    // Map with only required values for form mapping
    setFormIngredients(
      receta.ingredients.map((ing) => ({
        insumoId: ing.insumoId,
        quantity: ing.quantity
      }))
    );
    setTempInsumoId(insumos[0]?.id || '');
    setTempQuantity(0);
    setShowFormModal(true);
  };

  const handleAddTempIngredient = () => {
    if (!tempInsumoId) {
      triggerToast('error', 'Seleccione un insumo válido.');
      return;
    }
    if (tempQuantity <= 0) {
      triggerToast('error', 'La cantidad del ingrediente debe ser mayor que 0.');
      return;
    }

    // Check if food already added in form
    const exists = formIngredients.find((fi) => fi.insumoId === tempInsumoId);
    if (exists) {
      triggerToast('error', 'Este insumo ya está listado en la receta. Modifícalo o elimínalo primero.');
      return;
    }

    setFormIngredients([...formIngredients, { insumoId: tempInsumoId, quantity: tempQuantity }]);
    setTempQuantity(0);
  };

  const handleRemoveFormIngredient = (iiId: string) => {
    setFormIngredients(formIngredients.filter((fi) => fi.insumoId !== iiId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      triggerToast('error', 'El nombre de la receta es obligatorio.');
      return;
    }
    if (formIngredients.length === 0) {
      triggerToast('error', 'La receta debe poseer al menos 1 ingrediente de masa o relleno.');
      return;
    }
    if (salePrice < 0 || portions <= 0 || prepTime <= 0) {
      triggerToast('error', 'Revisa los valores numéricos de rendimiento.');
      return;
    }

    // Map form items back to complete ingredients object with unit & name
    const completeIngredients: RecetaIngrediente[] = formIngredients.map((fi) => {
      const ins = insumos.find((i) => i.id === fi.insumoId);
      return {
        insumoId: fi.insumoId,
        name: ins ? ins.name : 'Insumo Eliminado',
        quantity: fi.quantity,
        unit: ins ? ins.unit : 'un'
      };
    });

    if (editingId) {
      onUpdateReceta(editingId, {
        name: name.trim(),
        category,
        description: description.trim(),
        portions,
        prepTime,
        salePrice,
        ingredients: completeIngredients
      });
      onAddLog('Recetario Modificado', `Se actualizó la fórmula o costo de: ${name.trim()}`);
      triggerToast('success', `Receta "${name.trim()}" actualizada exitosamente.`);
    } else {
      onAddReceta({
        name: name.trim(),
        category,
        description: description.trim(),
        portions,
        prepTime,
        salePrice,
        ingredients: completeIngredients
      });
      onAddLog('Recetaria Creada', `Fórmula nueva guardada en la carta: ${name.trim()}`);
      triggerToast('success', `Receta de "${name.trim()}" agregada con éxito.`);
    }

    setShowFormModal(false);
  };

  const handleDelete = (recipe: Receta, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details selection change card
    
    if (user.role !== 'JEFE') {
      triggerToast('error', 'Permiso denegado: Solo el Jefe de Cocina puede descontinuar recetas.');
      onAddLog('Permiso Denegado', `Empleado intentó dar de baja la receta ${recipe.name}`);
      return;
    }

    if (confirm(`¿Estás seguro de que deseas descontinuar y eliminar permanentemente la receta: "${recipe.name}"?`)) {
      onDeleteReceta(recipe.id);
      onAddLog('Receta Descontinuada', `Removió receta de la carta: ${recipe.name}`);
      triggerToast('success', `Receta "${recipe.name}" eliminada.`);
      setSelectedRecipeDetail(null);
    }
  };

  // Filter list
  const filteredRecetas = recetas.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                          r.description.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatCLP = (v: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(v);
  };

  return (
    <div className="space-y-6">

      {/* Alarm Toasts */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} className="text-green-650" /> : <AlertTriangle size={20} className="text-red-650" />}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Header controls box */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm text-gray-800">
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Fórmulas Gastronómicas Dinámicas</h3>
          <p className="text-xs text-gray-505 mt-0.5">
            Vincula tus recetas directamente a los insumos de bodega. Al variar el precio de proveedor, el costo Food-Cost se estima instantáneamente.
          </p>
        </div>
        {user.role === 'JEFE' && (
          <button
            id="btn-add-receta"
            onClick={handleOpenAdd}
            className="bg-[#B22222] hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg inline-flex items-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            <Plus size={16} />
            Crear Receta
          </button>
        )}
      </div>

      {/* Double column wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-gray-800">
        
        {/* Left Column: List of recipes */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-3 rounded-xl border border-[#E0E0E0] flex flex-col sm:flex-row gap-2 shadow-sm">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre de pizza o masa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#E0E0E0] text-gray-900 pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-[#E0E0E0] text-gray-905 px-2 py-1.5 rounded-lg text-xs focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
            >
              <option value="all">Todas las Categorías</option>
              {RECETA_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredRecetas.length === 0 ? (
              <p className="text-xs text-gray-400 font-mono text-center py-10 bg-white rounded-lg border border-[#E0E0E0] shadow-sm">
                No hay recetas que coincidan con los filtros.
              </p>
            ) : (
              filteredRecetas.map((r) => {
                const cost = calculateFoodCost(r);
                const foodCostRatio = r.salePrice > 0 ? (cost / r.salePrice) * 100 : 0;
                const isWarningRatio = foodCostRatio > 35; // Standard restaurants aim for <35% food cost ratio!
                const isSelected = selectedRecipeDetail?.id === r.id;

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecipeDetail(r)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#B22222]/5 border-[#B22222] ring-1 ring-[#B22222]/20 shadow-md'
                        : 'bg-white border-[#E0E0E0] hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <span className="text-[9px] font-mono font-bold bg-gray-100 border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                          {r.category}
                        </span>
                        <h4 className="text-sm font-bold text-[#1A1A1A] mt-1.5">{r.name}</h4>
                      </div>
                      <ChevronRight size={16} className={`text-gray-400 transition-transform ${isSelected ? 'translate-x-1 text-[#B22222]' : ''}`} />
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.description}</p>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 text-[11px] font-mono">
                      <div>
                        <span className="text-gray-400 block whitespace-nowrap">Costo Materia Prima:</span>
                        <strong className="block text-[#1A1A1A] font-bold">{formatCLP(cost)}</strong>
                      </div>

                      <div className="text-right">
                        <span className="text-gray-450 block whitespace-nowrap">Precio Sugerido:</span>
                        <strong className="block text-[#B22222] font-semibold">{formatCLP(r.salePrice)}</strong>
                      </div>
                      
                      <div>
                        <span className="text-gray-400 block whitespace-nowrap font-mono">Food Cost Ratio:</span>
                        <span className={`block font-bold ${isWarningRatio ? 'text-yellow-650' : 'text-green-650'}`}>
                          {foodCostRatio.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Recipe Details Card */}
        <div className="lg:col-span-6">
          {selectedRecipeDetail ? (
            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Header Title & Controls */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] bg-[#B22222]/10 border border-[#B22222]/20 text-[#B22222] px-2 py-0.5 rounded font-mono font-bold uppercase">
                    {selectedRecipeDetail.category}
                  </span>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mt-2 uppercase tracking-wide">
                    {selectedRecipeDetail.name}
                  </h3>
                </div>
                {user.role === 'JEFE' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(selectedRecipeDetail)}
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 rounded transition-colors cursor-pointer"
                      title="Editar Receta"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(selectedRecipeDetail, e)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded transition-colors cursor-pointer"
                      title="Dar de baja receta"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed italic bg-gray-50 p-3 rounded-lg border border-gray-150">
                "{selectedRecipeDetail.description}"
              </p>

              {/* Cooking Params */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-xl border border-gray-150">
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-[#B22222] shrink-0" />
                  <div>
                    <span className="text-[9px] text-[#666666] font-mono block uppercase">Tiempo de Prep</span>
                    <strong className="text-gray-900 font-bold">{selectedRecipeDetail.prepTime} minutos</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <ChefHat size={16} className="text-[#B22222] shrink-0" />
                  <div>
                    <span className="text-[9px] text-[#666666] font-mono block uppercase">Rendimiento</span>
                    <strong className="text-gray-900 font-bold">{selectedRecipeDetail.portions} {selectedRecipeDetail.portions === 1 ? 'Porción' : 'Porciones'}</strong>
                  </div>
                </div>
              </div>

              {/* Ingredient table / cost breakdown */}
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono mb-2.5 flex items-center gap-1.5">
                  <UtensilsCrossed size={14} className="text-[#B22222]" />
                  Desglose de Ingredientes
                </h4>
                
                <div className="overflow-hidden border border-[#E0E0E0] rounded-xl text-[11px] shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-[#E0E0E0] text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                        <th className="py-2.5 px-3">Insumo</th>
                        <th className="py-2.5 px-3 text-right">Cant. Requerida</th>
                        <th className="py-2.5 px-3 text-right">Costo unit.</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {selectedRecipeDetail.ingredients.map((ing) => {
                        const matchedInsumo = insumos.find((i) => i.id === ing.insumoId);
                        const costUnitVal = matchedInsumo ? matchedInsumo.unitCost : 0;
                        const subTotal = costUnitVal * ing.quantity;

                        return (
                          <tr key={ing.insumoId} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2 px-3 text-gray-950 font-bold text-xs">{ing.name}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-gray-700">
                              {ing.quantity} {ing.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-gray-400">
                              {formatCLP(costUnitVal)}/{ing.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-black text-gray-900">
                              {formatCLP(subTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* Totals Summary */}
                  <div className="bg-gray-50 p-3 text-xs flex justify-between items-center border-t border-[#E0E0E0]">
                    <span className="text-gray-500 font-bold font-mono text-[10px] uppercase">Margen Teórico de Materia Prima:</span>
                    <div>
                      <span className="font-mono text-gray-700 tracking-tight block">
                        Costo: {formatCLP(calculateFoodCost(selectedRecipeDetail))}
                      </span>
                      <span className="font-mono text-green-850 font-bold block">
                        Utilidad: {formatCLP(selectedRecipeDetail.salePrice - calculateFoodCost(selectedRecipeDetail))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Cost Margin Ratio Warning Box */}
              {(() => {
                const cost = calculateFoodCost(selectedRecipeDetail);
                const ratio = selectedRecipeDetail.salePrice > 0 ? (cost / selectedRecipeDetail.salePrice) * 100 : 0;
                const isUnderLimit = ratio <= 35;

                return (
                  <div className={`p-3.5 rounded-xl border ${
                    isUnderLimit 
                      ? 'bg-green-50 border-green-200 text-green-900 shadow-sm' 
                      : 'bg-yellow-50 border-yellow-200 text-yellow-905 shadow-sm'
                  } flex items-start gap-2.5 text-xs`}>
                    {isUnderLimit ? (
                      <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5 animate-none" />
                    ) : (
                      <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5 animate-none" />
                    )}
                    <div>
                      <p className="font-bold uppercase tracking-wide text-[10px] font-mono leading-none mb-1">
                        {isUnderLimit ? '✅ Margen Comercial Saludable' : '⚠️ Alerta de Rentabilidad (Food Cost Alto)'}
                      </p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {isUnderLimit 
                          ? `El costo de materias primas representa el ${ratio.toFixed(1)}% del precio neto de carta (Ideal: <35%). Apto para menú diario.`
                          : `El costo representa el ${ratio.toFixed(1)}% del precio. Recomendamos subir el precio de venta a ${formatCLP(cost * 3)} o alternar ingredientes.`
                        }
                      </p>
                    </div>
                  </div>
                );
              })()}

            </div>
          ) : (
            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-12 text-center text-gray-400 font-mono text-xs shadow-sm shadow-black/5">
              👈 Selecciona una receta del listado de la izquierda para ver su desglose de insumos y parámetros comerciales.
            </div>
          )}
        </div>

      </div>

      {/* Creation Modal Form */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col text-gray-800">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-[#E0E0E0]">
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                {editingId ? 'Modificar Receta Secreta' : 'Inscribir Receta Secreta'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-gray-550 hover:text-black cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-gray-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Nombre comercial del Plato
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Pizza Caprese Gourmet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Categoría de Carta
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RecetaCategory)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  >
                    {RECETA_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                  Descripción gastronómica (Para menú)
                </label>
                <textarea
                  required
                  placeholder="ej. Delicada base de tomate, bolitas de bocconcini fresco, pesto de orégano y un toque de ajo..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Rendimiento (Porciones)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={portions}
                    onChange={(e) => setPortions(parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                    Tiempo Prep (Minutos)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value) || 15)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                    Precio de venta ($ CLP)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="ej. 11900"
                    value={salePrice || ''}
                    onChange={(e) => setSalePrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>
              </div>

              {/* Sub-form to bind ingredients list */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 shadow-none">
                <h4 className="text-xs font-bold text-[#B22222] font-mono uppercase tracking-wide">
                  Enlazar Ingredientes de Bodega
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-mono uppercase text-[#666666] mb-1">
                      Insumo
                    </label>
                    <select
                      value={tempInsumoId}
                      onChange={(e) => setTempInsumoId(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#B22222]"
                    >
                      <option value="" disabled>Selecciona supply</option>
                      {insumos.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.unit}) — [${i.unitCost}/{i.unit}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-mono uppercase text-[#666666] mb-1">
                      Cant. para la receta
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      placeholder="ej. 0.25 (250g)"
                      value={tempQuantity || ''}
                      onChange={(e) => setTempQuantity(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 text-gray-900 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#B22222]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTempIngredient}
                    className="sm:col-span-2 bg-[#B22222] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wide py-2.5 rounded transition-colors inline-flex justify-center items-center cursor-pointer shadow-sm"
                  >
                    Agregar
                  </button>
                </div>

                {/* Listing added temporary ingredients */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-[9px] font-mono text-gray-450 uppercase">
                        <th className="py-1">Nombre Insumo</th>
                        <th className="py-1 text-right">Porción Receta</th>
                        <th className="py-1 text-right">Costo Estimado</th>
                        <th className="py-1 text-center">Remover</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 bg-white">
                      {formIngredients.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-400 font-mono">
                            Aún no se asocian ingredientes a esta receta. Agrega arriba.
                          </td>
                        </tr>
                      ) : (
                        formIngredients.map((fi, idx) => {
                          const matchingInc = insumos.find((i) => i.id === fi.insumoId);
                          const subTotal = (matchingInc?.unitCost || 0) * fi.quantity;
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-1.5 font-bold text-gray-900">
                                {matchingInc ? matchingInc.name : 'Insumo Desconocido'}
                              </td>
                              <td className="py-1.5 text-right font-mono text-gray-700 font-semibold">
                                {fi.quantity} {matchingInc?.unit || 'un'}
                              </td>
                              <td className="py-1.5 text-right font-mono text-[#B22222] font-black">
                                {formatCLP(subTotal)}
                              </td>
                              <td className="py-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFormIngredient(fi.insumoId)}
                                  className="text-red-700 hover:text-red-900 font-mono text-[9px] px-2 py-0.5 rounded bg-red-50 border border-red-200 cursor-pointer"
                                >
                                  Remover
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
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
                  {editingId ? 'Guardar Cambios' : 'Registrar Fórmula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
