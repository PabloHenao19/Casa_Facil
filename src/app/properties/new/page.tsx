'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Sparkles, Link as LinkIcon, Loader2, X } from 'lucide-react';

export default function NewPropertyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    neighborhood: '',
    address: '',
    propertyType: 'apartamento',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    features: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
      } else {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addImageUrlField = () => {
    if (imageUrls.length < 10) {
      setImageUrls([...imageUrls, '']);
    }
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls.length === 0 ? [''] : newUrls);
  };

  const generateDescription = async () => {
    setGeneratingDescription(true);
    try {
      const response = await fetch('/api/properties/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.propertyType,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          price: Number(formData.price),
          location: `${formData.neighborhood}, ${formData.city}`,
          features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, description: data.description }));
      }
    } catch (error) {
      console.error('Error generando descripción:', error);
      alert('Error al generar descripción con IA');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Filtrar URLs vacías
      const validImageUrls = imageUrls.filter(url => url.trim() !== '');

      // Crear documento de propiedad
      const propertyData = {
        ownerId: user.uid,
        ownerName: user.displayName || 'Usuario',
        ownerEmail: user.email,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: {
          city: formData.city,
          neighborhood: formData.neighborhood,
          address: formData.address,
        },
        propertyType: formData.propertyType,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        images: validImageUrls,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'properties'), propertyData);
      
      alert('¡Propiedad publicada exitosamente!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error publicando propiedad:', error);
      alert('Error al publicar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Publicar Nueva Propiedad
            </h1>
            <p className="text-gray-600">
              Completa la información de tu propiedad. La IA te ayudará a generar una descripción atractiva.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card p-8">
            <div className="space-y-6">
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título de la propiedad *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ej: Apartamento moderno en el centro"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de propiedad *
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="apartamento">Apartamento</option>
                      <option value="casa">Casa</option>
                      <option value="habitacion">Habitación</option>
                      <option value="local">Local</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio mensual (COP) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="800000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área (m²) *
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="60"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Habitaciones *
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Baños *
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Lorica"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barrio *
                    </label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Centro"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección completa *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Calle 10 # 5-20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Características */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Características especiales (separadas por comas)
                </label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="WiFi, Parqueadero, Piscina, Aire acondicionado"
                />
              </div>

              {/* Descripción con IA */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción de la propiedad *
                  </label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={generatingDescription || !formData.price || !formData.city}
                    className="btn-secondary text-sm"
                  >
                    {generatingDescription ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 inline" />
                        Generar con IA
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field h-32"
                  placeholder="Describe tu propiedad o usa IA para generar una descripción automática"
                  required
                />
              </div>

              {/* URLs de Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URLs de imágenes de la propiedad
                </label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Puedes obtener imágenes gratuitas de{' '}
                    <a href="https://unsplash.com/s/photos/house" target="_blank" rel="noopener noreferrer" className="underline">
                      Unsplash
                    </a>
                    {' '}o{' '}
                    <a href="https://www.pexels.com/search/apartment/" target="_blank" rel="noopener noreferrer" className="underline">
                      Pexels
                    </a>
                    . Haz clic derecho en la imagen → "Copiar dirección de imagen" y pégala abajo.
                  </p>
                </div>

                <div className="space-y-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <LinkIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {imageUrls.length < 10 && (
                  <button
                    type="button"
                    onClick={addImageUrlField}
                    className="btn-secondary text-sm mt-3"
                  >
                    + Agregar otra imagen
                  </button>
                )}

                {/* Preview de imágenes */}
                {imageUrls.some(url => url.trim() !== '') && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                    <div className="grid grid-cols-4 gap-4">
                      {imageUrls.filter(url => url.trim() !== '').map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error+cargando+imagen';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex space-x-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    'Publicar propiedad'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}