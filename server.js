'use strict';

require('dotenv').config();
const debug = require('debug')('debug:server');
const Hapi = require('hapi');

const model = require('./model');
const MissingArgumentError = require('./config/errors/MissingArgumentError');

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
    handler: async (request, h) => {

        if (!('regionId' in request.query)) throw new MissingArgumentError('Query string must include "regionId".');

        return { status: 'success', entries: await model.getEntries(request.query.regionId) };
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
