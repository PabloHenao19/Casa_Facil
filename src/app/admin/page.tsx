'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Users, Home, Search, TrendingUp, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeProperties: 0,
    arrendadores: 0,
    arrendatarios: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Verificar que sea admin
        const userDoc = await getDocs(
          query(collection(db, 'users'), where('uid', '==', user.uid))
        );
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          if (userData.role !== 'admin') {
            router.push('/dashboard');
            return;
          }
        }

        // Obtener estadísticas
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const propertiesSnapshot = await getDocs(collection(db, 'properties'));
        
        const users = usersSnapshot.docs.map(doc => doc.data());
        const properties = propertiesSnapshot.docs.map(doc => doc.data());

        setStats({
          totalUsers: users.length,
          totalProperties: properties.length,
          activeProperties: properties.filter(p => p.available).length,
          arrendadores: users.filter(u => u.role === 'arrendador').length,
          arrendatarios: users.filter(u => u.role === 'arrendatario').length,
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Estadísticas y métricas de la plataforma Casa Fácil
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalUsers}
              </h3>
              <p className="text-gray-600 text-sm">Usuarios totales</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totalProperties}
              </h3>
              <p className="text-gray-600 text-sm">Propiedades publicadas</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.activeProperties}
              </h3>
              <p className="text-gray-600 text-sm">Propiedades activas</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.arrendadores} / {stats.arrendatarios}
              </h3>
              <p className="text-gray-600 text-sm">Arrendadores / Arrendatarios</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button className="btn-primary">
                Gestionar usuarios
              </button>
              <button className="btn-secondary">
                Ver todas las propiedades
              </button>
              <button className="btn-secondary">
                Exportar datos
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
