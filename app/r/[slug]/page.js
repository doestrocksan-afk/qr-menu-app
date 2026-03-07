import { notFound } from 'next/navigation';
import MenuTracker from '@/components/MenuTracker';
import MenuClient from './MenuClient';

// Esta función obtiene los datos del menú desde WordPress
async function getMenuData(slug) {
  try {
    const response = await fetch(
      `https://easydishmenu.com/wp-json/qrmenu/v1/menu/${slug}`,
      {
        next: { revalidate: 60 } // Cache por 1 minuto
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching menu:', error);
    return null;
  }
}

// Metadata dinámica para SEO
export async function generateMetadata({ params }) {
  const menuData = await getMenuData(params.slug);
  
  if (!menuData) {
    return {
      title: 'Menú no encontrado'
    };
  }
  
  return {
    title: `${menuData.restaurant.name} - Menú Digital`,
    description: `Menú digital de ${menuData.restaurant.name}. Consulta nuestros platos, precios y alérgenos.`,
    openGraph: {
      title: `${menuData.restaurant.name} - Menú Digital`,
      description: `Menú digital de ${menuData.restaurant.name}`,
    }
  };
}

export default async function MenuPage({ params }) {
  const menuData = await getMenuData(params.slug);
  
  if (!menuData) {
    notFound();
  }
  
  return (
    <>
      <MenuTracker restaurantId={menuData.restaurant.id} />
      <MenuClient menuData={menuData} />
    </>
  );
}