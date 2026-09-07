const { test } = require('node:test');
const assert = require('node:assert/strict');
const LimitedCacheStore = require('./metro-cache-store.cjs');

test('mixed cache reads and writes share a bounded I/O pool', async () => {
  let active = 0, peak = 0;
  const operation = async value => {
    active++; peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 1));
    active--; return value;
  };
  const cache = new LimitedCacheStore({ get: operation, set: operation }, 4);
  const results = await Promise.all(Array.from({ length: 100 }, (_, i) => i % 2 ? cache.get(i) : cache.set(i, i)));
  assert.equal(peak, 4);
  assert.deepEqual(results, Array.from({ length: 100 }, (_, i) => i));
  assert.equal(cache.active, 0);
});

test('temporary handle exhaustion retries; other failures release the slot', async () => {
  let calls = 0;
  const cache = new LimitedCacheStore({ get: async key => {
    if (key === 'retry' && calls++ === 0) throw Object.assign(new Error('busy'), { code: 'EMFILE' });
    if (key === 'fail') throw Object.assign(new Error('denied'), { code: 'EACCES' });
    return key;
  } }, 1);
  assert.equal(await cache.get('retry'), 'retry');
  const results = await Promise.allSettled([cache.get('fail'), cache.get('next')]);
  assert.equal(results[0].status, 'rejected');
  assert.equal(results[1].value, 'next');
  assert.equal(cache.active, 0);
});
