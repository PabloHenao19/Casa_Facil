// src/app/api/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPropertyRecommendations } from '@/ai/anthropic';

export async function POST(request: NextRequest) {
  try {
    const { userPreferences, availableProperties } = await request.json();

    if (!userPreferences || !availableProperties) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Obtener recomendaciones usando Claude
    const recommendations = await getPropertyRecommendations(
      userPreferences,
      availableProperties
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener recomendaciones' },
      { status: 500 }
    );
  }
}
