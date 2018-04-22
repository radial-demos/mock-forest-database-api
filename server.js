'use strict';

require('dotenv').config();
const debug = require('debug')('debug:server');
const Hapi = require('hapi');

const model = require('./model');

const server = Hapi.server({
    host: 'localhost',
    port: 8000,
    debug: { request: ['error'] }
});

server.options = {
    address: '127.0.0.1'
};

server.route({
    method: 'GET',
    path: '/getNationDefs',
    options: { cors: true },
    handler: async (request, h) => {

        const nationDefs = await model.getNationDefs();
        return { status: 'success', nationDefs };
    },
});

server.route({
    method: 'GET',
    path: '/getData',
    options: { cors: true },
    handler: async (request, h) => {

        const data = await model.getData(request.query);
        return { status: 'success', data };
    },
});

const init = async () => {

    await server.start();
    debug(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    debug(err);
    process.exit(1);
});

init();
