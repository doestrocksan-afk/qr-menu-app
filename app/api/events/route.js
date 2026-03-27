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
    
    const eventsToInsert = events.map(event => ({
      restaurant_id: event.restaurant_id,
      session_id: event.session_id,
      event: event.event,
      item_id: event.data?.item_id || null,
      data: event.data || {},
      timestamp: event.timestamp,
      created_at: new Date().toISOString()
    }));
    
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(eventsToInsert);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save events' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, count: events.length });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');
    const days = parseInt(searchParams.get('days') || '7');
    
    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurant_id is required' }, { status: 400 });
    }
    
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
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
    
    const stats = processAnalytics(events);
    
    return NextResponse.json({
      success: true,
      stats,
      raw_events: events.slice(0, 100)
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function processAnalytics(events) {
  const totalViews = events.filter(e => e.event === 'page_view').length;
  const uniqueSessions = new Set(events.map(e => e.session_id)).size;
  
  // Top platos
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
  
  events
    .filter(e => e.event === 'item_close' && e.item_id)
    .forEach(e => {
      const itemId = e.item_id;
      if (itemViews[itemId]) {
        itemViews[itemId].total_time += (e.data?.duration_ms || 0);
      }
    });
  
  Object.values(itemViews).forEach(item => {
    item.avg_time = item.views > 0 ? Math.round(item.total_time / item.views / 1000) : 0;
  });
  
  const topItems = Object.values(itemViews)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  
  // Dispositivos
  const devices = {};
  events
    .filter(e => e.event === 'page_view' && e.data?.device)
    .forEach(e => {
      devices[e.data.device] = (devices[e.data.device] || 0) + 1;
    });

  // ── Idiomas ──────────────────────────────────────────────────────────────
  // Idioma final de cada sesión = último language_change.to
  // Si no hubo cambios = idioma del page_view
  const sessionLang = {};
  // Primero registrar idioma inicial de cada sesión
  events
    .filter(e => e.event === 'page_view' && e.data?.language)
    .forEach(e => {
      if (!sessionLang[e.session_id]) {
        sessionLang[e.session_id] = e.data.language;
      }
    });
  // Luego sobrescribir con el último language_change
  // Los eventos vienen ordenados desc, así que procesamos al revés
  [...events].reverse()
    .filter(e => e.event === 'language_change' && e.data?.to)
    .forEach(e => {
      sessionLang[e.session_id] = e.data.to;
    });

  // Contar sesiones por idioma final
  const langCounts = {};
  Object.values(sessionLang).forEach(lang => {
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });

  // Ordenar de mayor a menor
  const languageStats = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [lang, count]) => {
      acc[lang] = count;
      return acc;
    }, {});
  // ─────────────────────────────────────────────────────────────────────────

  return {
    total_views: totalViews,
    unique_sessions: uniqueSessions,
    top_items: topItems,
    devices: devices,
    language_stats: languageStats,
    period_days: Math.ceil((Date.now() - new Date(events[events.length - 1]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
  };
}