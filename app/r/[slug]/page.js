import { notFound } from 'next/navigation';
import { getMenuData } from '@/lib/wordpress';
import MenuClient from './MenuClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const menuData = await getMenuData(slug);
  if (!menuData) return { title: 'Menú no disponible' };
  return {
    title: `${menuData.restaurant.name} - Menú Digital`,
    description: `Consulta la carta de ${menuData.restaurant.name}: platos, precios y alérgenos.`,
  };
}
export default async function MenuPage({ params }) {
  const { slug } = await params;
  const menuData = await getMenuData(slug);
  if (!menuData) notFound();
  return <MenuClient menuData={menuData} />;
}
