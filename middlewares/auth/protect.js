const jwt = require('jsonwebtoken');
const User = require('../../models/user');
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
        const freshUser = await User.findById(decodedToken.id);

        if (!freshUser) {
            return next(
                new HttpError(
                    'The user belonging to this token no longer exists',
                    401
                )
            );
        }
        req.user = freshUser;

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
        if (roles.indexOf(req.user.role) === -1) {
            return next(
                new HttpError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }
        next();
    };
};
