'use client';

import { useState, useEffect } from 'react';

export default function MenuClient({ menuData }) {
  const [language, setLanguage]       = useState(menuData.restaurant.default_language || 'es');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [showWelcome, setShowWelcome]  = useState(false);
  const [mounted, setMounted]          = useState(false);
  const [photoZoom, setPhotoZoom]      = useState(null);

  const { restaurant, categories } = menuData;
  const activeLanguages = menuData.languages || [];
  const langFlags = { es:'🇪🇸', en:'🇬🇧', fr:'🇫🇷', de:'🇩🇪', it:'🇮🇹', pt:'🇵🇹', nl:'🇳🇱', zh:'🇨🇳', ja:'🇯🇵', ar:'🇸🇦', ru:'🇷🇺', ca:'🏴', eu:'🏴', gl:'🏴' };

  // Mapa alérgenos → archivo SVG en /allergens/
  const allergenMap = {
    gluten:    { es: 'Gluten',            file: 'IconoAlergenoGluten-Gluten_icon-icons.com_67600.svg' },
    lacteos:   { es: 'Lácteos',           file: 'IconoAlergenoLacteos-DairyProducts_icon-icons.com_67597.svg' },
    huevo:     { es: 'Huevo',             file: 'IconoAlergenoHuevo-Egg_icon-icons.com_67598.svg' },
    pescado:   { es: 'Pescado',           file: 'Fish_icon-icons.com_67594.svg' },
    cacahuete: { es: 'Cacahuete',         file: 'IconoAlergenoCacahuete-Peanuts_icon-icons.com_67604.svg' },
    soja:      { es: 'Soja',              file: 'Soy_icon-icons.com_67593.svg' },
    frutoscos: { es: 'Frutos de cáscara', file: 'IconoAlergenoFrutosCascaraPeelFruits_icon-icons.com_67601.svg' },
    apio:      { es: 'Apio',              file: 'IconoAlergenoApio-Celery_icon-icons.com_67605.svg' },
    mostaza:   { es: 'Mostaza',           file: 'IconoAlergenoMostaza-Mustard_icon-icons.com_67595.svg' },
    sesamo:    { es: 'Sésamo',            file: 'IconoAlergenoGranosSesamo-SesameGrains_icon-icons.com_67599.svg' },
    sulfitos:  { es: 'Sulfitos',          file: 'IconoAlergenoDioxidoAzufreSulfitosSulfurDioxideSulphites_icon-icons.com_67602.svg' },
    moluscos:  { es: 'Moluscos',          file: 'IconoAlergenoMoluscos-Mollusks_icon-icons.com_67596.svg' },
    crustaceo: { es: 'Crustáceos',        file: 'IconoAlergenoCrustaceo-Crustaceans_icon-icons.com_67603.svg' },
    altramuz:  { es: 'Altramuces',        file: 'IconoAlergenoAltramuces-Lupins_icon-icons.com_67606.svg' },
  };
  const getAllergenImg = (code) => {
    const a = allergenMap[code.trim().toLowerCase()];
    return a ? `/allergens/${a.file}` : null;
  };
  const getAllergenName = (code) => allergenMap[code.trim().toLowerCase()]?.es || code;

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
      window.menuTracker.itemClick(item.id, getLang(item.name), categoryId);
      window.menuTracker.itemOpen(item.id, getLang(item.name));
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

  // filteredCategories — declarado abajo tras getLang

  // Textos estáticos por idioma (completos)
  const staticTexts = {
    search:      { es:'Buscar en la carta...', en:'Search menu...', fr:'Rechercher...', de:'Suchen...', it:'Cerca...', pt:'Pesquisar...', nl:'Zoeken...', zh:'搜索...', ja:'検索...', ar:'بحث...', ru:'Поиск...', ca:'Cercar...', eu:'Bilatu...', gl:'Buscar...' },
    noResults:   { es:'Sin resultados', en:'No results', fr:'Aucun résultat', de:'Keine Ergebnisse', it:'Nessun risultato', pt:'Sem resultados', nl:'Geen resultaten', zh:'无结果', ja:'結果なし', ar:'لا نتائج', ru:'Нет результатов', ca:'Sense resultats', eu:'Emaitzarik ez', gl:'Sen resultados' },
    information: { es:'Información', en:'Information', fr:'Informations', de:'Informationen', it:'Informazioni', pt:'Informações', nl:'Informatie', zh:'信息', ja:'情報', ar:'معلومات', ru:'Информация', ca:'Informació', eu:'Informazioa', gl:'Información' },
    restaurant:  { es:'Restaurante', en:'Restaurant', fr:'Restaurant', de:'Restaurant', it:'Ristorante', pt:'Restaurante', nl:'Restaurant', zh:'餐厅', ja:'レストラン', ar:'مطعم', ru:'Ресторан', ca:'Restaurant', eu:'Jatetxea', gl:'Restaurante' },
    phone:       { es:'Teléfono', en:'Phone', fr:'Téléphone', de:'Telefon', it:'Telefono', pt:'Telefone', nl:'Telefoon', zh:'电话', ja:'電話', ar:'هاتف', ru:'Телефон', ca:'Telèfon', eu:'Telefonoa', gl:'Teléfono' },
    address:     { es:'Dirección', en:'Address', fr:'Adresse', de:'Adresse', it:'Indirizzo', pt:'Endereço', nl:'Adres', zh:'地址', ja:'住所', ar:'عنوان', ru:'Адрес', ca:'Adreça', eu:'Helbidea', gl:'Enderezo' },
    allergens:   { es:'Alérgenos', en:'Allergens', fr:'Allergènes', de:'Allergene', it:'Allergeni', pt:'Alergénios', nl:'Allergenen', zh:'过敏原', ja:'アレルゲン', ar:'مسببات الحساسية', ru:'Аллергены', ca:'Al·lèrgens', eu:'Alergenoak', gl:'Alérxenos' },
    schedule:    { es:'Horario', en:'Opening hours', fr:'Horaires', de:'Öffnungszeiten', it:'Orari', pt:'Horário', nl:'Openingstijden', zh:'营业时间', ja:'営業時間', ar:'أوقات العمل', ru:'Часы работы', ca:'Horari', eu:'Ordutegia', gl:'Horario' },
    followUs:    { es:'Síguenos', en:'Follow us', fr:'Suivez-nous', de:'Folgen Sie uns', it:'Seguici', pt:'Siga-nos', nl:'Volg ons', zh:'关注我们', ja:'フォロー', ar:'تابعنا', ru:'Следите', ca:'Segueix-nos', eu:'Jarraitu', gl:'Séguenos' },
    web:         { es:'Página web', en:'Website', fr:'Site web', de:'Webseite', it:'Sito web', pt:'Site', nl:'Website', zh:'网站', ja:'ウェブサイト', ar:'موقع', ru:'Сайт', ca:'Web', eu:'Webgunea', gl:'Web' },
    closed:      { es:'Cerrado', en:'Closed', fr:'Fermé', de:'Geschlossen', it:'Chiuso', pt:'Fechado', nl:'Gesloten', zh:'休息', ja:'定休日', ar:'مغلق', ru:'Закрыто', ca:'Tancat', eu:'Itxita', gl:'Pechado' },
  };
  // Traducciones personalizadas de la BD (search_placeholder, unavailable_badge, allergens_label)
  const langObj = activeLanguages.find(l => l.code === language) || activeLanguages[0];
  const customTrans = langObj?.translations || {};
  // Idioma de fallback: primer idioma activo
  const fallbackLang = activeLanguages[0]?.code || 'es';

  // Obtener texto del campo en el idioma actual, con fallback al primer idioma activo y luego a cualquiera
  const getLang = (obj) => {
    if (!obj) return '';
    return obj[language] || obj[fallbackLang] || Object.values(obj).find(v => v) || '';
  };

  const getText = (key) => {
    if (key === 'search' && customTrans.search_placeholder) return customTrans.search_placeholder;
    if (key === 'allergens' && customTrans.allergens_label) return customTrans.allergens_label;
    return staticTexts[key]?.[language] || staticTexts[key]?.[fallbackLang] || staticTexts[key]?.es || '';
  };
  const getUnavailableText = () => customTrans.unavailable_badge || staticTexts.noResults?.[language] || 'No disponible';

  const filteredCategories = (searchQuery.trim()
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => {
          const name = (getLang(item.name) || '').toLowerCase();
          const desc = (getLang(item.description) || '').toLowerCase();
          return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
        })
      }))
    : categories
  ).filter(cat => cat.items.length > 0);

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
        .qr-allergen-icons { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
        .qr-allergen-mini { width: 18px; height: 18px; object-fit: contain; opacity: 0.75; }
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
        .qr-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (min-width: 600px) { .qr-modal { max-height: 85vh !important; } }
        .qr-modal { background: ${modalBg}; border-radius: 20px; width: 100%; max-width: 600px; max-height: 92vh; overflow-y: auto; border: 1px solid ${border}; animation: slideUp 0.25s cubic-bezier(0.32,0.72,0,1); }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .qr-modal-img-wrap { width: 100%; height: 260px; overflow: hidden; border-radius: 20px 20px 0 0; position: relative; cursor: zoom-in; }
        .qr-modal-img { width: 100%; height: 100%; object-fit: cover; }
        .qr-modal-img-overlay { position: absolute; bottom: 0; left: 0; right: 0; height: 80px; background: linear-gradient(to top, ${modalBg}, transparent); }
        .qr-modal-body { padding: 24px; position: relative; }
        .qr-photo-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; cursor: zoom-out; animation: fadeIn 0.2s ease; }
        .qr-photo-lightbox img { max-width: 100%; max-height: 90vh; border-radius: 12px; object-fit: contain; animation: slideUp 0.2s ease; }
        .qr-photo-close { position: fixed; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .qr-modal-close { position: absolute; top: 20px; right: 20px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid ${border}; background: ${isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'}; color: ${textSecond}; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .qr-modal-title { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: ${textPrimary}; line-height: 1.2; margin: 0 40px 10px 0; }
        .qr-modal-price { font-size: 28px; font-weight: 700; color: ${themeColor}; margin-bottom: 16px; }
        .qr-modal-desc { font-size: 15px; color: ${textSecond}; font-weight: 300; line-height: 1.7; margin-bottom: 24px; }
        .qr-modal-divider { height: 1px; background: ${border}; margin-bottom: 20px; }
        .qr-modal-allergens-title { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${textSecond}; margin-bottom: 12px; }
        .qr-modal-allergens-list { display: flex; gap: 8px; flex-wrap: wrap; }
        .qr-allergen-icon-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .qr-allergen-icon { width: 36px; height: 36px; object-fit: contain; opacity: 0.85; }
        .qr-allergen-icon-label { font-size: 10px; font-weight: 600; color: ${textSecond}; text-align: center; line-height: 1.2; }
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
              {activeLanguages.map(l => (
                <option key={l.code} value={l.code}>
                  {langFlags[l.code] || '🌐'} {l.code.toUpperCase()}
                </option>
              ))}
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
                  {getLang(cat.name)}
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
                  <h2 className="qr-cat-title">{getLang(category.name)}</h2>
                  <div className="qr-cat-line" />
                </div>
                {category.items.map(item => (
                  <div key={item.id}
                    className={`qr-item-card${!item.available ? ' unavailable' : ''}`}
                    onClick={() => item.available && openItem(item, category.id)}>
                    {item.image_url && (
                      <div className="qr-item-img-wrap">
                        <img src={item.image_url.replace('http://', 'https://')} alt={getLang(item.name)} className="qr-item-img"
                             onError={(e) => { e.target.closest('.qr-item-img-wrap').style.display='none'; }} />
                      </div>
                    )}
                    <div className="qr-item-body">
                      <div>
                        <div className="qr-item-top">
                          <h3 className="qr-item-name">{getLang(item.name)}</h3>
                          <div style={{textAlign:'right'}}>
                            <span className="qr-item-price">{formatPrice(item)}</span>
                            {item.price_type === 'per_unit' && (
                              <span className="qr-unit-label">{item.unit_label || 'ud.'}</span>
                            )}
                          </div>
                        </div>
                        {!item.available && <span className="qr-unavailable-badge">No disponible</span>}
                        {getLang(item.description) && (
                          <p className="qr-item-desc">{getLang(item.description)}</p>
                        )}
                      </div>
                      {item.allergens?.length > 0 && (
                        <div className="qr-allergen-icons">
                          {item.allergens.slice(0,5).map((a,i) => {
                            const src = getAllergenImg(a);
                            return src ? (
                              <img key={i} src={src} alt={getAllergenName(a)} title={getAllergenName(a)} className="qr-allergen-mini" />
                            ) : (
                              <span key={i} className="qr-allergen">{a.trim()}</span>
                            );
                          })}
                          {item.allergens.length > 5 && <span className="qr-allergen-more">+{item.allergens.length - 5}</span>}
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
                <div className="qr-modal-img-wrap" onClick={() => setPhotoZoom(selectedItem.image_url.replace('http://','https://'))}>
                  <img src={selectedItem.image_url.replace('http://', 'https://')} alt={getLang(selectedItem.name)} className="qr-modal-img"
                       onError={(e) => { e.target.closest('.qr-modal-img-wrap').style.display='none'; }} />
                  <div className="qr-modal-img-overlay" />
                  <div style={{position:'absolute',bottom:'12px',right:'12px',background:'rgba(0,0,0,0.5)',borderRadius:'6px',padding:'4px 8px',fontSize:'11px',color:'rgba(255,255,255,0.8)',pointerEvents:'none'}}>🔍 Ver foto</div>
                </div>
              )}
              <div className="qr-modal-body">
                <button className="qr-modal-close" onClick={closeItem}>✕</button>
                <h2 className="qr-modal-title">{getLang(selectedItem.name)}</h2>
                <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'16px'}}>
                  <span className="qr-modal-price" style={{margin:0}}>{formatPrice(selectedItem)}</span>
                  {selectedItem.price_type === 'per_unit' && (
                    <span className="qr-unit-label" style={{fontSize:'14px'}}>{selectedItem.unit_label || 'por unidad'}</span>
                  )}
                </div>
                {!selectedItem.available && <span className="qr-modal-unavailable">⊘ No disponible ahora</span>}
                {(getLang(selectedItem.description)) && (
                  <p className="qr-modal-desc">{getLang(selectedItem.description)}</p>
                )}
                {selectedItem.allergens?.length > 0 && (
                  <>
                    <div className="qr-modal-divider" />
                    <p className="qr-modal-allergens-title">⚠ {getText('allergens')}</p>
                    <div className="qr-modal-allergens-list">
                      {selectedItem.allergens.map((a, i) => {
                        const src = getAllergenImg(a);
                        return src ? (
                          <div key={i} className="qr-allergen-icon-wrap">
                            <img src={src} alt={getAllergenName(a)} className="qr-allergen-icon" />
                            <span className="qr-allergen-icon-label">{getAllergenName(a)}</span>
                          </div>
                        ) : (
                          <span key={i} className="qr-modal-allergen">{a.trim()}</span>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LIGHTBOX FOTO */}
        {photoZoom && (
          <div className="qr-photo-lightbox" onClick={() => setPhotoZoom(null)}>
            <button className="qr-photo-close" onClick={() => setPhotoZoom(null)}>✕</button>
            <img src={photoZoom} alt="" onClick={e => e.stopPropagation()} />
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