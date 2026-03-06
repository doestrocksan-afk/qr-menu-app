'use client';

import { useState, useEffect } from 'react';

export default function MenuClient({ menuData }) {
  const [language, setLanguage] = useState('es');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { restaurant, categories } = menuData;

  useEffect(() => {
    // Cargar idioma guardado
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

  const openItem = (item) => {
    setSelectedItem(item);
    if (window.menuTracker) {
      window.menuTracker.itemOpen(item.id, item.name[language] || item.name.es);
    }
  };

  const closeItem = () => {
    if (window.menuTracker) {
      window.menuTracker.itemClose();
    }
    setSelectedItem(null);
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
  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      const name = (item.name[language] || item.name.es || '').toLowerCase();
      const desc = (item.description[language] || item.description.es || '').toLowerCase();
      return name.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
    })
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-slate-900">{restaurant.name}</h1>
            
            {/* Selector de idioma */}
            <select 
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
          </div>

          {/* Buscador */}
          <input
            type="text"
            placeholder={language === 'es' ? 'Buscar plato...' : language === 'en' ? 'Search dish...' : 'Rechercher un plat...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      {/* Menú */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">
              {language === 'es' ? 'No se encontraron platos' : language === 'en' ? 'No dishes found' : 'Aucun plat trouvé'}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.id} className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-blue-500">
                {category.name[language] || category.name.es}
              </h2>

              <div className="grid gap-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openItem(item)}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-slate-200 hover:border-blue-300"
                  >
                    <div className="flex gap-4 p-4">
                      {/* Imagen */}
                      {item.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name[language] || item.name.es}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {item.name[language] || item.name.es}
                          </h3>
                          <span className="font-bold text-blue-600 text-lg flex-shrink-0">
                            {item.price.toFixed(2)}€
                          </span>
                        </div>

                        {item.description[language] && (
                          <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                            {item.description[language]}
                          </p>
                        )}

                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {item.allergens.map((allergen, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full"
                              >
                                {allergen.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Botón flotante de reseñas */}
      {restaurant.google_place_id && (
        <button
          onClick={openGoogleReview}
          className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2 transition-all hover:scale-105 z-40"
        >
          ⭐ {language === 'es' ? 'Valóranos' : language === 'en' ? 'Rate us' : 'Évaluez-nous'}
        </button>
      )}

      {/* Botón info del local */}
      <button
        onClick={() => setSelectedItem('info')}
        className="fixed bottom-4 right-4 bg-slate-700 hover:bg-slate-800 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 z-40"
      >
        ℹ️
      </button>

      {/* Modal de plato */}
      {selectedItem && selectedItem !== 'info' && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={closeItem}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.image_url && (
              <img
                src={selectedItem.image_url}
                alt={selectedItem.name[language] || selectedItem.name.es}
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedItem.name[language] || selectedItem.name.es}
                </h2>
                <button
                  onClick={closeItem}
                  className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              <p className="text-3xl font-bold text-blue-600 mb-4">
                {selectedItem.price.toFixed(2)}€
              </p>

              {selectedItem.description[language] && (
                <p className="text-slate-700 mb-4 leading-relaxed">
                  {selectedItem.description[language]}
                </p>
              )}

              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {language === 'es' ? 'Alérgenos' : language === 'en' ? 'Allergens' : 'Allergènes'}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedItem.allergens.map((allergen, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
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

      {/* Modal de info del local */}
      {selectedItem === 'info' && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {language === 'es' ? 'Información' : language === 'en' ? 'Information' : 'Informations'}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">
                  {language === 'es' ? 'Nombre' : language === 'en' ? 'Name' : 'Nom'}
                </h3>
                <p className="text-slate-900">{restaurant.name}</p>
              </div>

              {restaurant.phone && (
                <div>
                  <h3 className="font-semibold text-slate-700 mb-1">
                    {language === 'es' ? 'Teléfono' : language === 'en' ? 'Phone' : 'Téléphone'}
                  </h3>
                  <a href={`tel:${restaurant.phone}`} className="text-blue-600 hover:underline">
                    {restaurant.phone}
                  </a>
                </div>
              )}

              {restaurant.address && (
                <div>
                  <h3 className="font-semibold text-slate-700 mb-1">
                    {language === 'es' ? 'Dirección' : language === 'en' ? 'Address' : 'Adresse'}
                  </h3>
                  <p className="text-slate-900">{restaurant.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}