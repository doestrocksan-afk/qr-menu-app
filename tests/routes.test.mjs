import test from 'node:test';
import assert from 'node:assert/strict';
import { GET, POST } from '../app/api/events/route.js';
import { POST as webhook } from '../app/api/webhooks/wordpress/route.js';
test('Legacy analytics read and write endpoints disclose no data and do not write',async()=>{for(const handler of [GET,POST]){const response=handler();assert.equal(response.status,410);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.ok(!(await response.json()).raw_events);}});
test('Unauthenticated legacy synchronization is closed',()=>assert.equal(webhook().status,410));
