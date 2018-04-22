/* eslint-env node, jest */
require('dotenv').config();

const fetch = require('node-fetch');

const NATION_ID = 'brazil';
const JURISDICTION_ID = 'mexico.chiapas';
const INVALID_NATION_ID = 'this_is_not_a_nation';
const INVALID_JURISDICTION_ID = 'mexico.this_is_not_a_jurisdiction';
// const FAKE_REGION_ID = 'noncounrty.nonstate';
const URI_BASE = 'http://127.0.0.1:8000';

test('Route "getData" with an invalid query string option, responds with not OK.', async () => {

    const method = 'getData';
    const res = await fetch(`${URI_BASE}/${method}?someWeirdOption=foo`);
    // const data = await res.json();
    expect(res.ok).toBe(false);
});

test('Route "getData" with an invalid national regionId option, responds with not OK.', async () => {

    const method = 'getData';
    const res = await fetch(`${URI_BASE}/${method}?regionId=${INVALID_NATION_ID}`);
    // const data = await res.json();
    expect(res.ok).toBe(false);
});

test('Route "getData" with an invalid jurisdictional regionId option, responds with not OK.', async () => {

    const method = 'getData';
    const res = await fetch(`${URI_BASE}/${method}?regionId=${INVALID_JURISDICTION_ID}`);
    // const data = await res.json();
    expect(res.ok).toBe(false);
});

test('Route getData with no arguments resolves to object with a "data" array', async () => {

    const method = 'getData';
    const res = await fetch(`${URI_BASE}/${method}`);
    const data = await res.json();
    expect(res.ok).toBe(true);
    await expect(data.data).toEqual(expect.any(Array));
});

test('Route getData with a valid national regionId resolves to object with a "data" array', async () => {

    const method = 'getData';
    const res = await fetch(`${URI_BASE}/${method}?regionId=${NATION_ID}`);
    const data = await res.json();
    expect(res.ok).toBe(true);
    await expect(data.data).toEqual(expect.any(Array));
});

test('Route getData with a valid jurisdictional regionId resolves to object with a "data" array', async () => {

    const method = 'getData';
    const res = await fetch(`${URI_BASE}/${method}?regionId=${JURISDICTION_ID}`);
    const data = await res.json();
    expect(res.ok).toBe(true);
    await expect(data.data).toEqual(expect.any(Array));
});
