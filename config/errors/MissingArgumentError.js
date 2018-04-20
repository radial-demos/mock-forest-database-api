module.exports = class MissingArgumentError extends require('./AppError') {
    constructor (message) {

        super(message || 'Required function argument not supplied.');
    }
};
