import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Este endpoint recibe notificaciones desde WordPress cuando se crea un restaurante
export async function POST(request) {
  try {
    const payload = await request.json();
    
    const { event, restaurant_id, slug, data } = payload;
    
    if (event === 'restaurant.created') {
      // Crear o actualizar restaurante en Supabase
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .upsert({
          wordpress_id: restaurant_id,
          slug: slug,
          name: data.name || data.email.split('@')[0],
          email: data.email,
          plan: data.plan || 'starter',
          status: 'active',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wordpress_id'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating restaurant in Supabase:', error);
        return NextResponse.json(
          { error: 'Failed to create restaurant' },
          { status: 500 }
        );
      }
      
      console.log('✅ Restaurant synced to Supabase:', restaurant);
      
      return NextResponse.json({
        success: true,
        restaurant: restaurant
      });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}