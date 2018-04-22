module.exports = class RegionNotFoundError extends require('./AppError') {
    constructor (message) {

        super(message || 'Region (either nation or jurisdiction) could not be found in the database.');
    }
};
