const User = require('../models/user');
const HttpError = require('../utils/httpError');

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseInfo',
                },
            },
            { $unwind: { path: '$courseInfo' } },
            {
                $project: {
                    name: 1,
                    mobile: 1,
                    email: 1,
                    courseName: '$courseInfo.name',
                    courseType: '$courseInfo.type',
                },
            },
        ]);

        res.status(200).json({ users });
    } catch (e) {
        next(new HttpError('Something went wrong, cannot find users!', 500));
    }
};
