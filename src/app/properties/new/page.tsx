'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { db, storage, auth } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { Sparkles, Upload, Loader2, X } from 'lucide-react';

export default function NewPropertyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
      // Subir imágenes
      const imageUrls: string[] = [];
      for (const image of images) {
        const storageRef = ref(storage, `properties/${user.uid}/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }

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
        images: imageUrls,
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

              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos de la propiedad
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="btn-primary">Seleccionar imágenes</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG hasta 5MB (máximo 10 imágenes)
                  </p>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
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
