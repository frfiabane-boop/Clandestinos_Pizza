/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Usuario } from '../types';
import { 
  Pizza, 
  LayoutDashboard, 
  Boxes, 
  ArrowLeftRight, 
  Users, 
  UserSquare2, 
  UtensilsCrossed, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export type ActiveView = 
  | 'dashboard' 
  | 'inventario' 
  | 'movimientos' 
  | 'proveedores' 
  | 'recetas' 
  | 'estadisticas' 
  | 'usuarios' 
  | 'configuracion';

interface SidebarProps {
  user: Usuario;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ user, activeView, setActiveView, onLogout, isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['JEFE', 'EMPLEADO'] },
    { id: 'inventario', label: 'Inventario de Insumos', icon: Boxes, roles: ['JEFE', 'EMPLEADO'] },
    { id: 'movimientos', label: 'Movimientos de Stock', icon: ArrowLeftRight, roles: ['JEFE', 'EMPLEADO'] },
    { id: 'proveedores', label: 'Proveedores', icon: Users, roles: ['JEFE', 'EMPLEADO'] },
    { id: 'recetas', label: 'Recetas de Cocina', icon: UtensilsCrossed, roles: ['JEFE', 'EMPLEADO'] },
    { id: 'estadisticas', label: 'Estadísticas e Informes', icon: BarChart3, roles: ['JEFE', 'EMPLEADO'] },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: UserSquare2, roles: ['JEFE'] }, // Solo Jefe
    { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['JEFE', 'EMPLEADO'] },
  ];

  const handleNavClick = (viewId: ActiveView) => {
    setActiveView(viewId);
    setIsOpen(false); // Close on mobile navigation selection
  };

  return (
    <>
      {/* Mobile Back-drop overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/35 z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 bg-white text-gray-800 w-64 border-r border-[#E0E0E0] z-50 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E0E0E0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#B22222] flex items-center justify-center shadow-sm">
              <Pizza size={20} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold uppercase text-sm tracking-widest text-[#1A1A1A]">
                Clandestinos <span className="text-[#B22222]">Pizza</span>
              </span>
              <div className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-widest leading-none">
                Est. 2026
              </div>
            </div>
          </div>
          {/* Close button on mobile */}
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-black p-1 rounded hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Badge Context */}
        <div className="p-4 mx-4 my-3 bg-gray-50 rounded-xl border border-gray-150 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#B22222]/10 border border-[#B22222]/20 flex items-center justify-center text-[#B22222] font-mono font-bold text-lg select-none">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#1A1A1A] truncate" title={user.name}>{user.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block rounded-full ${user.role === 'JEFE' ? 'bg-[#B22222]' : 'bg-gray-400'} w-1.5 h-1.5`}></span>
              <span className="text-[10px] font-mono tracking-wider text-gray-450 font-bold uppercase">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const hasPermission = item.roles.includes(user.role);
            if (!hasPermission) return null;

            const IconComp = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleNavClick(item.id as ActiveView)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#B22222] text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-905 hover:bg-gray-50'
                }`}
              >
                <IconComp 
                  size={18} 
                  className={`transition-all ${
                    isActive ? 'scale-110 text-white' : 'text-gray-400 group-hover:text-gray-700'
                  }`} 
                />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-4 rounded-full bg-white ml-auto"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-[#E0E0E0]">
          <button
            id="btn-logout"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-650 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut size={18} className="text-red-655" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
