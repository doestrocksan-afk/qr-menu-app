import test from 'node:test';
import assert from 'node:assert/strict';
import { getMenuData } from '../lib/wordpress.js';

test('WordPress boundary: fresh requests, suspension, outage and malformed response', async () => {
  const previousFetch = globalThis.fetch;
  const previousUrl = process.env.WORDPRESS_URL;
  process.env.WORDPRESS_URL = 'https://easydishmenu.com';
  try {
    let calls = 0;
    globalThis.fetch = async (url, options) => {
      calls++;
      assert.equal(String(url), 'https://easydishmenu.com/wp-json/qrmenu/v1/menu/demo');
      assert.equal(options.cache, 'no-store');
      assert.equal(options.redirect, 'error');
      return Response.json({ restaurant: { id: 1 }, categories: [] });
    };
    assert.equal(await getMenuData('../admin'), null);
    assert.equal(calls, 0);
    assert.equal((await getMenuData('demo')).restaurant.id, 1);
    globalThis.fetch = async () => new Response('', { status: 403 });
    assert.equal(await getMenuData('demo'), null);
    globalThis.fetch = async () => new Response('', { status: 404 });
    assert.equal(await getMenuData('missing'), null);
    globalThis.fetch = async () => new Response('', { status: 500 });
    await assert.rejects(getMenuData('demo'), /temporarily unavailable/);
    globalThis.fetch = async () => Response.json({ restaurant: { id: 1 } });
    await assert.rejects(getMenuData('demo'), /Invalid menu response/);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.WORDPRESS_URL;
    else process.env.WORDPRESS_URL = previousUrl;
  }
});
