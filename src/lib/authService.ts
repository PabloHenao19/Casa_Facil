// src/lib/authService.ts
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

/**
 * Registrar nuevo usuario con email y contraseña
 */
export async function registerWithEmail(
  email: string, 
  password: string, 
  displayName: string,
  role: 'arrendador' | 'arrendatario'
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Actualizar perfil con nombre
    await updateProfile(firebaseUser, { displayName });

    // Crear documento de usuario en Firestore
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      role,
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    return userData;
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    throw new Error(error.message);
  }
}

/**
 * Iniciar sesión con email y contraseña
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Obtener datos del usuario desde Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    throw new Error(error.message);
  }
}

/**
 * Iniciar sesión con Google
 */
export async function loginWithGoogle(role?: 'arrendador' | 'arrendatario'): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Verificar si el usuario ya existe
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as User;
    }

    // Si es usuario nuevo, crear documento
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || 'Usuario',
      role: role || 'arrendatario',
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(),
    };

    await setDoc(userDocRef, userData);

    return userData;
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw new Error(error.message);
  }
}

/**
 * Cerrar sesión
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
}

/**
 * Obtener datos completos del usuario actual
 */
export async function getCurrentUser(firebaseUser: FirebaseUser): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
}
