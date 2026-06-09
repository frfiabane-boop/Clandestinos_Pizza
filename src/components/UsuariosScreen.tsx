/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Usuario, UserRole } from '../types';
import { 
  Users, 
  Plus, 
  Edit2, 
  Lock, 
  Trash2, 
  UserPlus, 
  ShieldAlert, 
  CheckCircle, 
  X, 
  AlertTriangle 
} from 'lucide-react';

interface UsuariosScreenProps {
  usuarios: Usuario[];
  user: Usuario;
  onAddUsuario: (usuario: Omit<Usuario, 'id' | 'createdAt'>) => void;
  onUpdateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  onDeleteUsuario: (id: string) => void;
  onAddLog: (action: string, details: string) => void;
}

export default function UsuariosScreen({
  usuarios,
  user,
  onAddUsuario,
  onUpdateUsuario,
  onDeleteUsuario,
  onAddLog
}: UsuariosScreenProps) {
  
  // Guard clause against unauthorized users
  if (user.role !== 'JEFE') {
    return (
      <div className="bg-white border border-[#E0E0E0] p-8 rounded-xl text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm text-gray-800">
        <ShieldAlert size={48} className="text-[#B22222] mx-auto animate-bounce" />
        <h3 className="text-lg font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Permiso Insuficiente</h3>
        <p className="text-xs text-gray-500">
          La administración del personal o cambio de perfiles está estrictamente reservada para el <strong>Jefe de Cocina (JEFE)</strong>.
        </p>
      </div>
    );
  }

  // State management
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLEADO');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'activo' | 'inactivo'>('activo');

  // Toasts
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setUsername('');
    setPassword('');
    setName('');
    setRole('EMPLEADO');
    setEmail('');
    setStatus('activo');
    setShowFormModal(true);
  };

  const handleOpenEdit = (usr: Usuario) => {
    setEditingId(usr.id);
    setUsername(usr.username);
    setPassword(usr.password || '');
    setName(usr.name);
    setRole(usr.role);
    setEmail(usr.email);
    setStatus(usr.status);
    setShowFormModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !name.trim() || !email.trim()) {
      triggerToast('error', 'El nombre, cuenta de usuario y email son obligatorios.');
      return;
    }

    if (!editingId && !password.trim()) {
      triggerToast('error', 'Debes establecer una contraseña secreta inicial para el nuevo usuario.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerToast('error', 'Formato de correo electrónico inválido.');
      return;
    }

    if (editingId) {
      onUpdateUsuario(editingId, {
        username: username.toLowerCase().trim(),
        password: password.trim() ? password.trim() : undefined,
        name: name.trim(),
        role,
        email: email.trim().toLowerCase(),
        status
      });
      onAddLog('Modificación de Control de Acceso', `Alteró cuenta corporativa del usuario: ${username.trim()}`);
      triggerToast('success', `Cuenta de "${username.trim()}" actualizada exitosamente.`);
    } else {
      onAddUsuario({
        username: username.toLowerCase().trim(),
        password: password.trim(),
        name: name.trim(),
        role,
        email: email.trim().toLowerCase(),
        status
      });
      onAddLog('Alta de Usuario', `Inscribió nueva cuenta de personal: ${username.trim()}`);
      triggerToast('success', `Usuario "${username.trim()}" creado correctamente.`);
    }

    setShowFormModal(false);
  };

  const handleDelete = (usr: Usuario) => {
    if (usr.id === user.id) {
      triggerToast('error', 'Operación Bloqueada: No puedes eliminar tu propia cuenta jefe activa.');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas revocar y borrar permanentemente la cuenta de "${usr.name}"?`)) {
      onDeleteUsuario(usr.id);
      onAddLog('Baja de Usuario', `Se eliminó cuenta de: ${usr.username}`);
      triggerToast('success', `Cuenta de "${usr.username}" eliminada.`);
    }
  };

  return (
    <div className="space-y-6">

      {/* Alarm toasts */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900 border-none'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} className="text-green-650" /> : <AlertTriangle size={20} className="text-red-650" />}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Title description box */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm text-gray-800">
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">Control de Personal & Roles Gastronómicos</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Autoriza cuentas para cocineros, pesadores o administradores de almacén. Configura credenciales y roles ('JEFE' o 'EMPLEADO').
          </p>
        </div>
        
        <button
          id="btn-add-usuario"
          onClick={handleOpenAdd}
          className="bg-[#B22222] hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg inline-flex items-center gap-2 transition-colors shadow-md cursor-pointer"
        >
          <UserPlus size={16} />
          Nuevo Operador
        </button>
      </div>

      {/* Grid of Users table */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden shadow-sm text-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E0E0E0] text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Usuario de Login</th>
                <th className="py-3 px-4">Rol en Cocina</th>
                <th className="py-3 px-4">Correo Corporativo</th>
                <th className="py-3 px-4">Fecha Inscripción</th>
                <th className="py-3 px-4">Vigencia</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
              {usuarios.map((usr) => {
                const isActive = usr.status === 'activo';
                return (
                  <tr key={usr.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-[#B22222] border border-gray-200">
                          {usr.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-gray-900 block">{usr.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {usr.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{usr.username}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold leading-tight ${
                        usr.role === 'JEFE'
                          ? 'bg-[#B22222]/15 border border-[#B22222]/35 text-[#B22222]'
                          : 'bg-indigo-100 border border-indigo-200 text-indigo-850'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{usr.email}</td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono">
                      {new Date(usr.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                        isActive
                          ? 'bg-green-105 border border-green-200 text-green-800 bg-green-50'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}>
                        {isActive ? 'HABILITADO' : 'SUSPENDIDO'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-gray-800">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(usr)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded transition-all border border-gray-200 cursor-pointer"
                          title="Cambiar Contraseña o Datos"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          disabled={usr.id === user.id}
                          onClick={() => handleDelete(usr)}
                          className={`p-1.5 rounded transition-all border cursor-pointer ${
                            usr.id === user.id
                              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                              : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                          }`}
                          title="Eliminar Cuenta"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in text-gray-800">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-[#E0E0E0]">
              <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                {editingId ? 'Editar Perfil Operador' : 'Inscribir Nuevo Operador'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-gray-505 hover:text-black cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                  Nombre Completo del Operador
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Juan Pablo Rossi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Cuenta de Usuario (Login)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. jrossi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                    <Lock size={12} className="text-[#B22222]" /> Contraseña
                  </label>
                  <input
                    type="text" // Plain password for ease of simulation view
                    placeholder={editingId ? 'Nueva o deja en blanco' : 'Establece clave inicial'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Rol Asignado
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  >
                    <option value="EMPLEADO">EMPLEADO (Auditor/Movimientos)</option>
                    <option value="JEFE">JEFE (Administrador completo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1">
                    Habilitación de Cuenta
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222]"
                  >
                    <option value="activo">HABILITADO (Acceso normal)</option>
                    <option value="inactivo">SUSPENDIDO (Bloqueo inmediato)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-505 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="juan.rossi@clandestinospizza.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222]"
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
                  {editingId ? 'Guardar Cambios' : 'Registrar Operador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
