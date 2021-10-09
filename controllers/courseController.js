const Course = require('../models/course');
const { validationResult } = require('express-validator');
const HttpError = require('../utils/httpError');

exports.createCourse = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(
            new HttpError('Invalid credentials, check your credentials', 422)
        );
    }
    try {
        const { title, description, type, price, image } = req.body;
        const course = await new Course({
            title,
            description,
            type,
            price,
            image,
        });
        course.save();

        res.status(200).json({ status: 'success', course: course });
    } catch (error) {
        console.log(error);
        next(new HttpError('Course not created, please try again !', 500));
    }
};

exports.getAllCourses = async (req, res, next) => {
    let courses;
    try {
        courses = await Course.find({ type: 'PAID' });

        console.log('Hoe', courses);
        res.status(200).json({ status: 'success', courses });
    } catch (error) {
        next(new HttpError('cannot get courses, please try again !', 500));
    }
};

exports.getAllBootcamps = async (req, res, next) => {
    let courses;
    try {
        courses = await Course.find({ type: 'FREE' });

        console.log('Hoe', courses);
        res.status(200).json({ status: 'success', courses });
    } catch (error) {
        next(new HttpError('cannot get courses, please try again !', 500));
    }
};

exports.updateCourse = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(
            new HttpError('Invalid credentials, check your credentials', 422)
        );
    }
    try {
        const { title, description, type, price, image } = req.body;
        // const course = await Course.findById(req.params.id);

        const newCourse = await Course.updateOne(
            { _id: req.params.id },
            {
                title,
                description,
                type,
                price,
                image,
            }
        );

        res.status(200).json({ status: 'success', course: newCourse });
    } catch (error) {
        console.log(error);
        next(new HttpError('Course not updated, please try again !', 500));
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        await course.delete();

        res.status(200).json({ status: 'success', course: course });
    } catch (error) {
        console.log(error);
        next(new HttpError('Course not deleted, please try again !', 500));
    }
};
