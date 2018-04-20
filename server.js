'use strict';

require('dotenv').config();
const debug = require('debug')('debug:server');
const Hapi = require('hapi');

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
    path: '/getEntries',
    options: { cors: true },
    handler: (request, h) => {

        return { status: 'success', entries: [] };
    }
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
