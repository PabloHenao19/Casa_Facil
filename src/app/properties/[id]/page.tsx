// src/app/properties/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPropertyById } from '@/lib/propertyService';
import { Property } from '@/types';
import Image from 'next/image';
import { MapPin, Bed, Bath, Home as HomeIcon, DollarSign, ArrowLeft, Check, X } from 'lucide-react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadProperty(params.id as string);
    }
  }, [params.id]);

  const loadProperty = async (id: string) => {
    try {
      const data = await getPropertyById(id);
      setProperty(data);
    } catch (error) {
      console.error('Error al cargar propiedad:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apartamento: 'Apartamento',
      casa: 'Casa',
      habitacion: 'Habitación',
      estudio: 'Estudio',
    };
    return labels[type] || type;
  };

  const nextImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Propiedad no encontrada
          </h2>
          <button
            onClick={() => router.push('/properties')}
            className="text-primary-600 hover:text-primary-700"
          >
            Volver a propiedades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Imágenes y descripción */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <div className="relative">
                  <div className="relative h-96 bg-gray-200">
                    <Image
                      src={property.images[currentImageIndex]}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                  
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                      >
                        <ArrowLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full rotate-180"
                      >
                        <ArrowLeft className="h-6 w-6" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {property.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex
                                ? 'bg-white'
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-200">
                  <HomeIcon className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Descripción
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Características */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Características
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {property.features.furnished ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                  <span>Amueblado</span>
                </div>
                <div className="flex items-center gap-2">
                  {property.features.parking ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                  <span>Parqueadero</span>
                </div>
                <div className="flex items-center gap-2">
                  {property.features.pets ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                  <span>Acepta mascotas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Información de contacto */}
          <div className="space-y-6">
            {/* Info principal */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="mb-4">
                <span className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {getTypeLabel(property.type)}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {property.title}
              </h1>

              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {property.location.neighborhood}, {property.location.city}
                </span>
              </div>

              {/* Detalles */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
                <div className="text-center">
                  <Bed className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm text-gray-600">Habitaciones</div>
                  <div className="font-semibold">{property.features.bedrooms}</div>
                </div>
                <div className="text-center">
                  <Bath className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm text-gray-600">Baños</div>
                  <div className="font-semibold">{property.features.bathrooms}</div>
                </div>
                <div className="text-center">
                  <HomeIcon className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm text-gray-600">Área</div>
                  <div className="font-semibold">{property.features.area}m²</div>
                </div>
              </div>

              {/* Precio */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">Precio mensual</div>
                <div className="flex items-center text-3xl font-bold text-primary-600">
                  <DollarSign className="h-8 w-8" />
                  <span>{formatPrice(property.price)}</span>
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Propietario:</strong> {property.ownerName}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Contacto:</strong> {property.ownerEmail}
                </div>
                <button className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 font-semibold">
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
