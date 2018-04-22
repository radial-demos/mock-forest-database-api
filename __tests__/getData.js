/* eslint-env node, jest */
require('dotenv').config();
const debug = require('debug')('debug:getData');

const fetch = require('node-fetch');

const JURISDICTION_ID = 'mexico.chiapas';
// const FAKE_REGION_ID = 'noncounrty.nonstate';
const URI_BASE = 'http://127.0.0.1:8000';

test('Route "getData" with an invalid query string option, responds with not OK.', async () => {

    const method = 'getData';
    const res = await fetch(`${URI_BASE}/${method}?someWeirdOption=foo`);
    const data = await res.json();
    expect(res.ok).toBe(false);
});

test('Route getData with no arguments resolves to object with a "data" array', async () => {

    const method = 'getData';
    const res = await fetch(`${URI_BASE}/${method}`);
    const data = await res.json();
    expect(res.ok).toBe(true);
    await expect(data.data).toEqual(expect.any(Array));
});

