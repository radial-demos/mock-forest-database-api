'use strict';

require('dotenv').config();
const debug = require('debug')('debug:model');
const path   = require('path');
const fs   = require('fs-extra');
const yaml = require('js-yaml');
const klawSync = require('klaw-sync');
// Error Classes Used In This Module
const MissingArgumentError = require('../config/errors/MissingArgumentError');
// Module-Level "Constants"
const YAML_EXTENSION = '.yml';
const CONFIG_PATH = path.resolve(__dirname, '..', 'config');
let fieldDefs; // this must be read and parsed (below)
let nationDefs; // this must be read and parsed (below)
// Read field definitions from a single YAML file
try {
    fieldDefs = yaml.safeLoad(fs.readFileSync(path.join(CONFIG_PATH, 'field-defs.yml'), 'utf8'));
} catch (e) {
    throw(e);
}
// Read nationDefs from a directory, each nation having its own YAML-file definition
{
    nationDefs = [];
    let paths = [];
    try {
        paths = klawSync(path.join(CONFIG_PATH, 'nation-defs'), {
            nodir: true,
            filter: (item) => path.extname(item.path) === YAML_EXTENSION,
        });
    }
    catch (err) {
        throw (err);
    }
    paths = paths.map((pathObj) => pathObj.path);
    paths.forEach((filePath) => {

        const baseName = path.basename(filePath, YAML_EXTENSION);
        try {
            // push each nationDef, also assigning the id using the file baseName (e.g. 'brazil.yml' is id'd as 'brazil')
            nationDefs.push(Object.assign(yaml.safeLoad(fs.readFileSync(filePath, 'utf8')), { id: baseName }));
        } catch (e) {
            throw e;
        }
    });
}

const getEntries = async (regionId, lang) => {

    if (typeof regionId !== 'string') throw new MissingArgumentError('The "regionId" argument to getEntries(regionId) is required.');
    return [];
};

module.exports = {
    getEntries,
};
