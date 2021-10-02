module.exports = (err, req, res, next) => {
    err.code = err.code || 500;
    err.status = err.status || 'error';

    res.status(err.code).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack, // shows where error happens
    });
};
