'use client';

import { useState, useEffect } from 'react';

export default function MenuClient({ menuData }) {
  const [language, setLanguage] = useState('es');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const getText = (key) => {
    const texts = {
      search: { es: 'Buscar platos...', en: 'Search dishes...', fr: 'Rechercher...' },
      noResults: { es: 'No se encontraron platos', en: 'No dishes found', fr: 'Aucun plat trouvé' },
      information: { es: 'Información', en: 'Information', fr: 'Informations' },
      restaurant: { es: 'Restaurante', en: 'Restaurant', fr: 'Restaurant' },
      phone: { es: 'Teléfono', en: 'Phone', fr: 'Téléphone' },
      address: { es: 'Dirección', en: 'Address', fr: 'Adresse' },
      allergens: { es: 'Alérgenos', en: 'Allergens', fr: 'Allergènes' },
      rateUs: { es: 'Valóranos', en: 'Rate us', fr: 'Évaluez-nous' }
    };
    return texts[key]?.[language] || texts[key]?.es || '';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Título */}
          <div style={styles.titleSection}>
            <h1 style={styles.title}>{restaurant.name}</h1>
            {restaurant.address && (
              <p style={styles.subtitle}>
                <span style={styles.locationIcon}>📍</span>
                {restaurant.address.split('\n')[0]}
              </p>
            )}
          </div>
          
          {/* Selector de idioma */}
          <select 
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            style={styles.languageSelector}
          >
            <option value="es">🇪🇸 ES</option>
            <option value="en">🇬🇧 EN</option>
            <option value="fr">🇫🇷 FR</option>
          </select>
        </div>

        {/* Buscador */}
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder={getText('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* Contenido principal */}
      <main style={styles.main}>
        {filteredCategories.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>{getText('noResults')}</p>
            <button onClick={() => setSearchQuery('')} style={styles.clearSearchButton}>
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.id} style={styles.categorySection}>
              {/* Título de categoría */}
              <h2 style={styles.categoryTitle}>
                {category.name[language] || category.name.es}
              </h2>

              {/* Items */}
              <div style={styles.itemsGrid}>
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openItem(item, category.id)}
                    style={styles.itemCard}
                  >
                    {/* Imagen */}
                    {item.image_url && (
                      <div style={styles.imageContainer}>
                        <img
                          src={item.image_url}
                          alt={item.name[language] || item.name.es}
                          style={styles.itemImage}
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div style={styles.itemContent}>
                      <div style={styles.itemHeader}>
                        <h3 style={styles.itemName}>
                          {item.name[language] || item.name.es}
                        </h3>
                        <span style={styles.itemPrice}>
                          {item.price.toFixed(2)}€
                        </span>
                      </div>

                      {item.description[language] && (
                        <p style={styles.itemDescription}>
                          {item.description[language]}
                        </p>
                      )}

                      {/* Alérgenos */}
                      {item.allergens && item.allergens.length > 0 && (
                        <div style={styles.allergensContainer}>
                          {item.allergens.slice(0, 3).map((allergen, idx) => (
                            <span key={idx} style={styles.allergenBadge}>
                              ⚠ {allergen.trim()}
                            </span>
                          ))}
                          {item.allergens.length > 3 && (
                            <span style={styles.allergenMore}>
                              +{item.allergens.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Botones flotantes */}
      <div style={styles.floatingButtons}>
        {/* Botón Info */}
        <button
          onClick={() => setSelectedItem('info')}
          style={styles.infoButton}
          title={getText('information')}
        >
          ℹ️
        </button>

        {/* Botón Reseñas */}
        {restaurant.google_place_id && (
          <button
            onClick={openGoogleReview}
            style={styles.reviewButton}
          >
            ⭐ {getText('rateUs')}
          </button>
        )}
      </div>

      {/* Modal de plato */}
      {selectedItem && selectedItem !== 'info' && (
        <div style={styles.modalOverlay} onClick={closeItem}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Imagen */}
            {selectedItem.image_url && (
              <div style={styles.modalImageContainer}>
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name[language] || selectedItem.name.es}
                  style={styles.modalImage}
                />
              </div>
            )}

            <div style={styles.modalBody}>
              {/* Botón cerrar */}
              <button onClick={closeItem} style={styles.closeButton}>
                ✕
              </button>

              {/* Título */}
              <h2 style={styles.modalTitle}>
                {selectedItem.name[language] || selectedItem.name.es}
              </h2>

              {/* Precio */}
              <div style={styles.modalPrice}>
                {selectedItem.price.toFixed(2)}€
              </div>

              {/* Descripción */}
              {selectedItem.description[language] && (
                <p style={styles.modalDescription}>
                  {selectedItem.description[language]}
                </p>
              )}

              {/* Alérgenos */}
              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div style={styles.modalAllergens}>
                  <h3 style={styles.modalAllergensTitle}>
                    ⚠️ {getText('allergens')}
                  </h3>
                  <div style={styles.modalAllergensList}>
                    {selectedItem.allergens.map((allergen, idx) => (
                      <span key={idx} style={styles.modalAllergenBadge}>
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

      {/* Modal de info */}
      {selectedItem === 'info' && (
        <div style={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalBody}>
              {/* Botón cerrar */}
              <button onClick={() => setSelectedItem(null)} style={styles.closeButton}>
                ✕
              </button>

              <h2 style={styles.modalTitle}>{getText('information')}</h2>

              <div style={styles.infoList}>
                {/* Nombre */}
                <div style={styles.infoItem}>
                  <div style={styles.infoIcon}>🏪</div>
                  <div>
                    <div style={styles.infoLabel}>{getText('restaurant')}</div>
                    <div style={styles.infoValue}>{restaurant.name}</div>
                  </div>
                </div>

                {/* Teléfono */}
                {restaurant.phone && (
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>📞</div>
                    <div>
                      <div style={styles.infoLabel}>{getText('phone')}</div>
                      <a href={`tel:${restaurant.phone}`} style={styles.infoLink}>
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Dirección */}
                {restaurant.address && (
                  <div style={styles.infoItem}>
                    <div style={styles.infoIcon}>📍</div>
                    <div>
                      <div style={styles.infoLabel}>{getText('address')}</div>
                      <div style={styles.infoValue}>{restaurant.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos inline para control total del tamaño
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  locationIcon: {
    fontSize: '12px',
  },
  languageSelector: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    backgroundColor: 'white',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    outline: 'none',
  },
  searchContainer: {
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '0 16px 16px 16px',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '28px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '16px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 44px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  clearButton: {
    position: 'absolute',
    right: '28px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
  },
  main: {
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '24px 16px 120px 16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyText: {
    fontSize: '18px',
    color: '#64748b',
    marginBottom: '16px',
  },
  clearSearchButton: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#6366f1',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  categorySection: {
    marginBottom: '40px',
  },
  categoryTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '3px solid #6366f1',
    display: 'inline-block',
  },
  itemsGrid: {
    display: 'grid',
    gap: '16px',
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid #e2e8f0',
    display: 'flex',
    gap: '16px',
  },
  imageContainer: {
    width: '120px',
    height: '120px',
    flexShrink: 0,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemContent: {
    flex: 1,
    padding: '16px 16px 16px 0',
    display: 'flex',
    flexDirection: 'column',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '8px',
  },
  itemName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    flex: 1,
  },
  itemPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#6366f1',
    flexShrink: 0,
  },
  itemDescription: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 12px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.5',
  },
  allergensContainer: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: 'auto',
  },
  allergenBadge: {
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontWeight: '600',
  },
  allergenMore: {
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontWeight: '600',
  },
  floatingButtons: {
    position: 'fixed',
    bottom: '24px',
    right: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 40,
  },
  infoButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#334155',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  reviewButton: {
    padding: '12px 20px',
    borderRadius: '24px',
    border: 'none',
    backgroundColor: '#6366f1',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
  },
  modalImageContainer: {
    width: '100%',
    height: '300px',
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  modalBody: {
    padding: '24px',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#f1f5f9',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 40px 16px 0',
  },
  modalPrice: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: '16px',
  },
  modalDescription: {
    fontSize: '16px',
    color: '#475569',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  modalAllergens: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '24px',
  },
  modalAllergensTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '12px',
  },
  modalAllergensList: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  modalAllergenBadge: {
    padding: '8px 16px',
    borderRadius: '16px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    fontSize: '14px',
    fontWeight: '600',
    border: '2px solid #fde68a',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  infoItem: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
  },
  infoIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '600',
  },
  infoLink: {
    fontSize: '16px',
    color: '#6366f1',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

// Media queries para responsive
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media (hover: hover) {
      .item-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.15) !important;
      }
      .floating-button:hover {
        transform: scale(1.1);
      }
    }
    @media (max-width: 640px) {
      .modal-content {
        border-radius: 20px 20px 0 0 !important;
        align-self: flex-end !important;
      }
    }
  `;
  if (document.head) {
    document.head.appendChild(style);
  }
}