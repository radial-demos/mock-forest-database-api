module.exports = class InvalidOptionError extends require('./AppError') {
    constructor (message) {

        super(message || 'Invalid option supplied.');
    }
};
