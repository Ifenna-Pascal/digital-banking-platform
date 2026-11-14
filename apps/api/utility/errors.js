// An error whose message is safe to show to the client, with an HTTP status.
class AppError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

module.exports = { AppError };
