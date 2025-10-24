'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatAssistant from '@/components/ChatAssistant';
import PropertyCard from '@/components/PropertyCard';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Property, SearchFilters } from '@/types';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    priceMin: undefined,
    priceMax: undefined,
    propertyType: '',
    bedrooms: undefined,
    bathrooms: undefined,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const propertiesQuery = query(
          collection(db, 'properties'),
          where('available', '==', true),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(propertiesQuery);
        const props = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Property[];
        
        setProperties(props);
        setFilteredProperties(props);
      } catch (error) {
        console.error('Error cargando propiedades:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const applyFilters = () => {
    let filtered = [...properties];

    if (filters.city) {
      filtered = filtered.filter(p => 
        p.location.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.priceMin) {
      filtered = filtered.filter(p => p.price >= filters.priceMin!);
    }

    if (filters.priceMax) {
      filtered = filtered.filter(p => p.price <= filters.priceMax!);
    }

    if (filters.propertyType) {
      filtered = filtered.filter(p => p.propertyType === filters.propertyType);
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(p => p.bedrooms >= filters.bedrooms!);
    }

    if (filters.bathrooms) {
      filtered = filtered.filter(p => p.bathrooms >= filters.bathrooms!);
    }

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      priceMin: undefined,
      priceMax: undefined,
      propertyType: '',
      bedrooms: undefined,
      bathrooms: undefined,
    });
    setFilteredProperties(properties);
  };

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Buscar Propiedades
            </h1>
            <p className="text-gray-600">
              Encuentra tu hogar ideal entre {properties.length} propiedades disponibles
            </p>
          </div>

          {/* Filters */}
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros de búsqueda
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary text-sm"
              >
                {showFilters ? 'Ocultar' : 'Mostrar'} filtros
              </button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="input-field"
                    placeholder="Ej: Lorica"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio mínimo
                  </label>
                  <input
                    type="number"
                    value={filters.priceMin || ''}
                    onChange={(e) => handleFilterChange('priceMin', Number(e.target.value) || undefined)}
                    className="input-field"
                    placeholder="Ej: 500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio máximo
                  </label>
                  <input
                    type="number"
                    value={filters.priceMax || ''}
                    onChange={(e) => handleFilterChange('priceMax', Number(e.target.value) || undefined)}
                    className="input-field"
                    placeholder="Ej: 1500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de propiedad
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todos</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="casa">Casa</option>
                    <option value="habitacion">Habitación</option>
                    <option value="local">Local</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habitaciones (mínimo)
                  </label>
                  <input
                    type="number"
                    value={filters.bedrooms || ''}
                    onChange={(e) => handleFilterChange('bedrooms', Number(e.target.value) || undefined)}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baños (mínimo)
                  </label>
                  <input
                    type="number"
                    value={filters.bathrooms || ''}
                    onChange={(e) => handleFilterChange('bathrooms', Number(e.target.value) || undefined)}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div className="md:col-span-3 flex space-x-4">
                  <button onClick={applyFilters} className="btn-primary">
                    <Search className="w-5 h-5 mr-2 inline" />
                    Aplicar filtros
                  </button>
                  <button onClick={clearFilters} className="btn-secondary">
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600">
              Mostrando {filteredProperties.length} de {properties.length} propiedades
            </p>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="card p-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron propiedades
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta ajustar tus filtros de búsqueda
              </p>
              <button onClick={clearFilters} className="btn-secondary">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </main>

      <ChatAssistant />
    </>
  );
}
