module.exports = class InvalidOptionsError extends require('./AppError') {
    constructor (message) {

        super(message || 'The "options" argument may only be a plain object.');
    }
};
