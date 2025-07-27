import OpenAI from "openai";

// Initialize OpenAI with fallback for Gemini API
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Gemini API fallback function
async function callGeminiAPI(prompt: string, systemPrompt?: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("No AI API key configured");
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          candidateCount: 1,
        }
      })
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function getSmartRecommendations(
  vendorId: string,
  category: string,
  location: { lat: number; lon: number },
  urgency: "low" | "medium" | "high"
) {
  try {
    const prompt = `Find suppliers for category: ${category}, location: ${location.lat},${location.lon}, urgency: ${urgency}. Consider factors like proximity, reliability, price, and delivery speed. Provide response in JSON format with recommendations array containing supplier names, ratings, and distances.`;
    
    const systemPrompt = `You are an AI assistant for Indian street food vendors. Provide smart supplier recommendations based on location, category, and urgency. Always respond in JSON format with recommendations array.`;

    let result;
    
    if (openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });
      result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    } else {
      const geminiResponse = await callGeminiAPI(prompt, systemPrompt);
      try {
        result = JSON.parse(geminiResponse);
      } catch {
        result = { recommendations: [], message: geminiResponse };
      }
    }

    return result;
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return {
      recommendations: [],
      message: "AI recommendations temporarily unavailable"
    };
  }
}

export async function analyzeQuality(image: string, productType: string) {
  try {
    const prompt = `Analyze the quality of this ${productType}. Provide a quality score (1-10), freshness assessment, and any concerns. Respond in JSON format with quality_score, freshness, and concerns fields.`;
    
    let result;
    
    if (openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a food quality expert. Analyze images of raw materials for Indian street food and provide quality scores (1-10) and recommendations. Respond in JSON format."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
      });
      result = JSON.parse(response.choices[0].message.content || '{"quality_score": 0}');
    } else {
      // For Gemini, we'll provide a text-based analysis since image analysis requires different API calls
      const geminiResponse = await callGeminiAPI(`${prompt} Note: Image analysis not available, provide general quality guidelines for ${productType}.`);
      try {
        result = JSON.parse(geminiResponse);
      } catch {
        result = { quality_score: 7, message: geminiResponse };
      }
    }

    return result;
  } catch (error) {
    console.error('Error analyzing quality:', error);
    return {
      quality_score: 0,
      message: "Quality analysis temporarily unavailable"
    };
  }
}

export async function generatePriceNegotiation(
  orderId: string,
  currentPrice: number,
  targetPrice: number,
  context: string
) {
  try {
    const prompt = `Help negotiate price from ₹${currentPrice} to ₹${targetPrice}. Context: ${context}. Provide respectful negotiation phrases in both Hindi and English. Respond in JSON format with suggestion field containing the negotiation advice.`;
    
    const systemPrompt = "You are a negotiation expert for Indian street food vendors. Provide polite, culturally appropriate negotiation suggestions in Hindi and English. Respond in JSON format.";

    let result;
    
    if (openai) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });
      result = JSON.parse(response.choices[0].message.content || '{"suggestion": ""}');
    } else {
      const geminiResponse = await callGeminiAPI(prompt, systemPrompt);
      try {
        result = JSON.parse(geminiResponse);
      } catch {
        result = { suggestion: geminiResponse };
      }
    }

    return result;
  } catch (error) {
    console.error('Error generating negotiation:', error);
    return {
      suggestion: "Negotiation assistance temporarily unavailable"
    };
  }
}