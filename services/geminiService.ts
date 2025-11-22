
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { 
  GEMINI_CHAT_MODEL, 
  GEMINI_IMAGE_GEN_MODEL, 
  GEMINI_VISION_MODEL,
  GEMINI_THINKING_MODEL
} from '../constants';
import { AspectRatio, Product, AIReview } from '../types';

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Chat Service ---
export const sendChatMessage = async (
  history: {role: string, parts: {text: string}[]}[], 
  message: string,
  systemInstruction?: string
) => {
  const ai = getAIClient();
  const chat = ai.chats.create({
    model: GEMINI_CHAT_MODEL,
    history: history,
    config: {
      systemInstruction: systemInstruction
    }
  });
  
  const result: GenerateContentResponse = await chat.sendMessage({ message });
  return result.text;
};

// --- Image Generation Service ---
export const generateImage = async (prompt: string, aspectRatio: AspectRatio) => {
  const ai = getAIClient();
  
  const response = await ai.models.generateContent({
    model: GEMINI_IMAGE_GEN_MODEL,
    contents: [{ text: prompt }],
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: "1K" 
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image generated");
};

// --- Image Analysis Service ---
export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: GEMINI_VISION_MODEL,
    contents: [
      { inlineData: { mimeType: mimeType, data: base64Image } },
      { text: prompt }
    ]
  });
  return response.text;
};

// --- Smart Product Identification (JSON) ---
export const identifyProductFromImage = async (base64Image: string, mimeType: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: GEMINI_VISION_MODEL,
    contents: [
      { inlineData: { mimeType: mimeType, data: base64Image } },
      { text: "Analyze this image. Return JSON with creative name, predicted price (number), category (Home, Electronics, Fashion, Office, or Art), and description." }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.NUMBER },
          category: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["name", "price", "category", "description"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

// --- Thinking Mode Service (General) ---
export const thinkingQuery = async (query: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: GEMINI_THINKING_MODEL,
    contents: query,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response.text;
};

// --- UPGRADE: Product Comparison ---
export const compareProductsAI = async (products: Product[]) => {
  const ai = getAIClient();
  const prompt = `Compare the following products in a detailed Markdown table. Highlight key differences, pros, cons, and a "Best For" conclusion.
  Products: ${JSON.stringify(products.map(p => ({ name: p.name, price: p.price, desc: p.description })))}`;

  const response = await ai.models.generateContent({
    model: GEMINI_CHAT_MODEL,
    contents: prompt
  });
  return response.text;
};

// --- UPGRADE: AI Reviews ---
export const generateAIReviews = async (productName: string): Promise<AIReview[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: GEMINI_CHAT_MODEL,
    contents: `Generate 3 short, distinct, creative reviews for "${productName}". 
    1. "The Techie" (Technical focus)
    2. "The Aesthete" (Design focus)
    3. "The Value Hunter" (Price focus)
    Return JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            text: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

// --- UPGRADE: Cart Upsell ---
export const getCartUpsell = async (cartItems: Product[], allProducts: Product[]) => {
  const ai = getAIClient();
  const cartIds = cartItems.map(c => c.id);
  const cartNames = cartItems.map(c => c.name).join(", ");
  
  // Filter out items already in cart
  const inventory = allProducts
    .filter(p => !cartIds.includes(p.id))
    .slice(0, 30) // Limit context
    .map(p => `${p.id}: ${p.name} ($${p.price}, Cat: ${p.category})`)
    .join("\n");
  
  if (!inventory) return null;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", // Fast model for UI interaction
    contents: `Cart: ${cartNames}.
    Inventory:
    ${inventory}
    
    Task: Pick the ONE best complementary product ID from Inventory to recommend. Return ONLY the ID number.`,
  });
  
  const text = response.text?.trim();
  const idMatch = text?.match(/\d+/);
  const id = idMatch ? idMatch[0] : null;
  
  return id ? allProducts.find(p => String(p.id) === id) : null;
};

// --- UPGRADE: Inventory Forecast (Thinking) ---
export const forecastInventory = async (products: Product[]) => {
  const ai = getAIClient();
  const inventoryData = JSON.stringify(products.map(p => ({ name: p.name, stock: p.stock, price: p.price, category: p.category })));
  
  const response = await ai.models.generateContent({
    model: GEMINI_THINKING_MODEL,
    contents: `Analyze this inventory data: ${inventoryData}. 
    Act as a Senior Supply Chain Analyst.
    1. Identify high-risk low stock items.
    2. Suggest pricing strategies for high stock/low value items.
    3. Predict restocking needs based on simulated market trends for these categories.
    4. Output a professional strategic report in Markdown.`,
    config: {
      thinkingConfig: { thinkingBudget: 10240 } // Lower budget for faster response in dashboard
    }
  });
  return response.text;
};
