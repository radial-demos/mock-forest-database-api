'use strict';

require('dotenv').config();
const debug = require('debug')('debug:model');
const path   = require('path');
const fs   = require('fs-extra');
const yaml = require('js-yaml');

const MissingArgumentError = require('../config/errors/MissingArgumentError');

let fieldDefs;

try {
    fieldDefs = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '..', 'config', 'field-defs.yml'), 'utf8'));
} catch (e) {
    throw(e);
}

const getEntries = async (regionId, lang) => {

    if (typeof regionId !== 'string') throw new MissingArgumentError('The "regionId" argument to getEntries(regionId) is required.');
    return [];
};

module.exports = {
    getEntries,
};
