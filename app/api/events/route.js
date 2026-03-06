import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { events } = await request.json();
    
    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events data' },
        { status: 400 }
      );
    }
    
    // Preparar eventos para insertar
    const eventsToInsert = events.map(event => ({
      restaurant_id: event.restaurant_id,
      session_id: event.session_id,
      event: event.event,
      item_id: event.data?.item_id || null,
      data: event.data || {},
      timestamp: event.timestamp,
      created_at: new Date().toISOString()
    }));
    
    // Insertar en batch
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(eventsToInsert);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save events' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, count: events.length });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Endpoint GET para obtener analytics (usado por WordPress)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');
    const days = parseInt(searchParams.get('days') || '7');
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurant_id is required' },
        { status: 400 }
      );
    }
    
    // Obtener eventos de los últimos X días
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }
    
    // Procesar estadísticas
    const stats = processAnalytics(events);
    
    return NextResponse.json({
      success: true,
      stats,
      raw_events: events.slice(0, 100) // Solo las últimas 100
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function processAnalytics(events) {
  const totalViews = events.filter(e => e.event === 'page_view').length;
  const uniqueSessions = new Set(events.map(e => e.session_id)).size;
  
  // Top platos más vistos
  const itemViews = {};
  events
    .filter(e => e.event === 'item_open' && e.item_id)
    .forEach(e => {
      const itemId = e.item_id;
      const itemName = e.data?.item_name || `Item ${itemId}`;
      if (!itemViews[itemId]) {
        itemViews[itemId] = { id: itemId, name: itemName, views: 0, total_time: 0 };
      }
      itemViews[itemId].views++;
    });
  
  // Tiempo por plato
  events
    .filter(e => e.event === 'item_close' && e.item_id)
    .forEach(e => {
      const itemId = e.item_id;
      if (itemViews[itemId]) {
        itemViews[itemId].total_time += (e.data?.duration_ms || 0);
      }
    });
  
  // Calcular tiempo medio
  Object.values(itemViews).forEach(item => {
    item.avg_time = item.views > 0 ? Math.round(item.total_time / item.views / 1000) : 0; // en segundos
  });
  
  const topItems = Object.values(itemViews)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  
  // Dispositivos
  const devices = {};
  events
    .filter(e => e.event === 'page_view' && e.data?.device)
    .forEach(e => {
      const device = e.data.device;
      devices[device] = (devices[device] || 0) + 1;
    });
  
  return {
    total_views: totalViews,
    unique_sessions: uniqueSessions,
    top_items: topItems,
    devices: devices,
    period_days: Math.ceil((Date.now() - new Date(events[events.length - 1]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
  };
}