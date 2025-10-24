'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Home, Search, PlusCircle, MessageSquare, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, toggleChat } = useAppStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Casa Fácil</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/dashboard')}`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                <Link 
                  href="/properties" 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/properties')}`}
                >
                  <Search className="w-5 h-5" />
                  <span>Buscar</span>
                </Link>

                {user.role === 'arrendador' && (
                  <Link 
                    href="/properties/new" 
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/properties/new')}`}
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Publicar</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/admin')}`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  onClick={toggleChat}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat IA</span>
                </button>

                {/* User Menu */}
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/properties" 
                  className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Explorar propiedades
                </Link>
                <Link 
                  href="/login" 
                  className="btn-primary"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            {user ? (
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 rounded-lg"
              >
                <LogOut className="w-6 h-6" />
              </button>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
