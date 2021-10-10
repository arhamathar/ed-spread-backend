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
                    title: '$courseInfo.name',
                    type: '$courseInfo.type',
                    price: '$courseInfo.price',
                },
            },
        ]);

        res.status(200).json({ users });
    } catch (e) {
        next(new HttpError('Something went wrong, cannot find users!', 500));
    }
};
