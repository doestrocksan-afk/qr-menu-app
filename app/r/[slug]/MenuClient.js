'use client';

import { useState, useEffect } from 'react';

export default function MenuClient({ menuData }) {
  const { restaurant, categories, languages = [], default_language = 'es' } = menuData;

  const [language, setLanguage] = useState(default_language);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Mapa de traducciones por código de idioma
  const translationsMap = {};
  languages.forEach(lang => {
    translationsMap[lang.code] = lang.translations || {};
  });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('menu-language');
    // Solo usar el guardado si ese idioma sigue activo
    const activeCodes = languages.map(l => l.code);
    if (saved && activeCodes.includes(saved)) {
      setLanguage(saved);
    } else {
      setLanguage(default_language);
    }
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap';
    document.head.appendChild(link);
  }, []);

  const changeLanguage = (newLang) => {
    if (window.menuTracker) window.menuTracker.languageChange(language, newLang);
    setLanguage(newLang);
    localStorage.setItem('menu-language', newLang);
  };

  const openItem = (item, categoryId) => {
    setSelectedItem(item);
    if (window.menuTracker) {
      window.menuTracker.itemClick(item.id, item.name[language] || item.name[default_language], categoryId);
      window.menuTracker.itemOpen(item.id, item.name[language] || item.name[default_language]);
    }
  };

  const closeItem = () => {
    if (window.menuTracker) window.menuTracker.itemClose();
    setSelectedItem(null);
  };

  const openGoogleReview = () => {
    if (window.menuTracker) window.menuTracker.reviewClick();
    if (restaurant.google_place_id) {
      window.open(`https://search.google.com/local/writereview?placeid=${restaurant.google_place_id}`, '_blank');
    }
  };

  const filteredCategories = (searchQuery.trim()
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => {
          const name = (item.name[language] || item.name[default_language] || '').toLowerCase();
          const desc = (item.description[language] || item.description[default_language] || '').toLowerCase();
          return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
        })
      }))
    : categories
  ).filter(cat => cat.items.length > 0);

  // getText usa las traducciones dinámicas de la BD para textos configurables,
  // y un fallback hardcoded para textos de navegación que no son configurables
  const getText = (key) => {
    const trans = translationsMap[language] || translationsMap[default_language] || {};
    const staticFallbacks = {
      noResults:   { es: 'Sin resultados', en: 'No results', fr: 'Aucun résultat', de: 'Keine Ergebnisse', it: 'Nessun risultato', pt: 'Sem resultados' },
      information: { es: 'Información', en: 'Information', fr: 'Informations', de: 'Information', it: 'Informazioni', pt: 'Informação' },
      restaurant:  { es: 'Restaurante', en: 'Restaurant', fr: 'Restaurant', de: 'Restaurant', it: 'Ristorante', pt: 'Restaurante' },
      phone:       { es: 'Teléfono', en: 'Phone', fr: 'Téléphone', de: 'Telefon', it: 'Telefono', pt: 'Telefone' },
      address:     { es: 'Dirección', en: 'Address', fr: 'Adresse', de: 'Adresse', it: 'Indirizzo', pt: 'Endereço' },
      rateUs:      { es: 'Déjanos tu opinión', en: 'Leave a review', fr: 'Donnez votre avis', de: 'Bewertung hinterlassen', it: 'Lascia una recensione', pt: 'Deixe uma avaliação' },
    };
    // Textos configurables desde el plugin
    if (key === 'search')     return trans.search_placeholder || 'Buscar en la carta...';
    if (key === 'unavailable') return trans.unavailable_badge || 'No disponible';
    if (key === 'allergens')  return trans.allergens_label || 'Alérgenos';
    // Textos estáticos con fallback por idioma
    return staticFallbacks[key]?.[language] || staticFallbacks[key]?.es || '';
  };

  const scrollToCategory = (catId) => {
    const el = document.getElementById(`cat-${catId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveCategory(catId);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0f0e0c; }

        .qr-root {
          min-height: 100vh;
          background: #0f0e0c;
          color: #e8e0d0;
          font-family: 'Lato', sans-serif;
        }

        /* ── HEADER ── */
        .qr-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(15,14,12,0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212,175,90,0.2);
        }
        .qr-header-top {
          max-width: 720px;
          margin: 0 auto;
          padding: 20px 20px 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .qr-restaurant-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 5vw, 30px);
          font-weight: 700;
          color: #f5efe0;
          letter-spacing: 0.02em;
          line-height: 1.1;
        }
        .qr-restaurant-address {
          margin-top: 4px;
          font-size: 12px;
          color: #8a8070;
          font-weight: 300;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .qr-lang-select {
          padding: 7px 10px;
          background: transparent;
          border: 1px solid rgba(212,175,90,0.4);
          border-radius: 6px;
          color: #d4af5a;
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          outline: none;
          flex-shrink: 0;
        }
        .qr-lang-select option { background: #1a1814; color: #e8e0d0; }

        /* Search */
        .qr-search-wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 20px 16px;
          position: relative;
        }
        .qr-search-icon {
          position: absolute;
          left: 36px;
          top: 50%;
          transform: translateY(-50%);
          color: #6a6050;
          font-size: 15px;
          pointer-events: none;
        }
        .qr-search-input {
          width: 100%;
          padding: 11px 40px 11px 44px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #e8e0d0;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s;
        }
        .qr-search-input::placeholder { color: #5a5040; }
        .qr-search-input:focus { border-color: rgba(212,175,90,0.4); }
        .qr-search-clear {
          position: absolute;
          right: 28px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6a6050;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
        }

        /* ── CATEGORY NAV ── */
        .qr-cat-nav {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 20px 14px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .qr-cat-nav::-webkit-scrollbar { display: none; }
        .qr-cat-pill {
          flex-shrink: 0;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(212,175,90,0.25);
          background: transparent;
          color: #8a8070;
          font-family: 'Lato', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .qr-cat-pill:hover,
        .qr-cat-pill.active {
          background: #d4af5a;
          border-color: #d4af5a;
          color: #0f0e0c;
        }

        /* ── MAIN ── */
        .qr-main {
          max-width: 720px;
          margin: 0 auto;
          padding: 32px 20px 120px;
        }

        /* ── CATEGORY SECTION ── */
        .qr-cat-section { margin-bottom: 48px; }
        .qr-cat-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .qr-cat-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #f5efe0;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .qr-cat-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, rgba(212,175,90,0.4), transparent);
        }

        /* ── ITEM CARD ── */
        .qr-item-card {
          display: flex;
          align-items: stretch;
          gap: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          margin-bottom: 12px;
        }
        .qr-item-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(212,175,90,0.25);
          transform: translateY(-1px);
        }
        .qr-item-img-wrap {
          width: 110px;
          flex-shrink: 0;
          overflow: hidden;
          position: relative;
        }
        .qr-item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .qr-item-no-img {
          width: 110px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .qr-item-no-img-icon {
          font-size: 28px;
          opacity: 0.15;
        }
        .qr-item-body {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 90px;
        }
        .qr-item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .qr-item-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 600;
          color: #f0e8d8;
          line-height: 1.25;
        }
        .qr-item-price {
          font-size: 16px;
          font-weight: 700;
          color: #d4af5a;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }
        .qr-item-desc {
          margin-top: 6px;
          font-size: 13px;
          color: #7a7060;
          font-weight: 300;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .qr-item-bottom {
          margin-top: 10px;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .qr-allergen {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(212,175,90,0.1);
          color: #b89040;
          border: 1px solid rgba(212,175,90,0.2);
        }
        .qr-allergen-more {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.05);
          color: #6a6050;
        }

        /* ── EMPTY ── */
        .qr-empty {
          text-align: center;
          padding: 80px 20px;
        }
        .qr-empty-text {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 20px;
          color: #5a5040;
          margin-bottom: 20px;
        }
        .qr-empty-btn {
          padding: 10px 24px;
          border-radius: 6px;
          border: 1px solid rgba(212,175,90,0.4);
          background: transparent;
          color: #d4af5a;
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          text-transform: uppercase;
          transition: background 0.2s;
        }
        .qr-empty-btn:hover { background: rgba(212,175,90,0.1); }

        /* ── FLOATING ── */
        .qr-floating {
          position: fixed;
          bottom: 24px;
          right: 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          z-index: 40;
        }
        .qr-info-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(30,28,24,0.95);
          color: #8a8070;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          transition: border-color 0.2s, color 0.2s;
        }
        .qr-info-btn:hover { border-color: rgba(212,175,90,0.4); color: #d4af5a; }
        .qr-review-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 11px 18px;
          border-radius: 24px;
          border: 1px solid rgba(212,175,90,0.5);
          background: rgba(15,14,12,0.95);
          color: #d4af5a;
          font-family: 'Lato', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: background 0.2s;
        }
        .qr-review-btn:hover { background: rgba(212,175,90,0.12); }

        /* ── MODAL ── */
        .qr-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (min-width: 600px) {
          .qr-overlay { align-items: center; padding: 16px; }
          .qr-modal { border-radius: 16px !important; max-height: 85vh !important; }
        }
        .qr-modal {
          background: #1a1814;
          border-radius: 20px 20px 0 0;
          width: 100%;
          max-width: 600px;
          max-height: 92vh;
          overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.07);
          animation: slideUp 0.25s cubic-bezier(0.32,0.72,0,1);
        }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .qr-modal-img-wrap {
          width: 100%;
          height: 260px;
          overflow: hidden;
          border-radius: 20px 20px 0 0;
          position: relative;
        }
        .qr-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .qr-modal-img-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(to top, #1a1814, transparent);
        }
        .qr-modal-body {
          padding: 24px;
          position: relative;
        }
        .qr-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #8a8070;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s;
        }
        .qr-modal-close:hover { border-color: rgba(212,175,90,0.4); color: #d4af5a; }
        .qr-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #f5efe0;
          line-height: 1.2;
          margin: 0 40px 10px 0;
        }
        .qr-modal-price {
          font-size: 28px;
          font-weight: 700;
          color: #d4af5a;
          margin-bottom: 16px;
          letter-spacing: 0.02em;
        }
        .qr-modal-desc {
          font-size: 15px;
          color: #8a8070;
          font-weight: 300;
          line-height: 1.7;
          margin-bottom: 24px;
        }
        .qr-modal-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin-bottom: 20px;
        }
        .qr-modal-allergens-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6a6050;
          margin-bottom: 12px;
        }
        .qr-modal-allergens-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .qr-modal-allergen {
          padding: 6px 14px;
          border-radius: 6px;
          background: rgba(212,175,90,0.08);
          border: 1px solid rgba(212,175,90,0.2);
          color: #b89040;
          font-size: 13px;
          font-weight: 700;
        }

        /* ── INFO MODAL ── */
        .qr-info-list { display: flex; flex-direction: column; gap: 16px; }
        .qr-info-row {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 14px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .qr-info-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
        .qr-info-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #5a5040;
          margin-bottom: 4px;
        }
        .qr-info-val { font-size: 15px; color: #c8c0b0; font-weight: 400; }
        .qr-info-link { font-size: 15px; color: #d4af5a; text-decoration: none; font-weight: 600; }


        /* ── NO DISPONIBLE ── */
        .qr-item-card.unavailable {
          opacity: 0.55;
          cursor: default;
        }
        .qr-unavailable-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.07);
          color: #6a6050;
          border: 1px solid rgba(255,255,255,0.1);
          margin-top: 6px;
        }
        .qr-unit-label {
          font-size: 11px;
          color: #8a8070;
          font-weight: 300;
          margin-left: 4px;
          letter-spacing: 0.03em;
        }
        .qr-modal-unavailable {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
          color: #6a6050;
          border: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 16px;
        }
        /* ── SCROLLBAR ── */
        .qr-modal::-webkit-scrollbar { width: 4px; }
        .qr-modal::-webkit-scrollbar-track { background: transparent; }
        .qr-modal::-webkit-scrollbar-thumb { background: rgba(212,175,90,0.2); border-radius: 2px; }

        /* ── DRAG HANDLE ── */
        .qr-drag-handle {
          width: 36px;
          height: 4px;
          background: rgba(255,255,255,0.12);
          border-radius: 2px;
          margin: 12px auto 0;
        }
      `}</style>

      <div className="qr-root">
        {/* HEADER */}
        <header className="qr-header">
          <div className="qr-header-top">
            <div>
              <h1 className="qr-restaurant-name">{restaurant.name}</h1>
              {restaurant.address && (
                <p className="qr-restaurant-address">{restaurant.address.split('\n')[0]}</p>
              )}
            </div>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="qr-lang-select"
            >
              {languages.map(lang => {
                const flags = {es:'🇪🇸',en:'🇬🇧',fr:'🇫🇷',de:'🇩🇪',it:'🇮🇹',pt:'🇵🇹',nl:'🇳🇱',zh:'🇨🇳',ja:'🇯🇵',ar:'🇸🇦',ru:'🇷🇺',ca:'🏴',eu:'🏴',gl:'🏴'};
                return (
                  <option key={lang.code} value={lang.code}>
                    {flags[lang.code] || '🌐'} {lang.code.toUpperCase()}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search */}
          <div className="qr-search-wrap">
            <span className="qr-search-icon">🔍</span>
            <input
              type="text"
              placeholder={getText('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="qr-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="qr-search-clear">✕</button>
            )}
          </div>

          {/* Category nav pills */}
          {!searchQuery && filteredCategories.length > 1 && (
            <nav className="qr-cat-nav">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`qr-cat-pill${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => scrollToCategory(cat.id)}
                >
                  {cat.name[language] || cat.name.es}
                </button>
              ))}
            </nav>
          )}
        </header>

        {/* MAIN */}
        <main className="qr-main">
          {filteredCategories.length === 0 ? (
            <div className="qr-empty">
              <p className="qr-empty-text">{getText('noResults')}</p>
              <button onClick={() => setSearchQuery('')} className="qr-empty-btn">
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            filteredCategories.map(category => (
              <section key={category.id} id={`cat-${category.id}`} className="qr-cat-section">
                <div className="qr-cat-header">
                  <h2 className="qr-cat-title">
                    {category.name[language] || category.name.es}
                  </h2>
                  <div className="qr-cat-line" />
                </div>

                {category.items.map(item => (
                  <div
                    key={item.id}
                    className={`qr-item-card${!item.available ? ' unavailable' : ''}`}
                    onClick={() => item.available && openItem(item, category.id)}
                  >
                    {item.image_url ? (
                      <div className="qr-item-img-wrap">
                        <img
                          src={item.image_url}
                          alt={item.name[language] || item.name.es}
                          className="qr-item-img"
                        />
                      </div>
                    ) : null}

                    <div className="qr-item-body">
                      <div>
                        <div className="qr-item-top">
                          <h3 className="qr-item-name">
                            {item.name[language] || item.name.es}
                          </h3>
                          <div style={{textAlign:'right'}}>
                            <span className="qr-item-price">
                              {item.price.toFixed(2)}{item.currency || '€'}
                            </span>
                            {item.price_type === 'per_unit' && (
                              <div className="qr-unit-label">{item.unit_label || 'ud.'}</div>
                            )}
                          </div>
                        </div>
                        {!item.available && (
                          <span className="qr-unavailable-badge">{getText('unavailable')}</span>
                        )}
                        {(item.description[language] || item.description.es) && (
                          <p className="qr-item-desc">
                            {item.description[language] || item.description.es}
                          </p>
                        )}
                      </div>
                      {item.allergens?.length > 0 && (
                        <div className="qr-item-bottom">
                          {item.allergens.slice(0, 3).map((a, i) => (
                            <span key={i} className="qr-allergen">{a.trim()}</span>
                          ))}
                          {item.allergens.length > 3 && (
                            <span className="qr-allergen-more">+{item.allergens.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            ))
          )}
        </main>

        {/* FLOATING BUTTONS */}
        <div className="qr-floating">
          <button
            className="qr-info-btn"
            onClick={() => setSelectedItem('info')}
            title={getText('information')}
          >
            ℹ️
          </button>
          {restaurant.google_place_id && (
            <button className="qr-review-btn" onClick={openGoogleReview}>
              ⭐ {getText('rateUs')}
            </button>
          )}
        </div>

        {/* MODAL PLATO */}
        {selectedItem && selectedItem !== 'info' && (
          <div className="qr-overlay" onClick={closeItem}>
            <div className="qr-modal" onClick={e => e.stopPropagation()}>
              <div className="qr-drag-handle" />
              {selectedItem.image_url && (
                <div className="qr-modal-img-wrap">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name[language] || selectedItem.name.es}
                    className="qr-modal-img"
                  />
                  <div className="qr-modal-img-overlay" />
                </div>
              )}
              <div className="qr-modal-body">
                <button className="qr-modal-close" onClick={closeItem}>✕</button>
                <h2 className="qr-modal-title">
                  {selectedItem.name[language] || selectedItem.name.es}
                </h2>
                <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'16px'}}>
                  <span className="qr-modal-price" style={{margin:0}}>{selectedItem.price.toFixed(2)}{selectedItem.currency || '€'}</span>
                  {selectedItem.price_type === 'per_unit' && (
                    <span className="qr-unit-label" style={{fontSize:'14px',display:'block',marginLeft:0,marginTop:'2px'}}>{selectedItem.unit_label || 'por unidad'}</span>
                  )}
                </div>
                {!selectedItem.available && (
                  <span className="qr-modal-unavailable">⊘ {getText('unavailable')}</span>
                )}
                {(selectedItem.description[language] || selectedItem.description.es) && (
                  <p className="qr-modal-desc">
                    {selectedItem.description[language] || selectedItem.description.es}
                  </p>
                )}
                {selectedItem.allergens?.length > 0 && (
                  <>
                    <div className="qr-modal-divider" />
                    <p className="qr-modal-allergens-title">⚠ {getText('allergens')}</p>
                    <div className="qr-modal-allergens-list">
                      {selectedItem.allergens.map((a, i) => (
                        <span key={i} className="qr-modal-allergen">{a.trim()}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL INFO */}
        {selectedItem === 'info' && (
          <div className="qr-overlay" onClick={() => setSelectedItem(null)}>
            <div className="qr-modal" onClick={e => e.stopPropagation()}>
              <div className="qr-drag-handle" />
              <div className="qr-modal-body">
                <button className="qr-modal-close" onClick={() => setSelectedItem(null)}>✕</button>
                <h2 className="qr-modal-title" style={{ marginBottom: '24px' }}>
                  {getText('information')}
                </h2>
                <div className="qr-info-list">
                  <div className="qr-info-row">
                    <div className="qr-info-icon">🏪</div>
                    <div>
                      <div className="qr-info-label">{getText('restaurant')}</div>
                      <div className="qr-info-val">{restaurant.name}</div>
                    </div>
                  </div>
                  {restaurant.phone && (
                    <div className="qr-info-row">
                      <div className="qr-info-icon">📞</div>
                      <div>
                        <div className="qr-info-label">{getText('phone')}</div>
                        <a href={`tel:${restaurant.phone}`} className="qr-info-link">{restaurant.phone}</a>
                      </div>
                    </div>
                  )}
                  {restaurant.address && (
                    <div className="qr-info-row">
                      <div className="qr-info-icon">📍</div>
                      <div>
                        <div className="qr-info-label">{getText('address')}</div>
                        <div className="qr-info-val">{restaurant.address}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}