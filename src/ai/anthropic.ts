import Anthropic from "@anthropic-ai/sdk";

// Inicializar el cliente de Anthropic con la API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Función principal para hacer preguntas a Claude
 * @param prompt - El mensaje o pregunta del usuario
 * @param systemPrompt - Instrucciones del sistema (opcional)
 * @returns La respuesta de Claude como string
 */
export async function askClaude(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt || "Eres un asistente experto en bienes raíces que ayuda a las personas a encontrar la casa perfecta.",
      messages: [{ role: "user", content: prompt }],
    });

    // Extraer el texto de la respuesta
    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    return "Lo siento, no pude generar una respuesta adecuada.";
  } catch (error) {
    console.error("Error al consultar Claude:", error);
    throw new Error("Error al comunicarse con la IA");
  }
}

/**
 * Genera una descripción atractiva para una propiedad
 * @param propertyData - Datos de la propiedad
 * @returns Descripción generada por IA
 */
export async function generatePropertyDescription(propertyData: {
  type: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  location: string;
  features?: string[];
}): Promise<string> {
  const featuresText = propertyData.features?.length 
    ? `Características especiales: ${propertyData.features.join(", ")}.`
    : "";

  const prompt = `Genera una descripción atractiva y profesional para un ${propertyData.type} en ${propertyData.location} con ${propertyData.bedrooms} habitación(es), ${propertyData.bathrooms} baño(s), precio de arriendo ${propertyData.price.toLocaleString('es-CO')} pesos mensuales. ${featuresText}

La descripción debe ser persuasiva, destacar los beneficios y no superar las 100 palabras.`;

  return await askClaude(prompt);
}

/**
 * Genera recomendaciones personalizadas de propiedades
 * @param userPreferences - Preferencias del usuario
 * @param availableProperties - Propiedades disponibles
 * @returns Recomendaciones con explicación
 */
export async function getPropertyRecommendations(
  userPreferences: {
    budget?: number;
    location?: string;
    propertyType?: string;
    mustHaveFeatures?: string[];
  },
  availableProperties: any[]
): Promise<string> {
  const prompt = `Como experto inmobiliario, necesito que recomiendes las mejores opciones de las siguientes propiedades disponibles:

Preferencias del usuario:
- Presupuesto: ${userPreferences.budget ? `${userPreferences.budget.toLocaleString('es-CO')} pesos` : 'No especificado'}
- Ubicación preferida: ${userPreferences.location || 'Cualquiera'}
- Tipo de propiedad: ${userPreferences.propertyType || 'Cualquiera'}
- Características importantes: ${userPreferences.mustHaveFeatures?.join(', ') || 'Ninguna especificada'}

Propiedades disponibles:
${availableProperties.slice(0, 10).map((p, i) => 
  `${i + 1}. ${p.title} - ${p.price.toLocaleString('es-CO')} pesos/mes - ${p.location.neighborhood}, ${p.location.city}`
).join('\n')}

Por favor, recomienda las 3 mejores opciones y explica brevemente por qué son ideales para este usuario.`;

  return await askClaude(prompt);
}

/**
 * Asistente de chat general para responder preguntas sobre propiedades
 * @param userQuestion - Pregunta del usuario
 * @param context - Contexto adicional (propiedades, ubicación, etc.)
 * @returns Respuesta del asistente
 */
export async function chatAssistant(
  userQuestion: string,
  context?: string
): Promise<string> {
  const systemPrompt = `Eres un asistente virtual experto en bienes raíces para la plataforma "Casa Fácil".
Tu trabajo es ayudar a las personas a encontrar la vivienda perfecta, responder preguntas sobre precios, zonas, disponibilidad y dar consejos sobre arrendamiento.

Sé amigable, profesional y conciso. Si no tienes información específica, sugiere al usuario que use los filtros de búsqueda o contacte directamente con los propietarios.`;

  const fullPrompt = context 
    ? `Contexto: ${context}\n\nPregunta del usuario: ${userQuestion}`
    : userQuestion;

  return await askClaude(fullPrompt, systemPrompt);
}

/**
 * Analiza una búsqueda del usuario y sugiere filtros o mejoras
 * @param searchQuery - Texto de búsqueda del usuario
 * @returns Sugerencias y filtros recomendados
 */
export async function analyzeSearchQuery(searchQuery: string): Promise<string> {
  const prompt = `Un usuario busca: "${searchQuery}"

Como experto inmobiliario, analiza esta búsqueda y proporciona:
1. Interpretación de lo que busca el usuario
2. Filtros recomendados (precio, ubicación, tipo de propiedad)
3. Consejos adicionales para encontrar lo que necesita

Responde de forma clara y estructurada.`;

  return await askClaude(prompt);
}
