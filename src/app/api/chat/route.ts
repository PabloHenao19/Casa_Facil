// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/ai/groq';
import {
  shouldSearchDatabase,
  searchRelevantProperties,
  formatPropertiesForContext
} from '@/lib/aiPropertySearch';

export async function POST(request: Request) {
  try {
    // Verificar que GROQ_API_KEY esté configurada
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY no está configurada');
      return NextResponse.json(
        { 
          error: 'API key no configurada',
          success: false 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('📥 Request recibido');

    const { message, history } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      console.error('❌ Mensaje inválido o vacío');
      return NextResponse.json(
        { error: 'Message is required', success: false },
        { status: 400 }
      );
    }

    // Construir el array de mensajes
    const messages = [];

    // 1. Buscar propiedades relevantes si la pregunta lo requiere
    let propertiesContext = '';
    if (shouldSearchDatabase(message)) {
      console.log('🔍 Buscando propiedades relevantes en Firebase...');
      const properties = await searchRelevantProperties(message, 5);
      propertiesContext = formatPropertiesForContext(properties);
      console.log(`📊 Contexto generado con ${properties.length} propiedades`);
    }

    // 2. Mensaje de sistema con contexto dinámico
    let systemMessage = `Eres un asistente virtual experto en bienes raíces para Casa Fácil. 
Tu trabajo es ayudar a los usuarios a encontrar propiedades que se ajusten a sus necesidades.

IMPORTANTE:
- Responde SIEMPRE basándote en los datos proporcionados de nuestra base de datos
- Si te dan información de propiedades, úsala para responder de forma específica y detallada
- Menciona características específicas como ubicación, precio, número de habitaciones
- Sé amable, profesional y entusiasta
- Si no hay propiedades que coincidan, sugiere alternativas o pide más detalles
- Responde en español de Colombia`;

    if (propertiesContext) {
      systemMessage += `\n\n--- DATOS ACTUALES DE PROPIEDADES DISPONIBLES ---\n${propertiesContext}\n--- FIN DE DATOS ---\n\nResponde basándote en estas propiedades reales.`;
    }

    messages.push({
      role: 'system',
      content: systemMessage
    });

    // 3. Agregar historial si existe (últimos 5 mensajes)
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-5);
      recentHistory.forEach((msg: any) => {
        if (msg.role && msg.content && msg.content.trim()) {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content.trim()
          });
        }
      });
    }

    // 4. Agregar el mensaje actual del usuario
    messages.push({
      role: 'user',
      content: message.trim()
    });

    console.log(`📤 Enviando ${messages.length} mensajes a Groq`);
    console.log(`📊 Incluye datos de Firebase: ${propertiesContext ? 'Sí' : 'No'}`);

    // Llamar a Groq
    const response = await generateChatResponse(messages);

    console.log('✅ Respuesta generada exitosamente');

    return NextResponse.json({ 
      response: response,
      success: true,
      hasPropertyData: !!propertiesContext // Indica si se usaron datos reales
    });

  } catch (error: any) {
    console.error('❌ Error en chat API:', error);
    console.error('❌ Error message:', error.message);
    
    let errorMessage = 'Error al generar respuesta';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Error con la configuración de la API';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Has excedido el límite de mensajes. Intenta en unos minutos.';
    } else if (error.message?.includes('Firebase')) {
      errorMessage = 'Error al consultar la base de datos. Intenta de nuevo.';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        success: false 
      },
      { status: 500 }
    );
  }
}