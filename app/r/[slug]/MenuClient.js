'use client';

import { useState, useEffect } from 'react';

export default function MenuClient({ menuData }) {
  const [language, setLanguage] = useState('es');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { restaurant, categories } = menuData;

  useEffect(() => {
    const saved = localStorage.getItem('menu-language');
    if (saved) setLanguage(saved);
  }, []);

  const changeLanguage = (newLang) => {
    if (window.menuTracker) {
      window.menuTracker.languageChange(language, newLang);
    }
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
    if (window.menuTracker) {
      window.menuTracker.itemClose();
    }
    setSelectedItem(null);
  };

  const openCategory = (categoryId, categoryName) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    if (window.menuTracker) {
      window.menuTracker.categoryOpen(categoryId, categoryName);
    }
  };

  const openGoogleReview = () => {
    if (window.menuTracker) {
      window.menuTracker.reviewClick();
    }
    if (restaurant.google_place_id) {
      window.open(
        `https://search.google.com/local/writereview?placeid=${restaurant.google_place_id}`,
        '_blank'
      );
    }
  };

  // Filtrar items por búsqueda
  const filteredCategories = searchQuery.trim() 
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => {
          const name = (item.name[language] || item.name.es || '').toLowerCase();
          const desc = (item.description[language] || item.description.es || '').toLowerCase();
          return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
        })
      })).filter(cat => cat.items.length > 0)
    : categories;

  const totalItems = filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Sticky con efecto glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Nombre del restaurante con gradiente */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                {restaurant.name}
              </h1>
              {restaurant.address && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span>📍</span> {restaurant.address.split('\n')[0]}
                </p>
              )}
            </div>
            
            {/* Selector de idioma mejorado */}
            <div className="relative">
              <select 
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="appearance-none bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-violet-200 text-violet-700 font-semibold px-4 py-2 pr-10 rounded-xl cursor-pointer transition-all hover:border-violet-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              >
                <option value="es">🇪🇸 ES</option>
                <option value="en">🇬🇧 EN</option>
                <option value="fr">🇫🇷 FR</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-violet-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Buscador mejorado */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {isSearching ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              placeholder={language === 'es' ? 'Buscar platos...' : language === 'en' ? 'Search dishes...' : 'Rechercher...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
                setTimeout(() => setIsSearching(false), 300);
              }}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Contador de resultados */}
          {searchQuery && (
            <p className="text-sm text-slate-600 mt-2 animate-fade-in">
              {totalItems === 0 
                ? (language === 'es' ? 'No se encontraron platos' : language === 'en' ? 'No dishes found' : 'Aucun plat trouvé')
                : `${totalItems} ${totalItems === 1 ? (language === 'es' ? 'plato' : language === 'en' ? 'dish' : 'plat') : (language === 'es' ? 'platos' : language === 'en' ? 'dishes' : 'plats')}`
              }
            </p>
          )}
        </div>
      </header>

      {/* Menú principal */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-500 text-lg">
              {language === 'es' ? 'No se encontraron platos' : language === 'en' ? 'No dishes found' : 'Aucun plat trouvé'}
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-violet-600 hover:text-violet-700 font-medium"
            >
              {language === 'es' ? 'Limpiar búsqueda' : language === 'en' ? 'Clear search' : 'Effacer la recherche'}
            </button>
          </div>
        ) : (
          filteredCategories.map((category, idx) => (
            <section key={category.id} className="mb-8 animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
              {/* Categoría con efecto acordeón */}
              <button
                onClick={() => openCategory(category.id, category.name[language] || category.name.es)}
                className="w-full group"
              >
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl shadow-md hover:shadow-lg transition-all mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(idx)}</span>
                    {category.name[language] || category.name.es}
                    <span className="text-sm font-normal opacity-90">({category.items.length})</span>
                  </h2>
                  <svg 
                    className={`w-6 h-6 text-white transition-transform ${selectedCategory === category.id ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Items de la categoría */}
              <div className={`grid gap-4 transition-all duration-300 ${selectedCategory === category.id || searchQuery ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={item.id}
                      onClick={() => openItem(item, category.id)}
                      className="mb-4 last:mb-0 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden border-2 border-transparent hover:border-violet-200 group animate-scale-in"
                      style={{animationDelay: `${itemIdx * 50}ms`}}
                    >
                      <div className="flex gap-4 p-4">
                        {/* Imagen con efecto zoom */}
                        {item.image_url && (
                          <div className="flex-shrink-0 relative overflow-hidden rounded-xl">
                            <img
                              src={item.image_url}
                              alt={item.name[language] || item.name.es}
                              className="w-28 h-28 md:w-32 md:h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {/* Overlay gradiente */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        )}

                        {/* Info del plato */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="font-bold text-slate-900 text-lg md:text-xl leading-tight">
                              {item.name[language] || item.name.es}
                            </h3>
                            <div className="flex-shrink-0 bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-3 py-1 rounded-full font-bold text-lg shadow-md">
                              {item.price.toFixed(2)}€
                            </div>
                          </div>

                          {item.description[language] && (
                            <p className="text-slate-600 text-sm md:text-base line-clamp-2 mb-2 leading-relaxed">
                              {item.description[language]}
                            </p>
                          )}

                          {/* Alérgenos como badges */}
                          {item.allergens && item.allergens.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {item.allergens.slice(0, 3).map((allergen, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-200"
                                >
                                  ⚠️ {allergen.trim()}
                                </span>
                              ))}
                              {item.allergens.length > 3 && (
                                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
                                  +{item.allergens.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Flecha indicadora */}
                        <div className="flex-shrink-0 self-center text-slate-300 group-hover:text-violet-500 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))
        )}
      </main>

      {/* Botones flotantes mejorados */}
      <div className="fixed bottom-6 right-4 flex flex-col gap-3 z-40">
        {/* Botón de info */}
        <button
          onClick={() => setSelectedItem('info')}
          className="bg-slate-700 hover:bg-slate-800 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95"
          title={language === 'es' ? 'Información' : language === 'en' ? 'Information' : 'Informations'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Botón de reseñas */}
        {restaurant.google_place_id && (
          <button
            onClick={openGoogleReview}
            className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white px-5 py-3 rounded-full shadow-2xl font-semibold flex items-center gap-2 transition-all hover:scale-110 active:scale-95"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="hidden sm:inline">
              {language === 'es' ? 'Valóranos' : language === 'en' ? 'Rate us' : 'Évaluez-nous'}
            </span>
          </button>
        )}
      </div>

      {/* Modal de plato mejorado */}
      {selectedItem && selectedItem !== 'info' && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={closeItem}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen destacada */}
            {selectedItem.image_url && (
              <div className="relative h-72 overflow-hidden">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name[language] || selectedItem.name.es}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Botón cerrar sobre la imagen */}
                <button
                  onClick={closeItem}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                >
                  <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="p-6 sm:p-8">
              {/* Header del modal sin imagen */}
              {!selectedItem.image_url && (
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-bold text-slate-900 pr-4">
                    {selectedItem.name[language] || selectedItem.name.es}
                  </h2>
                  <button
                    onClick={closeItem}
                    className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Título si hay imagen */}
              {selectedItem.image_url && (
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  {selectedItem.name[language] || selectedItem.name.es}
                </h2>
              )}

              {/* Precio destacado */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-6 py-3 rounded-2xl mb-6 shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-3xl font-bold">{selectedItem.price.toFixed(2)}€</span>
              </div>

              {/* Descripción */}
              {selectedItem.description[language] && (
                <div className="mb-6">
                  <p className="text-slate-700 text-lg leading-relaxed">
                    {selectedItem.description[language]}
                  </p>
                </div>
              )}

              {/* Alérgenos detallados */}
              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-lg">
                    <span>⚠️</span>
                    {language === 'es' ? 'Alérgenos' : language === 'en' ? 'Allergens' : 'Allergènes'}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedItem.allergens.map((allergen, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-amber-50 text-amber-800 rounded-xl font-medium border-2 border-amber-200"
                      >
                        {allergen.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de info mejorado */}
      {selectedItem === 'info' && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                {language === 'es' ? 'Información' : language === 'en' ? 'Information' : 'Informations'}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              {/* Nombre */}
              <div className="flex gap-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-600 text-sm mb-1">
                    {language === 'es' ? 'Restaurante' : language === 'en' ? 'Restaurant' : 'Restaurant'}
                  </h3>
                  <p className="text-slate-900 font-bold text-lg">{restaurant.name}</p>
                </div>
              </div>

              {/* Teléfono */}
              {restaurant.phone && (
                <div className="flex gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-600 text-sm mb-1">
                      {language === 'es' ? 'Teléfono' : language === 'en' ? 'Phone' : 'Téléphone'}
                    </h3>
                    <a href={`tel:${restaurant.phone}`} className="text-green-700 hover:text-green-800 font-bold text-lg">
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Dirección */}
              {restaurant.address && (
                <div className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-600 text-sm mb-1">
                      {language === 'es' ? 'Dirección' : language === 'en' ? 'Address' : 'Adresse'}
                    </h3>
                    <p className="text-slate-900 font-medium leading-relaxed">{restaurant.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Estilos de animaciones */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out backwards;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out backwards;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function getCategoryIcon(index) {
  const icons = ['🥗', '🍽️', '🍰', '🥤', '🍕', '🍜', '🍱', '🌮'];
  return icons[index % icons.length];
}