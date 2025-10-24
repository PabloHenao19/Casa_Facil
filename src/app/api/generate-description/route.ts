// src/app/api/generate-description/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePropertyDescription } from '@/ai/anthropic';

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json();

    if (!propertyData.type || !propertyData.location) {
      return NextResponse.json(
        { error: 'Datos de propiedad incompletos' },
        { status: 400 }
      );
    }

    // Generar descripción usando Claude
    const description = await generatePropertyDescription(propertyData);

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error al generar descripción:', error);
    return NextResponse.json(
      { error: 'Error al generar descripción' },
      { status: 500 }
    );
  }
}
