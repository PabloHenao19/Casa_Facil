// src/app/api/recommendations/route.ts
import { NextResponse } from 'next/server';
import { generateRecommendations } from '@/ai/groq';  // ← CAMBIO AQUÍ

export async function POST(request: Request) {
  try {
    const userPreferences = await request.json();

    const recommendations = await generateRecommendations(userPreferences);

    return NextResponse.json({ 
      recommendations,
      success: true 
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}