/* eslint-env node, jest */

const fetch = require('node-fetch');

const JURISDICTION_ID = 'mexico.chiapas';
// const FAKE_REGION_ID = 'noncounrty.nonstate';
const URI_BASE = 'http://127.0.0.1:8000';

test('Route getEntries returns a non-OK response when regionId is not supplied', async () => {

    const method = 'getEntries';
    const res = await fetch(`${URI_BASE}/${method}?noRegionIdHere=oops`);
    expect(res.ok).toBe(false);
});

test('Route getEntries resolves to object with an "entries" array', async () => {

    const method = 'getEntries';
    const res = await fetch(`${URI_BASE}/${method}?regionId=${JURISDICTION_ID}`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    await expect(data.entries).toEqual(expect.any(Array));
});

