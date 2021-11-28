const { validationResult } = require('express-validator');
const User = require('../models/user');
const Course = require('../models/course');
const HttpError = require('../utils/httpError');
const mongoose = require('mongoose');

exports.createCourse = async (req, res, next) => {
    const { title, description, type, price, image, url } = req.body;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(
            new HttpError('Invalid values entered, enter data correctly', 422)
        );
    }
    try {
        const course = await new Course({
            title,
            description,
            type,
            price,
            image,
            url,
            createdBy: req.user._id,
        });
        await course.save();

        const user = await User.findById(req.user._id);
        user.courses.push(course);

        await user.save();

        res.status(200).json({ status: 'success', course });
    } catch (e) {
        console.log(e);
        next(new HttpError('Course not created, please try again !', 500));
    }
};

exports.getAllCourses = async (req, res, next) => {
    let courses;
    try {
        courses = await Course.find({ type: 'PAID' });
        console.log(req.user);
        res.status(200).json({ status: 'success', courses });
    } catch (error) {
        next(new HttpError('Cannot get courses, please try again !', 500));
    }
};

exports.getAllBootcamps = async (req, res, next) => {
    let bootcamps;
    try {
        bootcamps = await Course.find({ type: 'FREE' });

        res.status(200).json({ status: 'success', bootcamps });
    } catch (error) {
        next(new HttpError('Cannot get bootcamps, please try again !', 500));
    }
};

exports.getMyCourses = async (req, res, next) => {
    let courses;
    const userId = req.params.userId;
    try {
        courses = await User.aggregate([
            { $match: { _id: userId } },
            { $unwind: { path: '$courses'} },
            { 
                $lookup: {
                    from: 'courses',
                    localField: 'courses',
                    foreignField: '_id',
                    as: 'courseInfo',
                },
            },
            {
                $project: {
                    title: '$courseInfo.title',
                    description: 'courseInfo.description',
                    type: '$courseInfo.type',
                    price: '$courseInfo.price',
                    image: '$courseInfo.image',
                    url: '$courseInfo.url'
                }
            }
        ]);

        res.status(200).json({status: 'success', courses})
    } catch (e) {
        next(new HttpError('Something went wrong, cannot get courses!', 500));
    }
}

exports.updateCourse = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(
            new HttpError('Invalid data entered, please enter again', 422)
        );
    }
    try {
        const { title, description, type, price, image, url } = req.body;

        const newCourse = await Course.updateOne(
            { _id: req.params.id },
            {
                title,
                description,
                type,
                price,
                image,
                url,
            }
        );

        res.status(200).json({
            status: 'success',
            message: 'Course updated successfully',
        });
    } catch (e) {
        next(new HttpError('Course not updated, please try again !', 500));
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        await course.delete();

        res.status(200).json({
            status: 'success',
            message: 'Course deleted successfully',
        });
    } catch (error) {
        console.log(error);
        next(new HttpError('Could not delete course, please try again !', 500));
    }
};
