'use strict';

require('dotenv').config();
const debug = require('debug')('debug:values');
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const _ = require('lodash');

const DATA_PATH = path.resolve(__dirname, '..', 'data');

const getFilePath = (regionId) => {
    return path.join(DATA_PATH, 'values', `${regionId}.yml`);
};

const getFormattedNumberString = (amount, formatOptions) => {

    if ((amount === null) || (amount === undefined)) return '';
    if ((typeof amount) === 'string') return amount; // this should not happen, but it's not worth throwing
    if ((typeof amount) !== 'number') '<UnknownValueType>'; // just in case, at least display something (again, not worth throwing)
    return (typeof formatOptions === 'object') ? amount.toLocaleString(undefined, formatOptions) : amount.toLocaleString();
};

const read = (regionId) => {

    let data;
    try {
        const fileContent = fs.readFileSync(getFilePath(regionId), 'utf8');
        data = yaml.safeLoad(fileContent);
    }
    catch (err) {
        if (err.code === 'ENOENT') return {}; // It's OK if the file doesn't exist. Just return an empty object
        throw (err);
    }
    return data;
};

const save = (regionId, values) => {
    try {
        const fileContent = yaml.safeDump(values);
        fs.outputFileSync(getFilePath(regionId), fileContent);
    }
    catch (err) {
        throw err;
    }
};

const buildFieldOverrides = (nationLevelOverrides, jurisdictionLevelOverrides) => {

    // build a single array of field overrides from nationLevelOverrides and jurisdictionLevelOverrides
    const overrides = [];
    // jurisdictionLevelOverrides have priority
    if (Array.isArray(jurisdictionLevelOverrides)) {
        jurisdictionLevelOverrides.forEach((override) => {

            return _.cloneDeep(override);
        });
    }
    // add nationLevelOverrides
    if (Array.isArray(nationLevelOverrides)) {
        nationLevelOverrides.forEach((override) => {

            if (overrides.findIndex((o) => (o.id === override.id)) === -1) {
                overrides.push(_.cloneDeep(override));
            }
        });
    }
    return overrides;
};

const assignCategoryValues = (categoryDefs = [], categoryValues = [], formatOptions) => {

    return categoryDefs.map((category) => {

        // Coerce IDs to strings since string numbers may or may not have been converted to numbers
        const categoryId = String(category.id);
        const categoryValue = categoryValues.find((o) => (String(o.id) === categoryId)) || {};
        // TODO: refactor dataset to be ['value', 'amount']
        const categoryValueAmount = _.get(categoryValue, ['value', 'value'], null);
        return {
            id: categoryId,
            label: category.label,
            amount: categoryValueAmount,
            string: getFormattedNumberString(categoryValueAmount, formatOptions),
        };
    });
};

const assignOptionValues = (optionDefs = [], option = '') => {

    const optionString = String(option); // Make absolutely sure this is a string

    return optionDefs.map((optionDef) => {

        // Coerce IDs to strings since string numbers may or may not have been converted to numbers
        const optionDefString = String(optionDef.value);
        return {
            option: optionDefString,
            label: optionDef.label,
            isSelected: (optionDefString === optionString),
        };
    });
};

const parseData = (regionId, fieldDefs, nationLevelOverrides, jurisdictionLevelOverrides) => {

    const fieldOverrides = buildFieldOverrides(nationLevelOverrides, jurisdictionLevelOverrides);
    const savedValues = read(regionId);
    const data = {};
    fieldDefs.forEach((fieldDef) => {

        const fieldOverride = fieldOverrides.find((o) => (o.id === fieldDef.id)) || {};
        const savedValue = _.get(savedValues, fieldDef.id, {});
        let isValidField = true;
        const datum = {
            id: fieldDef.id,
            type: fieldDef.type,
            label: fieldDef.label,
            timestamp: _.get(savedValue, ['timestamp'], ''),
            citation: { html: _.get(savedValue, ['citation', 'html'], '') },
        };
        if (['number', 'numberAndCurrency', 'numberAndYear'].includes(fieldDef.type)) {
            datum.units = fieldDef.units || '';
            // TODO: modify data files to store this in an 'amount' key also
            datum.amount = _.get(savedValue, ['value', 'value'], null);
            datum.string = getFormattedNumberString(datum.amount, fieldDef.formatOptions);
            // Include currency or year for these respective subtypes
            if (fieldDef.type == 'numberAndCurrency') datum.currency = _.get(savedValue, ['value', 'currency'], '');
            if (fieldDef.type == 'numberAndYear') datum.year = String(_.get(savedValue, ['value', 'year'], ''));
        }
        else if (['categorical', 'series'].includes(fieldDef.type)) {
            // Assign available values to the categories. Note that the override is used if available.
            datum.categories = assignCategoryValues(fieldOverride.categories || fieldDef.categories, savedValue.values, fieldDef.formatOptions);
        }
        else if (fieldDef.type === 'string') {
            datum.string = _.get(savedValue, ['value', 'string'], '');
        }
        else if (fieldDef.type === 'text') {
            datum.html = _.get(savedValue, ['value', 'html'], '');
        }
        else if (fieldDef.type === 'person') {
            datum.firstName = _.get(savedValue, ['value', 'firstName'], '');
            datum.lastName = _.get(savedValue, ['value', 'lastName'], '');
            datum.email = _.get(savedValue, ['value', 'email'], '');
            datum.companyTitle = _.get(savedValue, ['value', 'companyTitle'], '');
        }
        else if (fieldDef.type === 'select') {
            // TODO: modify data files to store this in an 'option' key also
            datum.option = String(_.get(savedValue, ['value', 'value'], '')); // Coerce to string in case a number string was coerced to a number
            // Assign 'isSelected' to each option. Note that the override is used if available.
            datum.options = assignOptionValues(fieldOverride.options || fieldDef.options, datum.option);
            // Provide a string property, which is just the label of the selected option or empty string if no option is selected
            datum.string = (datum.options.find(o => (o.isSelected)) || {}).label || '';
        }
        else if (fieldDef.type === '[initiative]') {
            datum.rows = _.get(savedValue, ['rows'], []).map((row) => {
                return {
                    id: _.get(row, ['id'], ''),
                    timestamp: _.get(row, ['timestamp'], ''),
                    name: _.get(row, ['name', 'value', 'string'], ''),
                    description: { html: _.get(row, ['description', 'value', 'html'], '') },
                    partners: _.get(row, ['partners','value', 'string'], ''),
                    fundingSource: _.get(row, ['fundingSource','value', 'string'], ''),
                    fundingAmount: _.get(row, ['fundingAmount','value', 'string'], ''),
                    initiativeType: _.get(row, ['initiativeType','value', 'string'], ''),
                    initiativeStatus: _.get(row, ['initiativeStatus','value', 'string'], ''),
                };
            });
        }
        else {
            debug(`Unknown data type '${fieldDef.type}'`);
            isValidField = false;
        }
        if (isValidField) data[fieldDef.id] = datum;
    });
    return data;
};

module.exports = { parseData };
