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
// const MissingArgumentError = require('../config/errors/MissingArgumentError');
const InvalidOptionsError = require('../config/errors/InvalidOptionsError');
const InvalidOptionError = require('../config/errors/InvalidOptionError');
const RegionNotFoundError = require('../config/errors/RegionNotFoundError');
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

const assertValidOptionArgument = (options, validOptionKeys) => {

    if (options === undefined) return; // options are ... optional
    if (!_.isPlainObject(options)) throw new InvalidOptionsError(); // ... but when supplied must be a plain object
    if (!Array.isArray(validOptionKeys)) return; // any keys are valid
    const suppliedOptionKeys = Object.keys(options);
    suppliedOptionKeys.forEach((key) => {

        if (!validOptionKeys.includes(key)) throw new InvalidOptionError(`The option '${key}' is invalid. Valid options are '${validOptionKeys.join('\', \'')}'`);
    });
};

const getNationData = (nationDef) => {

    /** We are copying necessary string properties and assigning a 'data' property with all the saved values */
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
};

/** Note that nationDefs has not been 'deep cloned'. DO NOT modify (corrupt) its objects! */
const getData = async (options) => {

    assertValidOptionArgument(options, ['regionId', 'lang']);

    if (options.regionId) {
        const [nationIdSegment, jurisdictionIdSegment] = options.regionId.split('.');
        const nationDef = nationDefs.find(n => (n.id === nationIdSegment));
        if (!nationDef) throw new RegionNotFoundError(`There is no nation with the id '${nationIdSegment}' in the database.`);
        const nationData = getNationData(nationDef);
        if (!jurisdictionIdSegment) return nationData; // just return the data for the requested nation
        // supplied regionId is a jurisdiction
        const jurisdictionDef = (nationDef.jurisdictions || []).find(j => (j.id === jurisdictionIdSegment));
        if (!jurisdictionDef) throw new RegionNotFoundError(`There is no jurisdiction with the id '${options.regionId}' in the database.`);
        return (nationData.jurisdictions || []).find(j =>(j.id === options.regionId));
    }

    /** Get data for each nation  */
    const data = nationDefs.map((nationDef) => {

        return getNationData(nationDef);
    });
    return data;
};

module.exports = {
    getNationDefs,
    getData,
};
