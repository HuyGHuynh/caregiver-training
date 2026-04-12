// Request logging middleware for debugging
const requestLogging = (req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
};

module.exports = requestLogging;