/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { loadLocalStorageState, saveLocalStorageState, getInitialState } from './initialData';
import { LocalStorageState, Usuario, Insumo, Proveedor, Receta, MovimientoStock, LogAccion } from './types';

// Screens
import LoginScreen from './components/LoginScreen';
import Sidebar, { ActiveView } from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardScreen from './components/DashboardScreen';
import InventarioScreen from './components/InventarioScreen';
import MovimientosScreen from './components/MovimientosScreen';
import ProveedoresScreen from './components/ProveedoresScreen';
import RecetasScreen from './components/RecetasScreen';
import EstadisticasScreen from './components/EstadisticasScreen';
import UsuariosScreen from './components/UsuariosScreen';
import ConfiguracionScreen from './components/ConfiguracionScreen';

export default function App() {
  const [state, setState] = useState<LocalStorageState>(() => loadLocalStorageState());
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    // Retain logged-in user in session storage if refresh occurs
    try {
      const persistedUser = sessionStorage.getItem('clandestinos_current_user');
      return persistedUser ? JSON.parse(persistedUser) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveLocalStorageState(state);
  }, [state]);

  // Auth Handlers
  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
    sessionStorage.setItem('clandestinos_current_user', JSON.stringify(user));
    
    // Register audit log for login
    handleAddLog('Inicio de Sesión', `El usuario "${user.name}" ingresó con éxito al panel.`, user);
  };

  const handleLogout = () => {
    if (currentUser) {
      handleAddLog('Cierre de Sesión', `El usuario "${currentUser.name}" cerró sesión voluntariamente.`, currentUser);
    }
    setCurrentUser(null);
    sessionStorage.removeItem('clandestinos_current_user');
    setActiveView('dashboard');
  };

  // Helper function to generate audit logs
  const handleAddLog = (action: string, details: string, activeUser = currentUser) => {
    const newLog: LogAccion = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: activeUser ? activeUser.id : 'usr-visitante',
      userName: activeUser ? activeUser.name : 'Visitante Anónimo',
      action,
      details,
      date: new Date().toISOString()
    };

    setState((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs]
    }));
  };

  // INSUMOS CRUD
  const handleAddInsumo = (insumo: Omit<Insumo, 'id' | 'updatedAt'>) => {
    const nextId = `ins-${state.insumos.length + Date.now().toString().slice(-3)}`;
    const newInsumo: Insumo = {
      ...insumo,
      id: nextId,
      updatedAt: new Date().toISOString()
    };

    setState((prev) => ({
      ...prev,
      insumos: [newInsumo, ...prev.insumos]
    }));
  };

  const handleUpdateInsumo = (id: string, updatedFields: Partial<Insumo>) => {
    setState((prev) => ({
      ...prev,
      insumos: prev.insumos.map((item) => 
        item.id === id 
          ? { ...item, ...updatedFields, updatedAt: new Date().toISOString() } 
          : item
      )
    }));
  };

  const handleDeleteInsumo = (id: string) => {
    setState((prev) => ({
      ...prev,
      insumos: prev.insumos.filter((item) => item.id !== id)
    }));
  };

  // MOVIMIENTOS STOCKS (CRITICAL LINK: Alters corresponding supply stock!)
  const handleAddMovimiento = (mov: Omit<MovimientoStock, 'id' | 'date'>): boolean => {
    const nextId = `mov-${state.movimientos.length + Date.now().toString().slice(-3)}`;
    const newMov: MovimientoStock = {
      ...mov,
      id: nextId,
      date: new Date().toISOString()
    };

    // Calculate stock alteration trigger
    let isSuccess = false;

    setState((prev) => {
      // Find corresponding insumo to alter stock
      const updatedInsumos = prev.insumos.map((item) => {
        if (item.id === mov.insumoId) {
          const delta = mov.type === 'entrada' ? mov.quantity : -mov.quantity;
          const targetStock = item.stock + delta;
          
          if (targetStock < 0) {
            // Cannot deduct and reach negative stock
            return item;
          }
          isSuccess = true;
          return {
            ...item,
            stock: targetStock,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });

      if (!isSuccess) {
        return prev; // No alteration, return original state
      }

      // Log success audit
      const details = `Se registró ${mov.type === 'entrada' ? 'entrada' : 'salida'} de ${mov.quantity} ${mov.unit} para ${mov.insumoName} por: ${mov.reason}. Observaciones: ${mov.notes || 'ninguna'}`;
      
      const newLogVal: LogAccion = {
        id: `log-${Date.now()}`,
        userId: currentUser ? currentUser.id : 'usr-desconocido',
        userName: currentUser ? currentUser.name : 'Sistema',
        action: 'Ajuste de Stock',
        details,
        date: new Date().toISOString()
      };

      return {
        ...prev,
        insumos: updatedInsumos,
        movimientos: [newMov, ...prev.movimientos],
        logs: [newLogVal, ...prev.logs]
      };
    });

    return true; // We perform state update with guards inside the component anyway
  };

  // PROVEEDORES CRUD
  const handleAddProveedor = (prov: Omit<Proveedor, 'id'>) => {
    const nextId = `prov-${state.proveedores.length + 1}`;
    const newProv: Proveedor = {
      ...prov,
      id: nextId
    };

    setState((prev) => ({
      ...prev,
      proveedores: [...prev.proveedores, newProv]
    }));
  };

  const handleUpdateProveedor = (id: string, updatedFields: Partial<Proveedor>) => {
    setState((prev) => ({
      ...prev,
      proveedores: prev.proveedores.map((p) => 
        p.id === id ? { ...p, ...updatedFields } : p
      )
    }));
  };

  const handleDeleteProveedor = (id: string) => {
    setState((prev) => ({
      ...prev,
      proveedores: prev.proveedores.filter((p) => p.id !== id)
    }));
  };

  // RECETAS CRUD
  const handleAddReceta = (recipe: Omit<Receta, 'id'>) => {
    const nextId = `rec-${state.recetas.length + 1}`;
    const newRecipe: Receta = {
      ...recipe,
      id: nextId
    };

    setState((prev) => ({
      ...prev,
      recetas: [...prev.recetas, newRecipe]
    }));
  };

  const handleUpdateReceta = (id: string, updatedFields: Partial<Receta>) => {
    setState((prev) => ({
      ...prev,
      recetas: prev.recetas.map((r) => 
        r.id === id ? { ...r, ...updatedFields } : r
      )
    }));
  };

  const handleDeleteReceta = (id: string) => {
    setState((prev) => ({
      ...prev,
      recetas: prev.recetas.filter((r) => r.id !== id)
    }));
  };

  // USUARIOS CRUD
  const handleAddUsuario = (userFields: Omit<Usuario, 'id' | 'createdAt'>) => {
    const nextId = `usr-${state.usuarios.length + 1}`;
    const newUsr: Usuario = {
      ...userFields,
      id: nextId,
      createdAt: new Date().toISOString()
    };

    setState((prev) => ({
      ...prev,
      usuarios: [...prev.usuarios, newUsr]
    }));
  };

  const handleUpdateUsuario = (id: string, updatedFields: Partial<Usuario>) => {
    setState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.map((u) => 
        u.id === id ? { ...u, ...updatedFields } : u
      )
    }));
  };

  const handleDeleteUsuario = (id: string) => {
    setState((prev) => ({
      ...prev,
      usuarios: prev.usuarios.filter((u) => u.id !== id)
    }));
  };

  // CONFIGURATION UPDATE
  const handleUpdateConfig = (newConfig: any) => {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ...newConfig
      }
    }));
  };

  // RESET FACTORY SEED DATA
  const handleResetDatabase = () => {
    localStorage.removeItem('clandestinos_pizza_state');
    sessionStorage.removeItem('clandestinos_current_user');
    const freshState = getInitialState();
    setState(freshState);
  };

  // Quick Action Switcher 
  const handleQuickMovementClick = () => {
    setActiveView('movimientos');
  };

  // Gating View Logic
  if (!currentUser) {
    return (
      <LoginScreen 
        usuarios={state.usuarios} 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  // Renders correct active screen body
  const renderActiveScreen = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardScreen 
            insumos={state.insumos}
            movimientos={state.movimientos}
            proveedores={state.proveedores}
            recetas={state.recetas}
            usuarios={state.usuarios}
            setActiveView={setActiveView}
            user={currentUser}
          />
        );
      case 'inventario':
        return (
          <InventarioScreen 
            insumos={state.insumos}
            proveedores={state.proveedores}
            user={currentUser}
            onAddInsumo={handleAddInsumo}
            onUpdateInsumo={handleUpdateInsumo}
            onDeleteInsumo={handleDeleteInsumo}
            onAddLog={(action, details) => handleAddLog(action, details)}
          />
        );
      case 'movimientos':
        return (
          <MovimientosScreen 
            movimientos={state.movimientos}
            insumos={state.insumos}
            user={currentUser}
            onAddMovimiento={handleAddMovimiento}
          />
        );
      case 'proveedores':
        return (
          <ProveedoresScreen 
            proveedores={state.proveedores}
            user={currentUser}
            onAddProveedor={handleAddProveedor}
            onUpdateProveedor={handleUpdateProveedor}
            onDeleteProveedor={handleDeleteProveedor}
            onAddLog={(action, details) => handleAddLog(action, details)}
          />
        );
      case 'recetas':
        return (
          <RecetasScreen 
            recetas={state.recetas}
            insumos={state.insumos}
            user={currentUser}
            onAddReceta={handleAddReceta}
            onUpdateReceta={handleUpdateReceta}
            onDeleteReceta={handleDeleteReceta}
            onAddLog={(action, details) => handleAddLog(action, details)}
          />
        );
      case 'estadisticas':
        return (
          <EstadisticasScreen 
            insumos={state.insumos}
            movimientos={state.movimientos}
            proveedores={state.proveedores}
            recetas={state.recetas}
            logs={state.logs}
          />
        );
      case 'usuarios':
        return (
          <UsuariosScreen 
            usuarios={state.usuarios}
            user={currentUser}
            onAddUsuario={handleAddUsuario}
            onUpdateUsuario={handleUpdateUsuario}
            onDeleteUsuario={handleDeleteUsuario}
            onAddLog={(action, details) => handleAddLog(action, details)}
          />
        );
      case 'configuracion':
        return (
          <ConfiguracionScreen 
            config={state.config}
            onUpdateConfig={handleUpdateConfig}
            onResetDatabase={handleResetDatabase}
            user={currentUser}
            onAddLog={(action, details) => handleAddLog(action, details)}
          />
        );
      default:
        return <div className="text-white">Sección No Encontrada</div>;
    }
  };

  return (
    <div id="pizzeria-management-app" className="flex h-screen bg-[#F5F5F5] overflow-hidden text-[#1A1A1A] antialiased font-sans">
      
      {/* Side navigation */}
      <Sidebar 
        user={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main structural area wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar header panel */}
        <Navbar 
          user={currentUser}
          activeView={activeView}
          insumosList={state.insumos}
          setSidebarOpen={setSidebarOpen}
          onQuickMovementClick={handleQuickMovementClick}
        />

        {/* Dynamic Screen View viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F5F5F5]">
          <div className="w-full max-w-7xl mx-auto space-y-6">
            {renderActiveScreen()}
          </div>
        </main>
      </div>
    </div>
  );
}
