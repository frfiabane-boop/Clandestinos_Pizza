/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Usuario } from '../types';
import { Pizza, Eye, EyeOff, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  usuarios: Usuario[];
  onLoginSuccess: (user: Usuario) => void;
}

export default function LoginScreen({ usuarios, onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    const foundUser = usuarios.find(
      (u) => 
        u.username.toLowerCase() === username.toLowerCase().trim() && 
        u.password === password
    );

    if (foundUser) {
      if (foundUser.status === 'inactivo') {
        setError('Esta cuenta se encuentra inactiva. Contacta al Jefe de Cocina.');
        return;
      }
      onLoginSuccess(foundUser);
    } else {
      setError('Credenciales inválidas. Revisa el usuario o la contraseña.');
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div id="login-container" className="min-h-screen grid lg:grid-cols-12 bg-[#1A1A1A]">
      {/* Columna Izquierda: Decorativa y Branding */}
      <div className="hidden lg:flex lg:col-span-7 bg-radial from-[#321111] to-[#1A1A1A] relative overflow-hidden items-center justify-center p-12 border-r border-[#333333]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B22222_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="z-10 max-w-lg text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#B22222]/10 border border-[#B22222]/30 text-[#B22222] font-mono text-xs mb-8">
            <Sparkles size={12} className="animate-pulse" />
            Control de Abastecimiento & Masa Madre
          </div>
          <h1 className="text-5xl font-black text-white leading-tight uppercase font-sans tracking-tight">
            Clandestinos <span className="text-[#B22222]">Pizza</span>
          </h1>
          <p className="mt-4 text-gray-400 text-lg leading-relaxed">
            Sistema Profesional de Control Horario, Pesaje, Recetas Secretas e Inventario de Insumos Críticos.
          </p>
          
          <div className="mt-12 space-y-6 border-t border-[#333333] pt-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#B22222]/20 flex items-center justify-center border border-[#B22222]/40">
                <Pizza className="text-[#B22222]" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Integridad de Recetas</h4>
                <p className="text-gray-400 text-sm">Control estricto de mermas y porciones de mozzarella, pepperoni y albahaca.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center border border-gray-700">
                <AlertCircle className="text-yellow-500" />
              </div>
              <div>
                <h4 className="text-white font-semibold flex items-center gap-2"> Alertas Críticas de Stock</h4>
                <p className="text-gray-400 text-sm">Notificaciones visuales inmediatas cuando un insumo cae por debajo del nivel de seguridad.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Adorno abajo en la esquina */}
        <div className="absolute bottom-4 left-4 text-xs font-mono text-gray-500">
          Clandestinos Pizza Inventory v2.5 • Hecho para Gastronomía de Alto Rendimiento
        </div>
      </div>

      {/* Columna Derecha: Formulario de Login */}
      <div className="flex col-span-12 lg:col-span-5 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 bg-[#222222] p-8 rounded-2xl border border-[#333333] shadow-2xl">
          <div className="text-center">
            {/* Logo de Pizza en Círculo Rojo */}
            <div className="inline-flex w-16 h-16 rounded-2xl bg-[#B22222] items-center justify-center shadow-lg shadow-[#B22222]/20 mb-4 animate-bounce">
              <Pizza size={32} className="text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
              Ingresar al Control
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Digita tus credenciales para acceder al backend
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/50 text-red-300 rounded-lg text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5" htmlFor="username">
                Usuario del Sistema
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <User size={18} />
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="ej. jefe o empleado"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#444444] text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5" htmlFor="password">
                Contraseña Secreta
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#444444] text-white rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#B22222] focus:ring-1 focus:ring-[#B22222] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="btn-login"
              type="submit"
              className="w-full bg-[#B22222] text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-lg shadow-red-900/20 text-sm tracking-wider uppercase"
            >
              Iniciar Sesión
            </button>
          </form>

          {/* Credenciales de Acceso Rápido (DEMO TIPS) */}
          <div className="mt-6 border-t border-[#333333] pt-5">
            <h5 className="text-xs font-mono text-gray-400 mb-2.5 text-center uppercase tracking-wide">
              Credenciales de Simulación
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('jefe', '123')}
                className="p-2 bg-[#1A1A1A] hover:bg-[#321111]/40 border border-[#333333] hover:border-[#B22222]/50 text-left rounded-lg group transition-all"
              >
                <div className="font-semibold text-white group-hover:text-[#B22222] transition-colors">Modo Jefe (Admin)</div>
                <div className="text-gray-500 font-mono mt-0.5">jefe / 123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('empleado', '123')}
                className="p-2 bg-[#1A1A1A] hover:bg-[#321111]/40 border border-[#333333] hover:border-[#B22222]/50 text-left rounded-lg group transition-all"
              >
                <div className="font-semibold text-white group-hover:text-[#B22222] transition-colors">Modo Empleado</div>
                <div className="text-gray-500 font-mono mt-0.5">empleado / 123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
