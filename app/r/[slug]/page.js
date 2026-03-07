import MenuTracker from '@/components/MenuTracker';
import MenuClient from './MenuClient';

export const dynamic = 'force-dynamic';

async function getMenuData(slug) {
  const url = `https://easydishmenu.com/wp-json/qrmenu/v1/menu/${slug}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    const text = await response.text();

    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      json = null;
    }

    return {
      ok: response.ok,
      status: response.status,
      url,
      text,
      json,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      url,
      text: String(error),
      json: null,
    };
  }
}

export default async function MenuPage({ params }) {
  const result = await getMenuData(params.slug);

  if (!result.ok || !result.json || !result.json.restaurant) {
    return (
      <pre style={{ whiteSpace: 'pre-wrap', padding: '20px' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  }

  return (
    <>
      <MenuTracker restaurantId={result.json.restaurant.id} />
      <MenuClient menuData={result.json} />
    </>
  );
}