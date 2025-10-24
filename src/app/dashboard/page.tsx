'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ChatAssistant from '@/components/ChatAssistant';
import PropertyCard from '@/components/PropertyCard';
import { useAppStore } from '@/store/useAppStore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Property } from '@/types';
import { Home, PlusCircle, Search, TrendingUp, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser, properties, setProperties } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      try {
        // Obtener datos del usuario
        const userDoc = await getDocs(
          query(collection(db, 'users'), where('uid', '==', firebaseUser.uid))
        );
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          setUser(userData as any);

          // Si es arrendador, cargar sus propiedades
          if (userData.role === 'arrendador') {
            const propertiesQuery = query(
              collection(db, 'properties'),
              where('ownerId', '==', firebaseUser.uid),
              orderBy('createdAt', 'desc')
            );
            const propertiesSnapshot = await getDocs(propertiesQuery);
            const userProps = propertiesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Property[];
            setUserProperties(userProps);
          }

          // Cargar propiedades recientes para todos
          const recentQuery = query(
            collection(db, 'properties'),
            where('available', '==', true),
            orderBy('createdAt', 'desc'),
            limit(6)
          );
          const recentSnapshot = await getDocs(recentQuery);
          const recentProps = recentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Property[];
          setRecentProperties(recentProps);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Hola, {user.displayName}! 👋
            </h1>
            <p className="text-gray-600">
              {user.role === 'arrendador' 
                ? 'Gestiona tus propiedades y encuentra inquilinos ideales'
                : 'Encuentra la casa perfecta para ti'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href="/properties" className="card-hover p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Buscar propiedades</h3>
                  <p className="text-sm text-gray-600">Explora miles de opciones disponibles</p>
                </div>
              </div>
            </Link>

            {user.role === 'arrendador' && (
              <Link href="/properties/new" className="card-hover p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlusCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Publicar propiedad</h3>
                    <p className="text-sm text-gray-600">Agrega una nueva propiedad con IA</p>
                  </div>
                </div>
              </Link>
            )}

            <button
              onClick={() => useAppStore.getState().toggleChat()}
              className="card-hover p-6 text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Asistente IA</h3>
                  <p className="text-sm text-gray-600">Obtén recomendaciones personalizadas</p>
                </div>
              </div>
            </button>
          </div>

          {/* User's Properties (Solo para arrendadores) */}
          {user.role === 'arrendador' && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mis Propiedades</h2>
                <Link href="/properties/new" className="btn-primary">
                  <PlusCircle className="w-5 h-5 mr-2 inline" />
                  Nueva propiedad
                </Link>
              </div>

              {userProperties.length === 0 ? (
                <div className="card p-12 text-center">
                  <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No tienes propiedades publicadas
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comienza publicando tu primera propiedad y llega a miles de inquilinos
                  </p>
                  <Link href="/properties/new" className="btn-primary">
                    Publicar primera propiedad
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Recent Properties */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.role === 'arrendador' ? 'Propiedades Recientes' : 'Propiedades Recomendadas'}
              </h2>
              <Link href="/properties" className="text-primary-600 hover:text-primary-700 font-medium">
                Ver todas →
              </Link>
            </div>

            {recentProperties.length === 0 ? (
              <div className="card p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay propiedades disponibles
                </h3>
                <p className="text-gray-600">
                  Sé el primero en publicar una propiedad
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentProperties.map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <ChatAssistant />
    </>
  );
}
