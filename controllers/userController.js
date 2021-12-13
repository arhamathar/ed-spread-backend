const { validationResult } = require('express-validator');
const User = require('../models/user');
const HttpError = require('../utils/httpError');

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courses',
                    foreignField: '_id',
                    as: 'courseInfo',
                },
            },
            {
                $unwind: {
                    path: '$courseInfo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    name: 1,
                    mobile: 1,
                    email: 1,
                    title: '$courseInfo.title',
                    type: '$courseInfo.type',
                    price: '$courseInfo.price',
                    points: '$referralPoints',
                },
            },
        ]);

        res.status(200).json({ status: 'Success', users });
    } catch (e) {
        next(new HttpError('Something went wrong, cannot find users!', 500));
    }
};

exports.subtractReferralPoints = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(new HttpError('Entered email is invalid', 422));
    }

    const { email, referralPoints } = req.body;
    try {
        const redeemingUser = await User.findOne({ email });
        if (!redeemingUser) {
            return next(
                new HttpError('User not found please check the email', 404)
            );
        }

        if (redeemingUser.referralPoints < referralPoints) {
            return next(
                new HttpError(
                    `User does not have ${referralPoints} points`,
                    400
                )
            );
        }

        await User.updateOne(
            { email },
            { referralPoints: redeemingUser.referralPoints - referralPoints }
        );
        res.status(200).json({
            status: 'success',
            message: 'Points deducted successfully',
        });
    } catch (e) {
        console.log(e);
        return next(
            new HttpError('Something went wrong, try again later', 500)
        );
    }
};
