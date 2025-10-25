// src/ai/groq.ts
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateChatResponse(messages: any[]) {
  try {
    // Limpiar y validar los mensajes antes de enviarlos a Groq
    const cleanedMessages = messages.map((msg) => {
      // Asegurarnos de que el role es válido
      const role = msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user';
      
      // Extraer solo content (sin id, timestamp, etc.)
      const content = typeof msg.content === 'string' ? msg.content : String(msg.content);
      
      return {
        role: role,
        content: content
      };
    }).filter(msg => msg.content.trim().length > 0); // Filtrar mensajes vacíos

    console.log('📤 Mensajes limpiados para Groq:', JSON.stringify(cleanedMessages, null, 2));

    // Validar que hay al menos un mensaje
    if (cleanedMessages.length === 0) {
      throw new Error('No hay mensajes válidos para procesar');
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: cleanedMessages,
      model: "llama-3.3-70b-versatile", // Modelo actualizado (más reciente)
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const response = chatCompletion.choices[0]?.message?.content || '';
    
    if (!response) {
      throw new Error('Groq devolvió una respuesta vacía');
    }

    console.log('✅ Respuesta de Groq recibida');
    return response;
  } catch (error: any) {
    console.error('❌ Error en generateChatResponse:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function generatePropertyDescription(propertyData: any) {
  try {
    const prompt = `Genera una descripción atractiva y profesional para esta propiedad:
  
Tipo: ${propertyData.type || 'No especificado'}
Ubicación: ${propertyData.location || 'No especificada'}
Precio: ${propertyData.price || 'No especificado'}
Área: ${propertyData.area || 'No especificada'}
Habitaciones: ${propertyData.bedrooms || 'No especificado'}
Baños: ${propertyData.bathrooms || 'No especificado'}
Características: ${propertyData.features?.join(', ') || 'No especificadas'}

Genera una descripción en español, profesional y persuasiva de máximo 200 palabras.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un experto en bienes raíces que genera descripciones atractivas de propiedades. Escribe en español de forma profesional y persuasiva."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Modelo actualizado
      temperature: 0.8,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'No se pudo generar la descripción.';
  } catch (error: any) {
    console.error('❌ Error en generatePropertyDescription:', error);
    throw error;
  }
}

export async function generateRecommendations(userPreferences: any) {
  try {
    const prompt = `Basado en estas preferencias del usuario:
  
${JSON.stringify(userPreferences, null, 2)}

Genera recomendaciones personalizadas de propiedades en español. Sé específico y útil.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un asistente de bienes raíces que ayuda a encontrar la propiedad perfecta. Proporciona recomendaciones personalizadas y útiles en español."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Modelo actualizado
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0]?.message?.content || 'No se pudieron generar recomendaciones.';
  } catch (error: any) {
    console.error('❌ Error en generateRecommendations:', error);
    throw error;
  }
}