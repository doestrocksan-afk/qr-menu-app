import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para obtener datos de WordPress
export async function getWordPressData(restaurantSlug) {
  try {
    const response = await fetch(
      `https://easydishmenu.com/wp-json/qrmenu/v1/menu/${restaurantSlug}`,
      {
        next: { revalidate: 60 } // Cache por 1 minuto
      }
    );
    
    if (!response.ok) {
      throw new Error('Menu not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching WordPress data:', error);
    return null;
  }
}