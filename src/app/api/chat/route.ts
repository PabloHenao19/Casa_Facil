import { NextRequest, NextResponse } from 'next/server';
import { chatAssistant } from '@/ai/anthropic';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    // Construir contexto del historial si existe
    let context = '';
    if (history && history.length > 0) {
      context = 'Historial de conversación reciente:\n';
      history.forEach((msg: any) => {
        context += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n`;
      });
      context += '\n';
    }

    // Obtener respuesta de Claude
    const response = await chatAssistant(message, context);

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error en API de chat:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
