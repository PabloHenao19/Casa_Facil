'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ChatAssistant from '@/components/ChatAssistant';
import { useAppStore } from '@/store/useAppStore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Home, Search, Sparkles, Shield, Clock, MessageCircle } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Redirigir al dashboard si ya está autenticado
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Encuentra tu hogar ideal con{' '}
                <span className="text-primary-200">Inteligencia Artificial</span>
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                Casa Fácil conecta arrendadores y arrendatarios de forma inteligente,
                usando IA para hacer recomendaciones personalizadas y automatizar búsquedas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                  Comenzar ahora
                </Link>
                <Link href="/properties" className="btn-secondary border-white text-white hover:bg-white/10">
                  Explorar propiedades
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                ¿Por qué elegir Casa Fácil?
              </h2>
              <p className="text-xl text-gray-600">
                La forma más inteligente de encontrar y publicar propiedades
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">IA Inteligente</h3>
                <p className="text-gray-600">
                  Nuestro asistente con IA de Claude te ayuda a encontrar la propiedad
                  perfecta según tus necesidades y presupuesto.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Búsqueda Fácil</h3>
                <p className="text-gray-600">
                  Filtra por ubicación, precio, tipo de propiedad y características
                  para encontrar exactamente lo que buscas.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Seguro y Confiable</h3>
                <p className="text-gray-600">
                  Verificamos a todos los usuarios y propiedades para garantizar
                  tu seguridad y tranquilidad.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Ahorra Tiempo</h3>
                <p className="text-gray-600">
                  La IA genera descripciones automáticas y responde preguntas
                  frecuentes las 24 horas del día.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Chat en Vivo</h3>
                <p className="text-gray-600">
                  Comunícate directamente con propietarios o pregunta a nuestro
                  asistente IA sobre cualquier duda.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Para Todos</h3>
                <p className="text-gray-600">
                  Ya seas arrendador o arrendatario, tenemos las herramientas
                  perfectas para ti.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 py-20">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                ¿Listo para encontrar tu próximo hogar?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Únete a miles de personas que ya encontraron su lugar ideal
              </p>
              <Link href="/login" className="btn-primary text-lg">
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container-custom">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Home className="w-6 h-6" />
                  <span className="text-xl font-bold">Casa Fácil</span>
                </div>
                <p className="text-gray-400">
                  La plataforma inteligente para encontrar tu hogar ideal.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Enlaces</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/properties" className="hover:text-white">Propiedades</Link></li>
                  <li><Link href="/login" className="hover:text-white">Iniciar sesión</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contacto</h4>
                <p className="text-gray-400">
                  Email: info@casafacil.com<br />
                  Teléfono: +57 300 123 4567
                </p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Casa Fácil. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </main>

      <ChatAssistant />
    </>
  );
}
