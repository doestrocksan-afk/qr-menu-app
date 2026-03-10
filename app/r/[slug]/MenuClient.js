'use client';

import { useState, useEffect } from 'react';

export default function MenuClient({ menuData }) {
  const [language, setLanguage]       = useState(menuData.restaurant.default_language || 'es');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [showWelcome, setShowWelcome]  = useState(false);
  const [mounted, setMounted]          = useState(false);

  const { restaurant, categories } = menuData;

  // Tema dinámico desde settings
  const themeColor = restaurant.theme_color || '#ff6b35';
  const themeMode  = restaurant.theme_mode || 'dark';
  const isDark     = themeMode === 'dark' || themeMode === 'custom';
  // En modo custom el fondo es el color elegido, si no hay usamos el oscuro por defecto
  const customBg   = themeMode === 'custom' && restaurant.theme_bg_color ? restaurant.theme_bg_color : null;
  const ctaColor   = restaurant.cta_color  || themeColor;
  const ctaText    = restaurant.cta_text   || 'Deja tu reseña';

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('menu-language');
    const defaultLang = menuData.restaurant.default_language || 'es';
    // Usar localStorage solo si ese idioma sigue activo en el menú
    const activeCodes = (menuData.languages || []).map(l => l.code);
    if (saved && activeCodes.includes(saved)) {
      setLanguage(saved);
    } else {
      setLanguage(defaultLang);
      localStorage.removeItem('menu-language');
    }
    // Mostrar welcome message solo si existe y no se ha visto hoy
    if (restaurant.welcome_message) {
      const today = new Date().toDateString();
      const seen  = localStorage.getItem('qrm-welcome-seen');
      if (seen !== today) { setShowWelcome(true); }
    }
  }, []);

  useEffect(() => {
    const link  = document.createElement('link');
    link.rel    = 'stylesheet';
    link.href   = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap';
    document.head.appendChild(link);
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem('qrm-welcome-seen', new Date().toDateString());
    setShowWelcome(false);
  };

  const changeLanguage = (newLang) => {
    if (window.menuTracker) window.menuTracker.languageChange(language, newLang);
    setLanguage(newLang);
    localStorage.setItem('menu-language', newLang);
  };

  const openItem = (item, categoryId) => {
    setSelectedItem(item);
    if (window.menuTracker) {
      window.menuTracker.itemClick(item.id, item.name[language] || item.name.es, categoryId);
      window.menuTracker.itemOpen(item.id, item.name[language] || item.name.es);
    }
  };

  const closeItem = () => {
    if (window.menuTracker) window.menuTracker.itemClose();
    setSelectedItem(null);
  };

  const openGoogleReview = () => {
    if (window.menuTracker) window.menuTracker.reviewClick();
    if (restaurant.google_place_id) {
      window.open(restaurant.google_place_id, '_blank');
    }
  };

  const filteredCategories = (searchQuery.trim()
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => {
          const name = (item.name[language] || item.name.es || '').toLowerCase();
          const desc = (item.description[language] || item.description.es || '').toLowerCase();
          return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
        })
      }))
    : categories
  ).filter(cat => cat.items.length > 0);

  const getText = (key) => {
    const texts = {
      search:      { es: 'Buscar en la carta...', en: 'Search menu...', fr: 'Rechercher...' },
      noResults:   { es: 'Sin resultados', en: 'No results', fr: 'Aucun résultat' },
      information: { es: 'Información', en: 'Information', fr: 'Informations' },
      restaurant:  { es: 'Restaurante', en: 'Restaurant', fr: 'Restaurant' },
      phone:       { es: 'Teléfono', en: 'Phone', fr: 'Téléphone' },
      address:     { es: 'Dirección', en: 'Address', fr: 'Adresse' },
      allergens:   { es: 'Alérgenos', en: 'Allergens', fr: 'Allergènes' },
      schedule:    { es: 'Horario', en: 'Opening hours', fr: 'Horaires' },
      followUs:    { es: 'Síguenos', en: 'Follow us', fr: 'Suivez-nous' },
      web:         { es: 'Página web', en: 'Website', fr: 'Site web' },
      closed:      { es: 'Cerrado', en: 'Closed', fr: 'Fermé' },
    };
    return texts[key]?.[language] || texts[key]?.es || '';
  };

  const scrollToCategory = (catId) => {
    const el = document.getElementById(`cat-${catId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveCategory(catId);
  };

  // Formatear precio con moneda del plato (o la del restaurante)
  const formatPrice = (item) => {
    const currency = item.currency || restaurant.default_currency || '€';
    // Si la moneda es símbolo, va antes o después según convención
    const afterSymbols = ['€', '£'];
    const price = item.price.toFixed(2);
    return afterSymbols.includes(currency)
      ? `${price}${currency}`
      : `${currency}${price}`;
  };

  // Horario
  const dayKeys   = ['lun','mar','mie','jue','vie','sab','dom'];
  const dayLabels = { es: ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],
                      en: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
                      fr: ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'] };
  const todayIdx  = (new Date().getDay() + 6) % 7; // 0=lun

  // Colores según tema
  const bg       = customBg ? customBg : (isDark ? '#0f0e0c' : '#f8f6f2');
  const surface  = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
  const border   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const textPrimary  = isDark ? '#f5efe0' : '#1a1510';
  const textSecond   = isDark ? '#8a8070' : '#6a6050';
  const headerBg     = isDark ? 'rgba(15,14,12,0.96)' : 'rgba(248,246,242,0.96)';
  const accentGold   = isDark ? '#d4af5a' : '#c49a3a';
  const inputBg      = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const modalBg      = isDark ? '#1a1814' : '#ffffff';

  // Hex to rgba helper
  const hexAlpha = (hex, a) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; }
        .qr-root { min-height: 100vh; background: ${bg}; color: ${textPrimary}; font-family: 'Lato', sans-serif; }

        /* ── WELCOME TOAST ── */
        .qr-welcome {
          position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
          z-index: 200; background: ${isDark ? '#2a2620' : '#fff'};
          border: 1px solid ${hexAlpha(themeColor, 0.4)};
          border-radius: 12px; padding: 14px 18px; max-width: 340px; width: calc(100% - 32px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.25); animation: slideDown .3s ease;
          display: flex; align-items: flex-start; gap: 12px;
        }
        @keyframes slideDown { from { opacity:0; transform: translateX(-50%) translateY(-16px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        .qr-welcome-text { flex: 1; font-size: 14px; line-height: 1.5; color: ${textPrimary}; }
        .qr-welcome-close { background: none; border: none; color: ${textSecond}; font-size: 18px; cursor: pointer; flex-shrink: 0; line-height: 1; }

        /* ── HEADER ── */
        .qr-header { position: sticky; top: 0; z-index: 50; background: ${headerBg}; backdrop-filter: blur(12px); border-bottom: 1px solid ${border}; }
        .qr-header-top { max-width: 720px; margin: 0 auto; padding: 16px 20px 12px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .qr-header-identity { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .qr-logo { width: 48px; height: 48px; border-radius: 10px; object-fit: contain; flex-shrink: 0; border: 1px solid ${border}; background: ${isDark?'rgba(255,255,255,0.05)':'#fff'}; }
        .qr-restaurant-name { font-family: 'Playfair Display', serif; font-size: clamp(19px,4.5vw,26px); font-weight: 700; color: ${textPrimary}; letter-spacing: 0.02em; line-height: 1.1; }
        .qr-restaurant-desc { margin-top: 2px; font-size: 12px; color: ${textSecond}; font-weight: 300; line-height: 1.3; }
        .qr-lang-select { padding: 7px 10px; background: transparent; border: 1px solid ${hexAlpha(themeColor, 0.4)}; border-radius: 6px; color: ${themeColor}; font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; cursor: pointer; outline: none; flex-shrink: 0; }
        .qr-lang-select option { background: ${isDark ? '#1a1814' : '#fff'}; color: ${textPrimary}; }

        /* Search */
        .qr-search-wrap { max-width: 720px; margin: 0 auto; padding: 0 20px 14px; position: relative; }

        .qr-search-input { width: 100%; padding: 10px 36px 10px 16px; background: ${inputBg}; border: 1px solid ${border}; border-radius: 8px; color: ${textPrimary}; font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 300; outline: none; transition: border-color 0.2s; }
        .qr-search-input::placeholder { color: ${textSecond}; }
        .qr-search-input:focus { border-color: ${hexAlpha(themeColor, 0.5)}; }
        .qr-search-clear { position: absolute; right: 28px; top: 50%; transform: translateY(-50%); background: none; border: none; color: ${textSecond}; font-size: 16px; cursor: pointer; padding: 4px; }

        /* Category nav */
        .qr-cat-nav { max-width: 720px; margin: 0 auto; padding: 0 20px 12px; display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
        .qr-cat-nav::-webkit-scrollbar { display: none; }
        .qr-cat-pill { flex-shrink: 0; padding: 6px 14px; border-radius: 20px; border: 1px solid ${hexAlpha(themeColor, 0.25)}; background: transparent; color: ${textSecond}; font-family: 'Lato', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .qr-cat-pill:hover, .qr-cat-pill.active { background: ${themeColor}; border-color: ${themeColor}; color: #fff; }

        /* Main */
        .qr-main { max-width: 720px; margin: 0 auto; padding: 32px 20px 140px; }

        /* Category section */
        .qr-cat-section { margin-bottom: 48px; }
        .qr-cat-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .qr-cat-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; color: ${textPrimary}; letter-spacing: 0.02em; white-space: nowrap; }
        .qr-cat-line { flex: 1; height: 1px; background: linear-gradient(to right, ${hexAlpha(themeColor, 0.4)}, transparent); }

        /* Item card */
        .qr-item-card { display: flex; align-items: stretch; background: ${surface}; border: 1px solid ${border}; border-radius: 12px; overflow: hidden; cursor: pointer; transition: background 0.2s, border-color 0.2s, transform 0.15s; margin-bottom: 12px; }
        .qr-item-card:hover { background: ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)'}; border-color: ${hexAlpha(themeColor, 0.3)}; transform: translateY(-1px); }
        .qr-item-img-wrap { width: 110px; flex-shrink: 0; overflow: hidden; }
        .qr-item-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .qr-item-no-img { width: 110px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: ${isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.02)'}; border-right: 1px solid ${border}; }
        .qr-item-no-img-icon { font-size: 28px; opacity: 0.15; }
        .qr-item-body { flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; min-height: 90px; }
        .qr-item-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .qr-item-name { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; color: ${textPrimary}; line-height: 1.25; }
        .qr-item-price { font-size: 16px; font-weight: 700; color: ${themeColor}; letter-spacing: 0.02em; flex-shrink: 0; }
        .qr-item-desc { margin-top: 6px; font-size: 13px; color: ${textSecond}; font-weight: 300; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .qr-item-bottom { margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; }
        .qr-allergen { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; background: ${hexAlpha(themeColor, 0.1)}; color: ${themeColor}; border: 1px solid ${hexAlpha(themeColor, 0.2)}; }
        .qr-allergen-more { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: ${isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'}; color: ${textSecond}; }
        .qr-item-card.unavailable { opacity: 0.55; cursor: default; }
        .qr-unavailable-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; background: ${isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)'}; color: ${textSecond}; margin-top: 6px; }
        .qr-unit-label { font-size: 11px; color: ${textSecond}; font-weight: 300; margin-left: 4px; }

        /* Empty */
        .qr-empty { text-align: center; padding: 80px 20px; }
        .qr-empty-text { font-family: 'Playfair Display', serif; font-style: italic; font-size: 20px; color: ${textSecond}; margin-bottom: 20px; }
        .qr-empty-btn { padding: 10px 24px; border-radius: 6px; border: 1px solid ${hexAlpha(themeColor, 0.4)}; background: transparent; color: ${themeColor}; font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; cursor: pointer; text-transform: uppercase; }

        /* Floating */
        /* Barra inferior — reseña + info juntos y centrados */
        .qr-action-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 40; display: flex; justify-content: center; align-items: center; gap: 10px; padding: 12px 16px 20px; background: linear-gradient(to top, ${isDark?'rgba(15,14,12,0.97)':'rgba(248,246,242,0.97)'} 60%, transparent); }
        .qr-review-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 99px; border: none; background: ${ctaColor}; color: #fff; font-family: 'Lato', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.03em; cursor: pointer; box-shadow: 0 4px 20px ${hexAlpha(ctaColor, 0.5)}; transition: opacity 0.2s, transform 0.15s; }
        .qr-review-btn:hover { opacity: .9; transform: translateY(-1px); }
        .qr-info-btn { width: 48px; height: 48px; border-radius: 50%; border: 1px solid ${border}; background: ${isDark?'rgba(30,28,24,0.95)':'rgba(255,255,255,0.95)'}; color: ${textSecond}; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); transition: border-color 0.2s; flex-shrink: 0; }
        .qr-info-btn:hover { border-color: ${hexAlpha(themeColor,0.5)}; color: ${themeColor}; }

        /* Modal */
        .qr-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (min-width: 600px) { .qr-overlay { align-items: center; padding: 16px; } .qr-modal { border-radius: 16px !important; max-height: 85vh !important; } }
        .qr-modal { background: ${modalBg}; border-radius: 20px 20px 0 0; width: 100%; max-width: 600px; max-height: 92vh; overflow-y: auto; border: 1px solid ${border}; animation: slideUp 0.25s cubic-bezier(0.32,0.72,0,1); }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .qr-modal-img-wrap { width: 100%; height: 260px; overflow: hidden; border-radius: 20px 20px 0 0; position: relative; }
        .qr-modal-img { width: 100%; height: 100%; object-fit: cover; }
        .qr-modal-img-overlay { position: absolute; bottom: 0; left: 0; right: 0; height: 80px; background: linear-gradient(to top, ${modalBg}, transparent); }
        .qr-modal-body { padding: 24px; position: relative; }
        .qr-modal-close { position: absolute; top: 20px; right: 20px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid ${border}; background: ${isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'}; color: ${textSecond}; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .qr-modal-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: ${textPrimary}; line-height: 1.2; margin: 0 40px 10px 0; }
        .qr-modal-price { font-size: 28px; font-weight: 700; color: ${themeColor}; margin-bottom: 16px; }
        .qr-modal-desc { font-size: 15px; color: ${textSecond}; font-weight: 300; line-height: 1.7; margin-bottom: 24px; }
        .qr-modal-divider { height: 1px; background: ${border}; margin-bottom: 20px; }
        .qr-modal-allergens-title { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${textSecond}; margin-bottom: 12px; }
        .qr-modal-allergens-list { display: flex; gap: 8px; flex-wrap: wrap; }
        .qr-modal-allergen { padding: 6px 14px; border-radius: 6px; background: ${hexAlpha(themeColor, 0.08)}; border: 1px solid ${hexAlpha(themeColor, 0.2)}; color: ${themeColor}; font-size: 13px; font-weight: 700; }
        .qr-modal-unavailable { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 4px; background: ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)'}; color: ${textSecond}; margin-bottom: 16px; }

        /* Info modal */
        .qr-info-list { display: flex; flex-direction: column; gap: 12px; }
        .qr-info-row { display: flex; gap: 14px; align-items: flex-start; padding: 14px; background: ${surface}; border-radius: 10px; border: 1px solid ${border}; }
        .qr-info-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
        .qr-info-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${textSecond}; margin-bottom: 4px; }
        .qr-info-val { font-size: 15px; color: ${textPrimary}; font-weight: 400; }
        .qr-info-link { font-size: 15px; color: ${themeColor}; text-decoration: none; font-weight: 600; }

        /* Schedule table */
        .qr-schedule-row { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; }
        .qr-schedule-row.today { font-weight: 700; color: ${themeColor}; }
        .qr-schedule-closed { color: ${textSecond}; font-style: italic; }

        /* Social links */
        .qr-social-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .qr-social-link { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; background: ${surface}; border: 1px solid ${border}; color: ${textPrimary}; text-decoration: none; font-size: 13px; font-weight: 600; transition: border-color .2s; }
        .qr-social-link:hover { border-color: ${hexAlpha(themeColor, 0.5)}; color: ${themeColor}; }

        /* Drag handle */
        .qr-drag-handle { width: 36px; height: 4px; background: ${isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'}; border-radius: 2px; margin: 12px auto 0; }
        .qr-modal::-webkit-scrollbar { width: 4px; }
        .qr-modal::-webkit-scrollbar-track { background: transparent; }
        .qr-modal::-webkit-scrollbar-thumb { background: ${hexAlpha(themeColor, 0.2)}; border-radius: 2px; }
      `}</style>

      <div className="qr-root">

        {/* WELCOME TOAST */}
        {mounted && showWelcome && restaurant.welcome_message && (
          <div className="qr-welcome">
            <span className="qr-welcome-text">{restaurant.welcome_message}</span>
            <button className="qr-welcome-close" onClick={dismissWelcome}>✕</button>
          </div>
        )}

        {/* HEADER */}
        <header className="qr-header">
          <div className="qr-header-top">
            <div className="qr-header-identity">
              {restaurant.logo_url && (
                <img src={restaurant.logo_url} alt={restaurant.name} className="qr-logo" />
              )}
              <div>
                <h1 className="qr-restaurant-name">{restaurant.name}</h1>
                {restaurant.description && (
                  <p className="qr-restaurant-desc">{restaurant.description}</p>
                )}
              </div>
            </div>
            <select value={language} onChange={(e) => changeLanguage(e.target.value)} className="qr-lang-select">
              <option value="es">🇪🇸 ES</option>
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
          </div>

          {/* Search */}
          <div className="qr-search-wrap">

            <input type="text" placeholder={getText('search')} value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="qr-search-input" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="qr-search-clear">✕</button>}
          </div>

          {/* Category nav */}
          {!searchQuery && filteredCategories.length > 1 && (
            <nav className="qr-cat-nav">
              {filteredCategories.map(cat => (
                <button key={cat.id}
                  className={`qr-cat-pill${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => scrollToCategory(cat.id)}>
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
              <button onClick={() => setSearchQuery('')} className="qr-empty-btn">Limpiar búsqueda</button>
            </div>
          ) : (
            filteredCategories.map(category => (
              <section key={category.id} id={`cat-${category.id}`} className="qr-cat-section">
                <div className="qr-cat-header">
                  <h2 className="qr-cat-title">{category.name[language] || category.name.es}</h2>
                  <div className="qr-cat-line" />
                </div>
                {category.items.map(item => (
                  <div key={item.id}
                    className={`qr-item-card${!item.available ? ' unavailable' : ''}`}
                    onClick={() => item.available && openItem(item, category.id)}>
                    {item.image_url && (
                      <div className="qr-item-img-wrap">
                        <img src={item.image_url} alt={item.name[language] || item.name.es} className="qr-item-img" />
                      </div>
                    )}
                    <div className="qr-item-body">
                      <div>
                        <div className="qr-item-top">
                          <h3 className="qr-item-name">{item.name[language] || item.name.es}</h3>
                          <div style={{textAlign:'right'}}>
                            <span className="qr-item-price">{formatPrice(item)}</span>
                            {item.price_type === 'per_unit' && (
                              <span className="qr-unit-label">{item.unit_label || 'ud.'}</span>
                            )}
                          </div>
                        </div>
                        {!item.available && <span className="qr-unavailable-badge">No disponible</span>}
                        {(item.description[language] || item.description.es) && (
                          <p className="qr-item-desc">{item.description[language] || item.description.es}</p>
                        )}
                      </div>
                      {item.allergens?.length > 0 && (
                        <div className="qr-item-bottom">
                          {item.allergens.slice(0, 3).map((a, i) => <span key={i} className="qr-allergen">{a.trim()}</span>)}
                          {item.allergens.length > 3 && <span className="qr-allergen-more">+{item.allergens.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            ))
          )}
        </main>

        {/* BARRA INFERIOR — reseña + info juntos */}
        <div className="qr-action-bar">
          {restaurant.google_place_id && (
            <button className="qr-review-btn" onClick={openGoogleReview}>
              ⭐ {ctaText}
            </button>
          )}
          <button className="qr-info-btn" onClick={() => setSelectedItem('info')} title={getText('information')}>ℹ️</button>
        </div>

        {/* MODAL PLATO */}
        {selectedItem && selectedItem !== 'info' && (
          <div className="qr-overlay" onClick={closeItem}>
            <div className="qr-modal" onClick={e => e.stopPropagation()}>
              <div className="qr-drag-handle" />
              {selectedItem.image_url && (
                <div className="qr-modal-img-wrap">
                  <img src={selectedItem.image_url} alt={selectedItem.name[language] || selectedItem.name.es} className="qr-modal-img" />
                  <div className="qr-modal-img-overlay" />
                </div>
              )}
              <div className="qr-modal-body">
                <button className="qr-modal-close" onClick={closeItem}>✕</button>
                <h2 className="qr-modal-title">{selectedItem.name[language] || selectedItem.name.es}</h2>
                <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'16px'}}>
                  <span className="qr-modal-price" style={{margin:0}}>{formatPrice(selectedItem)}</span>
                  {selectedItem.price_type === 'per_unit' && (
                    <span className="qr-unit-label" style={{fontSize:'14px'}}>{selectedItem.unit_label || 'por unidad'}</span>
                  )}
                </div>
                {!selectedItem.available && <span className="qr-modal-unavailable">⊘ No disponible ahora</span>}
                {(selectedItem.description[language] || selectedItem.description.es) && (
                  <p className="qr-modal-desc">{selectedItem.description[language] || selectedItem.description.es}</p>
                )}
                {selectedItem.allergens?.length > 0 && (
                  <>
                    <div className="qr-modal-divider" />
                    <p className="qr-modal-allergens-title">⚠ {getText('allergens')}</p>
                    <div className="qr-modal-allergens-list">
                      {selectedItem.allergens.map((a, i) => <span key={i} className="qr-modal-allergen">{a.trim()}</span>)}
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
                <h2 className="qr-modal-title" style={{marginBottom:'24px'}}>{getText('information')}</h2>
                <div className="qr-info-list">

                  {/* Nombre */}
                  <div className="qr-info-row">
                    <div className="qr-info-icon">🏪</div>
                    <div>
                      <div className="qr-info-label">{getText('restaurant')}</div>
                      <div className="qr-info-val">{restaurant.name}</div>
                      {restaurant.description && <div style={{fontSize:'13px',marginTop:'4px',color:textSecond}}>{restaurant.description}</div>}
                    </div>
                  </div>

                  {/* Teléfono */}
                  {restaurant.phone && (
                    <div className="qr-info-row">
                      <div className="qr-info-icon">📞</div>
                      <div>
                        <div className="qr-info-label">{getText('phone')}</div>
                        <a href={`tel:${restaurant.phone}`} className="qr-info-link">{restaurant.phone}</a>
                      </div>
                    </div>
                  )}

                  {/* Dirección */}
                  {restaurant.address && (
                    <div className="qr-info-row">
                      <div className="qr-info-icon">📍</div>
                      <div>
                        <div className="qr-info-label">{getText('address')}</div>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                           target="_blank" rel="noopener noreferrer" className="qr-info-link">
                          {restaurant.address}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Horario */}
                  {restaurant.schedule && (
                    <div className="qr-info-row">
                      <div className="qr-info-icon">🕐</div>
                      <div style={{flex:1}}>
                        <div className="qr-info-label">{getText('schedule')}</div>
                        <div style={{marginTop:'6px'}}>
                          {dayKeys.map((d, i) => {
                            const s = restaurant.schedule[d];
                            if (!s) return null;
                            return (
                              <div key={d} className={`qr-schedule-row${i === todayIdx ? ' today' : ''}`}>
                                <span>{(dayLabels[language] || dayLabels.es)[i]}</span>
                                <span className={s.closed ? 'qr-schedule-closed' : ''}>
                                  {s.closed ? getText('closed') : `${s.open} – ${s.close}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Redes sociales */}
                  {(restaurant.website || restaurant.instagram || restaurant.facebook) && (
                    <div className="qr-info-row">
                      <div className="qr-info-icon">🔗</div>
                      <div style={{flex:1}}>
                        <div className="qr-info-label">{getText('followUs')}</div>
                        <div className="qr-social-row" style={{marginTop:'8px'}}>
                          {restaurant.website && (
                            <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="qr-social-link">
                              🌐 {getText('web')}
                            </a>
                          )}
                          {restaurant.instagram && (
                            <a href={`https://instagram.com/${restaurant.instagram}`} target="_blank" rel="noopener noreferrer" className="qr-social-link">
                              📸 Instagram
                            </a>
                          )}
                          {restaurant.facebook && (
                            <a href={`https://facebook.com/${restaurant.facebook}`} target="_blank" rel="noopener noreferrer" className="qr-social-link">
                              👤 Facebook
                            </a>
                          )}
                        </div>
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