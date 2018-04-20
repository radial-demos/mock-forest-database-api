/* eslint-env node, jest */

const fetch = require('node-fetch');

const JURISDICTION = 'mexico.chiapas';
const URI_BASE = 'http://127.0.0.1:8000';

test('Route getEntries resolves to object with an "entries" array', async () => {

    const method = 'getEntries';
    const res = await fetch(`${URI_BASE}/${method}?regionId=${JURISDICTION}`);
    expect(res.ok).toBe(true);
    const data = await res.json();
    await expect(data.entries).toEqual(expect.any(Array));
});
