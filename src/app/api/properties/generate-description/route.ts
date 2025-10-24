import { NextRequest, NextResponse } from 'next/server';
import { generatePropertyDescription } from '@/ai/anthropic';

export async function POST(request: NextRequest) {
  try {
    const { type, bedrooms, bathrooms, price, location, features } = await request.json();

    if (!type || !bedrooms || !bathrooms || !price || !location) {
      return NextResponse.json(
        { success: false, error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    const description = await generatePropertyDescription({
      type,
      bedrooms,
      bathrooms,
      price,
      location,
      features,
    });

    return NextResponse.json({
      success: true,
      description,
    });
  } catch (error) {
    console.error('Error generando descripción:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar descripción' },
      { status: 500 }
    );
  }
}
