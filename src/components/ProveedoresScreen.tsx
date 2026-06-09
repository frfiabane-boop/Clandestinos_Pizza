/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Proveedor, Usuario } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';

interface ProveedoresScreenProps {
  proveedores: Proveedor[];
  user: Usuario;
  onAddProveedor: (prov: Omit<Proveedor, 'id'>) => void;
  onUpdateProveedor: (id: string, prov: Partial<Proveedor>) => void;
  onDeleteProveedor: (id: string) => void;
  onAddLog: (action: string, details: string) => void;
}

export default function ProveedoresScreen({
  proveedores,
  user,
  onAddProveedor,
  onUpdateProveedor,
  onDeleteProveedor,
  onAddLog
}: ProveedoresScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'activo' | 'inactivo'>('activo');

  // Toasts
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setCategory('Quesos y Cremas');
    setAddress('');
    setStatus('activo');
    setShowFormModal(true);
  };

  const handleOpenEdit = (p: Proveedor) => {
    setEditingId(p.id);
    setName(p.name);
    setContactName(p.contactName);
    setPhone(p.phone);
    setEmail(p.email);
    setCategory(p.category);
    setAddress(p.address);
    setStatus(p.status);
    setShowFormModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !contactName.trim() || !email.trim()) {
      triggerToast('error', 'Nombre, contacto y correo electrónico son requeridos.');
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerToast('error', 'Formato de correo electrónico inválido.');
      return;
    }

    if (editingId) {
      onUpdateProveedor(editingId, {
        name: name.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        category,
        address: address.trim(),
        status
      });
      onAddLog('Modificación de Proveedor', `Se alteraron datos de distribuidor: ${name.trim()}`);
      triggerToast('success', `Distribuidor "${name.trim()}" modificado.`);
    } else {
      onAddProveedor({
        name: name.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        category,
        address: address.trim(),
        status
      });
      onAddLog('Creación de Proveedor', `Agregó nuevo distribuidor: ${name.trim()}`);
      triggerToast('success', `Distribuidor "${name.trim()}" creado.`);
    }

    setShowFormModal(false);
  };

  const handleDelete = (p: Proveedor) => {
    if (user.role !== 'JEFE') {
      triggerToast('error', 'Permiso denegado: Solo el Jefe de Cocina puede eliminar proveedores del directorio.');
      onAddLog('Permiso Denegado', `Empleado intentó borrar proveedor ${p.name}`);
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar a: "${p.name}"? Esto podría desligar sus insumos asociados.`)) {
      onDeleteProveedor(p.id);
      onAddLog('Eliminación de Proveedor', `Eliminó proveedor: ${p.name}`);
      triggerToast('success', `Se removió a "${p.name}" exitosamente.`);
    }
  };

  // Filter lists
  const filteredProveedores = proveedores.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                          p.contactName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                          p.email.toLowerCase().includes(searchTerm.toLowerCase().trim());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">

      {/* Floating alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
          toast.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-900 shadow-lg' 
            : 'bg-red-50 border-red-200 text-red-900 shadow-lg'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} className="text-green-650" /> : <AlertTriangle size={20} className="text-red-650" />}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Intro info box */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm text-gray-800">
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Registro de Distribuidores Aliados</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Mantén actualizada la libreta de contacto de los responsables de suministrarnos harina, embutidos y cajas kraft.
          </p>
        </div>
        
        <button
          id="btn-add-proveedor"
          onClick={handleOpenAdd}
          className="bg-[#B22222] hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg inline-flex items-center gap-2 transition-colors shadow-md cursor-pointer animate-none"
        >
          <Plus size={16} />
          Nuevo Proveedor
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-4 text-gray-800">
        {/* Search */}
        <div className="sm:col-span-8 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar por distribuidora, jefe de ventas, insumos, correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E0E0E0] text-gray-900 pl-9 pr-4 py-2 rounded-lg text-xs placeholder-gray-500 focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-4 relative flex items-center gap-2">
          <label className="text-[10px] font-mono uppercase text-[#666666] whitespace-nowrap">Estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-white border border-[#E0E0E0] text-gray-900 px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
          >
            <option value="all">Ver Todos</option>
            <option value="activo">Solo Activos (Vigentes)</option>
            <option value="inactivo">Inactivos / Pausados</option>
          </select>
        </div>
      </div>

      {/* Grid of Providers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProveedores.length === 0 ? (
          <div className="col-span-12 bg-white border border-[#E0E0E0] p-12 text-center text-gray-400 font-mono rounded-xl shadow-sm">
            No se encontraron distribuidores correspondientes a este criterio.
          </div>
        ) : (
          filteredProveedores.map((p) => {
            const isActive = p.status === 'activo';
            return (
              <div 
                key={p.id} 
                className="bg-white border border-[#E0E0E0] hover:border-[#B22222]/40 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group relative text-gray-800"
              >
                {/* Active Indicator tag */}
                <div className="absolute top-4 right-4 flex items-center">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                    isActive 
                      ? 'bg-green-100 border border-green-200 text-green-800' 
                      : 'bg-gray-100 border border-gray-200 text-gray-505'
                  }`}>
                    {isActive ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Title Name & Segment */}
                  <div>
                    <span className="text-[9px] font-mono bg-[#B22222]/10 border border-[#B22222]/20 text-[#B22222] px-2 py-0.5 rounded uppercase font-bold">
                      {p.category}
                    </span>
                    <h4 className="text-base font-bold text-[#1A1A1A] mt-2 group-hover:text-[#B22222] transition-colors uppercase leading-tight font-sans">
                      {p.name}
                    </h4>
                  </div>

                  {/* Contact Fields list */}
                  <div className="space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-700">
                    <div className="flex items-center gap-2.5">
                      <User size={14} className="text-gray-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 block font-light">Jefe de Pedidos</span>
                        <span className="font-semibold text-gray-900">{p.contactName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone size={14} className="text-gray-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-gray-400 block font-light">Contacto Telefónico</span>
                        <a href={`tel:${p.phone}`} className="font-mono text-xs hover:underline text-gray-600 hover:text-[#B22222]">
                          {p.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Mail size={14} className="text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block font-light">Correo Comercial</span>
                        <a href={`mailto:${p.email}`} className="text-xs hover:underline text-gray-650 truncate block max-w-[200px]" title={p.email}>
                          {p.email}
                        </a>
                      </div>
                    </div>

                    {p.address && (
                      <div className="flex items-center gap-2.5 pt-1.5 border-t border-gray-100">
                        <MapPin size={14} className="text-[#B22222] shrink-0" />
                        <span className="text-[10px] text-gray-500 truncate" title={p.address}>
                          {p.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer buttons */}
                <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 mt-4">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-semibold text-xs rounded transition-colors inline-flex items-center gap-1 border border-gray-200 cursor-pointer"
                  >
                    <Edit2 size={11} />
                    Modificar
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded transition-colors inline-flex items-center gap-1 border border-red-200 cursor-pointer"
                  >
                    <Trash2 size={11} />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Creation Modal form */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4 text-gray-800">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-[#E0E0E0]">
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                {editingId ? 'Editar Parámetros Fabricante' : 'Inscribir Nuevo Fabricante'}
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
                  Razón Social / Distribuidor
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Saborizantes e Harinas del Pacífico Ltda."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Nombre del Ejecutivo de Ventas
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Carlos Sotomayor"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Giro Principal / Rubro
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  >
                    <option value="Quesos y Cremas">Quesos y Cremas</option>
                    <option value="Harinas y Masas">Harinas y Masas</option>
                    <option value="Salsas y Vegetales">Salsas y Vegetales</option>
                    <option value="Carnes e Insumos Secos">Carnes e Insumos Secos</option>
                    <option value="Embalajes">Embalajes y Cajas</option>
                    <option value="Otros">Otros insumos varios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                    Teléfono comercial
                  </label>
                  <input
                    type="tel"
                    placeholder="ej. +56 9 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Email de Pedidos
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ventas@molino.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                  Dirección Física / Local despacho
                </label>
                <input
                  type="text"
                  placeholder="ej. Av. Presidente Kennedy 4500, Santiago"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                  Estado General
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                >
                  <option value="activo">Activo (Garantiza compra directa)</option>
                  <option value="inactivo">Inactivo / Relación Suspendida</option>
                </select>
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
                  {editingId ? 'Guardar Cambios' : 'Registrar Distribuidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
