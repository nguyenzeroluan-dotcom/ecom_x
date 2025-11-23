
// Supabase Credentials
export const SUPABASE_URL = 'https://svqipxmnqhpsqthcttuf.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cWlweG1ucWhwc3F0aGN0dHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTUxNzcsImV4cCI6MjA3OTI5MTE3N30.VedVEO_2zbe4q4xpB3VOZTJLZrN3AEuEjRxRbfaK7yI';

// Gemini Models
export const GEMINI_CHAT_MODEL = 'gemini-3-pro-preview';
export const GEMINI_IMAGE_GEN_MODEL = 'gemini-3-pro-image-preview';
export const GEMINI_VISION_MODEL = 'gemini-3-pro-preview';
export const GEMINI_THINKING_MODEL = 'gemini-3-pro-preview';

// Demo User Constant
export const DEMO_USER_UUID = '00000000-0000-0000-0000-000000000000';

// Mock Data for Fallback
export const MOCK_PRODUCTS = [
  {
    id: 101,
    name: "Modern Art Lamp",
    price: 129.99,
    description: "A minimalist lamp that blends art with function.",
    image_url: "https://picsum.photos/400/400?random=1",
    category: "Home",
    stock: 15
  },
  {
    id: 102,
    name: "Ergonomic Chair",
    price: 299.50,
    description: "Designed for comfort during long work sessions.",
    image_url: "https://picsum.photos/400/400?random=2",
    category: "Office",
    stock: 3
  },
  {
    id: 103,
    name: "Wireless Headphones",
    price: 199.00,
    description: "Noise cancelling with superior sound quality.",
    image_url: "https://picsum.photos/400/400?random=3",
    category: "Electronics",
    stock: 42
  },
  {
    id: 104,
    name: "Smart Watch Pro",
    price: 249.99,
    description: "Track your fitness and stay connected.",
    image_url: "https://picsum.photos/400/400?random=4",
    category: "Electronics",
    stock: 8
  },
   {
    id: 105,
    name: "Ceramic Vase Set",
    price: 89.00,
    description: "Handcrafted vases for a touch of elegance.",
    image_url: "https://picsum.photos/400/400?random=5",
    category: "Home",
    stock: 0
  },
  {
    id: 106,
    name: "Leather Backpack",
    price: 150.00,
    description: "Durable and stylish for everyday travel.",
    image_url: "https://picsum.photos/400/400?random=6",
    category: "Fashion",
    stock: 20
  }
];
