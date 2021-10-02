const Course = require('../models/course');

exports.createCourse = async (req, res, next) => {
    const { title, description, type, price, image } = req.body;
    try {
        const course = await new Course({
            title,
            description,
            type,
            price,
            image,
        });
        course.save();

        res.status(200).json({ status: 'success', course: { course_id } });
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
    try {
        const course = await Course.findById(req.params.id);

        await Course.findByIdAndUpdate(req.params.id, {
            $set: request.body,
        });

        res.status(200).json({ status: 'success', course: { course_id } });
    } catch (error) {
        next(new HttpError('Course not updated, please try again !', 500));
    }
};

exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        await course.delete();

        res.status(200).json({ status: 'success', course: { course_id } });
    } catch (error) {
        next(new HttpError('Course not deleted, please try again !', 500));
    }
};
