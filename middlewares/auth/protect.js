const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const HttpError = require('../../utils/httpError');

exports.protect = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next(); // to allow options request to continue.
    }

    let token;
    try {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(
                new HttpError(
                    'Authoization Failed, please log in to get access.',
                    401
                )
            );
        }

        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decodedToken.userId };

        next();
    } catch (e) {
        console.log(e);
        return next(
            new HttpError(
                'You are not authorized to visit this route, please log in.',
                403
            )
        );
    }
};

exports.restrictedTo = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role));
        {
            return next(
                new HttpError(
                    'You do not have permission to perform this action.',
                    403
                )
            );
        }
        next();
    };
};
