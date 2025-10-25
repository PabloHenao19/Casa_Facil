// src/app/api/properties/generate-description/route.ts
import { NextResponse } from 'next/server';
import { generatePropertyDescription } from '@/ai/groq';  // ← CAMBIO AQUÍ

export async function POST(request: Request) {
  try {
    const propertyData = await request.json();

    const description = await generatePropertyDescription(propertyData);

    return NextResponse.json({ 
      description,
      success: true 
    });
  } catch (error) {
    console.error('Error generating description:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}