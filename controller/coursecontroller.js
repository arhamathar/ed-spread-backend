import Course from '../model/course.js';

export const createCourse = async (request, response) => {
    console.log(request.body);
    try {
        const course = await new Course({});
        course.save();

        response.status(200).json('Course saved successfully');
    } catch (error) {
        response.status(500).json(error);
    }
};

export const getAllCourses = async (request, response) => {
    let courses;
    try {
        courses = await Course.find({});

        console.log('Hoe', courses);
        response.status(200).json(courses);
    } catch (error) {
        response.status(500).json(error);
    }
};

export const updateCourse = async (request, response) => {
    try {
        const course = await Course.findById(request.params.id);

        await Course.findByIdAndUpdate(request.params.id, {
            $set: request.body,
        });

        response.status(200).json('course updated successfully');
    } catch (error) {
        response.status(500).json(error);
    }
};

export const deleteCourse = async (request, response) => {
    try {
        const course = await Course.findById(request.params.id);

        await course.delete();

        response.status(200).json('post deleted successfully');
    } catch (error) {
        response.status(500).json(error);
    }
};
