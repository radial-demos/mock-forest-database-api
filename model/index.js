'use strict';

require('dotenv').config();
const debug = require('debug')('debug:model');
const path   = require('path');
const fs   = require('fs-extra');
const _ = require('lodash');
const yaml = require('js-yaml');
const klawSync = require('klaw-sync');
const values = require('./values');
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

const getNationDefs = () => {

    return _.cloneDeep(nationDefs);
};

const getData = async (regionId, lang) => {

    /** Note that nationDefs has not been 'deep cloned'. DO NOT modify (corrupt) its objects! */
    /** For each nation and jurisdiction, we are copying necessary string properties and assigning a 'data' property with all the fields/values */
    const data = nationDefs.map((nationDef) => {

        return {
            id: nationDef.id,
            name: nationDef.name,
            currency: nationDef.currency,
            data: values.parseData(nationDef.id, fieldDefs.national, nationDefs.fields),
            jurisdictions: (nationDef.jurisdictions || []).map((jurisdictionDef) => {

                const jurisdictionId = `${nationDef.id}.${jurisdictionDef.id}`; /** pre-append the nation ID (e.g. brazil.acre) */
                return {
                    id: jurisdictionId,
                    name: jurisdictionDef.name,
                    /** include some useful properties from nationDef */
                    currency: nationDef.currency,
                    nationId: nationDef.id,
                    nationName: nationDef.name,
                    data: values.parseData(jurisdictionId, fieldDefs.jurisdictional, nationDef.jurisdictionalFields, jurisdictionDef.fields),
                };
            }),
        };
    });
    return data;
};

module.exports = {
    getNationDefs,
    getData,
};
