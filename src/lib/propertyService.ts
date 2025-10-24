// src/lib/propertyService.ts
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Property } from '@/types';

/**
 * Crear nueva propiedad
 */
export async function createProperty(
  propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>,
  images: File[]
): Promise<string> {
  try {
    // Subir imágenes a Firebase Storage
    const imageUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imageRef = ref(storage, `properties/${Date.now()}_${i}_${image.name}`);
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);
      imageUrls.push(url);
    }

    // Crear documento en Firestore
    const propertyWithImages = {
      ...propertyData,
      images: imageUrls,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'properties'), propertyWithImages);
    
    return docRef.id;
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    throw error;
  }
}

/**
 * Obtener todas las propiedades
 */
export async function getAllProperties(): Promise<Property[]> {
  try {
    const q = query(
      collection(db, 'properties'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Property[];
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    throw error;
  }
}

/**
 * Obtener propiedades de un usuario específico
 */
export async function getUserProperties(userId: string): Promise<Property[]> {
  try {
    const q = query(
      collection(db, 'properties'),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Property[];
  } catch (error) {
    console.error('Error al obtener propiedades del usuario:', error);
    throw error;
  }
}

/**
 * Obtener una propiedad por ID
 */
export async function getPropertyById(propertyId: string): Promise<Property | null> {
  try {
    const docRef = doc(db, 'properties', propertyId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    } as Property;
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    throw error;
  }
}

/**
 * Actualizar propiedad
 */
export async function updateProperty(
  propertyId: string,
  updates: Partial<Property>,
  newImages?: File[]
): Promise<void> {
  try {
    let imageUrls: string[] = updates.images || [];

    // Si hay nuevas imágenes, subirlas
    if (newImages && newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        const imageRef = ref(storage, `properties/${Date.now()}_${i}_${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }
    }

    const docRef = doc(db, 'properties', propertyId);
    await updateDoc(docRef, {
      ...updates,
      images: imageUrls,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    throw error;
  }
}

/**
 * Eliminar propiedad
 */
export async function deleteProperty(propertyId: string): Promise<void> {
  try {
    // Obtener la propiedad para eliminar sus imágenes
    const property = await getPropertyById(propertyId);
    
    if (property && property.images) {
      // Eliminar imágenes de Storage
      for (const imageUrl of property.images) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Error al eliminar imagen:', error);
        }
      }
    }

    // Eliminar documento de Firestore
    const docRef = doc(db, 'properties', propertyId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    throw error;
  }
}

/**
 * Buscar propiedades con filtros
 */
export async function searchProperties(filters: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  bedrooms?: number;
  status?: string;
}): Promise<Property[]> {
  try {
    let q = query(collection(db, 'properties'));

    // Aplicar filtros
    if (filters.city) {
      q = query(q, where('location.city', '==', filters.city));
    }
    
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    } else {
      q = query(q, where('status', '==', 'disponible'));
    }

    if (filters.bedrooms) {
      q = query(q, where('features.bedrooms', '>=', filters.bedrooms));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);
    
    let properties = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Property[];

    // Filtrar por precio (cliente-side porque Firestore tiene limitaciones con múltiples rangos)
    if (filters.minPrice) {
      properties = properties.filter(p => p.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice) {
      properties = properties.filter(p => p.price <= filters.maxPrice!);
    }

    return properties;
  } catch (error) {
    console.error('Error al buscar propiedades:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas para panel de administrador
 */
export async function getStatistics() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const propertiesSnapshot = await getDocs(collection(db, 'properties'));
    
    const activeProperties = propertiesSnapshot.docs.filter(
      doc => doc.data().status === 'disponible'
    ).length;

    return {
      totalUsers: usersSnapshot.size,
      totalProperties: propertiesSnapshot.size,
      activeProperties,
      totalSearches: 0, // Implementar si guardas búsquedas
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
}
