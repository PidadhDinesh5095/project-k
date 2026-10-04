// Wraps an async route handler so thrown errors reach Express's error middleware
// instead of becoming an unhandled promise rejection.
export default (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
