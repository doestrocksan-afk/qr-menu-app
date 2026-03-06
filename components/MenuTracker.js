'use client';

import { useEffect, useRef } from 'react';

export default function MenuTracker({ restaurantId }) {
  const queueRef = useRef([]);
  const sessionIdRef = useRef(null);
  const currentItemRef = useRef(null);
  const itemStartTimeRef = useRef(null);

  useEffect(() => {
    // Generar session ID único
    sessionIdRef.current = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Track page view inicial
    track('page_view', {
      device: getDevice(),
      language: getLanguage()
    });

    // Enviar eventos cada 5 segundos
    const interval = setInterval(() => {
      flush();
    }, 5000);

    // Enviar al salir
    const handleBeforeUnload = () => {
      flush();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Exponer funciones globalmente para que el menú las use
    window.menuTracker = {
      categoryOpen: (categoryId, categoryName) => {
        track('category_open', { category_id: categoryId, category_name: categoryName });
      },
      itemClick: (itemId, itemName, categoryId) => {
        track('item_click', { item_id: itemId, item_name: itemName, category_id: categoryId });
      },
      itemOpen: (itemId, itemName) => {
        if (currentItemRef.current) {
          itemClose();
        }
        currentItemRef.current = itemId;
        itemStartTimeRef.current = Date.now();
        track('item_open', { item_id: itemId, item_name: itemName });
      },
      itemClose: () => {
        if (currentItemRef.current && itemStartTimeRef.current) {
          const duration = Date.now() - itemStartTimeRef.current;
          track('item_close', {
            item_id: currentItemRef.current,
            duration_ms: duration
          });
          currentItemRef.current = null;
          itemStartTimeRef.current = null;
        }
      },
      search: (query, resultsCount) => {
        track('search', { query, results_count: resultsCount });
      },
      languageChange: (from, to) => {
        track('language_change', { from, to });
      },
      reviewClick: () => {
        track('review_click', {});
      }
    };

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flush();
    };
  }, [restaurantId]);

  const track = (eventName, data = {}) => {
    const event = {
      restaurant_id: restaurantId,
      session_id: sessionIdRef.current,
      event: eventName,
      data: data,
      timestamp: Date.now(),
      url: window.location.pathname
    };

    queueRef.current.push(event);
  };

  const flush = async () => {
    if (queueRef.current.length === 0) return;

    const events = [...queueRef.current];
    queueRef.current = [];

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true
      });
    } catch (err) {
      console.error('Analytics error:', err);
      // Re-añadir a la cola si falla
      queueRef.current.unshift(...events);
    }
  };

  const getDevice = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  };

  const getLanguage = () => {
    return document.documentElement.lang || 'es';
  };

  const itemClose = () => {
    if (window.menuTracker) {
      window.menuTracker.itemClose();
    }
  };

  return null; // Este componente no renderiza nada, solo hace tracking
}