'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="card-hover">
        {/* Imagen */}
        <div className="relative h-64 bg-gray-200">
          {property.images && property.images.length > 0 ? (
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Home className="w-16 h-16" />
            </div>
          )}
          
          {/* Badge de disponibilidad */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              property.available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {property.available ? 'Disponible' : 'No disponible'}
            </span>
          </div>

          {/* Badge de tipo de propiedad */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-800 capitalize">
              {property.propertyType}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Precio */}
          <div className="mb-3">
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(property.price)}
            </span>
            <span className="text-gray-500 text-sm ml-1">/mes</span>
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {property.title}
          </h3>

          {/* Ubicación */}
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm line-clamp-1">
              {property.location.neighborhood}, {property.location.city}
            </span>
          </div>

          {/* Características */}
          <div className="flex items-center justify-between text-gray-600 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Maximize className="w-4 h-4" />
              <span className="text-sm">{property.area}m²</span>
            </div>
          </div>

          {/* Descripción corta */}
          {property.description && (
            <p className="mt-4 text-sm text-gray-600 line-clamp-2">
              {property.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
