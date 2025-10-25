// src/lib/aiPropertySearch.ts
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from './firebase';

interface Property {
  id: string;
  title?: string;
  type?: string;
  location?: string;
  price?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  status?: string;
  features?: string[];
}

/**
 * Extrae información clave de la pregunta del usuario
 */
function extractSearchParams(userMessage: string): {
  type?: string;
  location?: string;
  priceRange?: { min?: number; max?: number };
  bedrooms?: number;
  searchAll?: boolean;
} {
  const messageLower = userMessage.toLowerCase();
  
  const params: any = {};

  // Detectar tipo de propiedad
  if (messageLower.includes('apartamento') || messageLower.includes('aparta')) {
    params.type = 'apartamento';
  } else if (messageLower.includes('casa')) {
    params.type = 'casa';
  } else if (messageLower.includes('oficina')) {
    params.type = 'oficina';
  } else if (messageLower.includes('local')) {
    params.type = 'local';
  } else if (messageLower.includes('lote') || messageLower.includes('terreno')) {
    params.type = 'lote';
  }

  // Detectar ubicaciones comunes en Colombia
  const ubicaciones = [
    'bogotá', 'bogota', 'chapinero', 'usaquén', 'usaquen', 'suba', 'engativá', 'engativa',
    'medellín', 'medellin', 'poblado', 'envigado', 'cali', 'cartagena', 'barranquilla',
    'bucaramanga', 'pereira', 'manizales', 'ibagué', 'ibague', 'norte', 'sur', 'centro'
  ];
  
  for (const ubicacion of ubicaciones) {
    if (messageLower.includes(ubicacion)) {
      params.location = ubicacion;
      break;
    }
  }

  // Detectar número de habitaciones
  const bedroomsMatch = messageLower.match(/(\d+)\s*(habitacion|habitación|hab|alcoba|cuarto)/);
  if (bedroomsMatch) {
    params.bedrooms = parseInt(bedroomsMatch[1]);
  }

  // Detectar rango de precios (en millones)
  if (messageLower.includes('menos de') || messageLower.includes('máximo')) {
    const priceMatch = messageLower.match(/(\d+)\s*(millón|millon|millones)/);
    if (priceMatch) {
      params.priceRange = { max: parseInt(priceMatch[1]) * 1000000 };
    }
  } else if (messageLower.includes('más de') || messageLower.includes('mínimo')) {
    const priceMatch = messageLower.match(/(\d+)\s*(millón|millon|millones)/);
    if (priceMatch) {
      params.priceRange = { min: parseInt(priceMatch[1]) * 1000000 };
    }
  }

  // Detectar si es una pregunta general sobre disponibilidad
  if (
    messageLower.includes('qué tienen') ||
    messageLower.includes('que tienen') ||
    messageLower.includes('disponible') ||
    messageLower.includes('hay') ||
    messageLower.includes('mostrar') ||
    messageLower.includes('ver')
  ) {
    params.searchAll = true;
  }

  return params;
}

/**
 * Busca propiedades relevantes en Firebase basándose en la pregunta del usuario
 */
export async function searchRelevantProperties(
  userMessage: string,
  maxResults: number = 5
): Promise<Property[]> {
  try {
    const params = extractSearchParams(userMessage);
    console.log('🔍 Parámetros de búsqueda extraídos:', params);

    const propertiesRef = collection(db, 'properties');
    let q = query(propertiesRef);

    // Aplicar filtros si existen
    if (params.type) {
      q = query(q, where('type', '==', params.type));
    }

    if (params.location) {
      // Búsqueda flexible por ubicación (contiene)
      q = query(q, where('location', '>=', params.location));
    }

    if (params.bedrooms) {
      q = query(q, where('bedrooms', '==', params.bedrooms));
    }

    // Solo mostrar propiedades disponibles
    q = query(q, where('status', '==', 'disponible'));

    // Limitar resultados
    q = query(q, limit(maxResults));

    const snapshot = await getDocs(q);
    const properties: Property[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      properties.push({
        id: doc.id,
        ...data,
      } as Property);
    });

    console.log(`✅ Encontradas ${properties.length} propiedades relevantes`);
    return properties;
  } catch (error) {
    console.error('❌ Error buscando propiedades:', error);
    return [];
  }
}

/**
 * Formatea las propiedades para incluir en el contexto del chat
 */
export function formatPropertiesForContext(properties: Property[]): string {
  if (properties.length === 0) {
    return 'No se encontraron propiedades que coincidan con los criterios de búsqueda.';
  }

  let context = `Propiedades disponibles en nuestra base de datos (${properties.length} resultados):\n\n`;

  properties.forEach((prop, index) => {
    context += `${index + 1}. ${prop.title || 'Propiedad'}\n`;
    context += `   - Tipo: ${prop.type || 'No especificado'}\n`;
    context += `   - Ubicación: ${prop.location || 'No especificada'}\n`;
    context += `   - Precio: $${prop.price?.toLocaleString('es-CO') || 'No especificado'}\n`;
    
    if (prop.area) {
      context += `   - Área: ${prop.area} m²\n`;
    }
    
    if (prop.bedrooms) {
      context += `   - Habitaciones: ${prop.bedrooms}\n`;
    }
    
    if (prop.bathrooms) {
      context += `   - Baños: ${prop.bathrooms}\n`;
    }
    
    if (prop.description) {
      context += `   - Descripción: ${prop.description.substring(0, 150)}...\n`;
    }
    
    if (prop.features && prop.features.length > 0) {
      context += `   - Características: ${prop.features.slice(0, 3).join(', ')}\n`;
    }
    
    context += '\n';
  });

  return context;
}

/**
 * Determina si la pregunta del usuario requiere búsqueda en la base de datos
 */
export function shouldSearchDatabase(userMessage: string): boolean {
  const messageLower = userMessage.toLowerCase();
  
  const searchKeywords = [
    'busco', 'buscar', 'encontrar', 'necesito', 'quiero',
    'apartamento', 'casa', 'propiedad', 'inmueble',
    'disponible', 'hay', 'tienen', 'mostrar', 'ver',
    'ubicación', 'ubicacion', 'zona', 'sector',
    'precio', 'cuánto', 'cuanto', 'cuesta',
    'habitaciones', 'baños', 'área', 'metros'
  ];

  return searchKeywords.some(keyword => messageLower.includes(keyword));
}