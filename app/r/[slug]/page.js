import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import MenuTracker from '@/components/MenuTracker';
import MenuClient from './MenuClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getMenuData(slug) {
  try {
    const response = await fetch(
      `https://easydishmenu.com/wp-json/qrmenu/v1/menu/${slug}`,
      {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching menu:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const menuData = await getMenuData(slug);
  if (!menuData) {
    return { title: 'Menú no encontrado' };
  }
  return {
    title: `${menuData.restaurant.name} - Menú Digital`,
    description: `Menú digital de ${menuData.restaurant.name}. Consulta nuestros platos, precios y alérgenos.`,
    openGraph: {
      title: `${menuData.restaurant.name} - Menú Digital`,
      description: `Menú digital de ${menuData.restaurant.name}`,
    },
  };
}

export default async function MenuPage({ params }) {
  // Forzar que Vercel no cachee esta ruta
  headers();

  const { slug } = await params;
  const menuData = await getMenuData(slug);

  if (!menuData) notFound();

  return (
    <>
      <MenuTracker restaurantId={menuData.restaurant.id} />
      <MenuClient menuData={menuData} />
    </>
  );
}