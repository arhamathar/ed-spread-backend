const { validationResult } = require('express-validator');
const User = require('../models/user');
const Course = require('../models/course');
const HttpError = require('../utils/httpError');
const mongoose = require('mongoose');
const embeddingService = require('../utils/embeddingService');
const llmService = require('../utils/llmServices');

exports.createCourse = async (req, res, next) => {
    const { title, description, type, price, image, url, notesPdf, videoUrls } =
        req.body;
    const embedding = await embeddingService.generateCourseEmbedding(
        title,
        description
    );

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
            notesPdf,
            videoUrls,
            createdBy: req.user._id,
            embedding,
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
            { $match: { _id: mongoose.Types.ObjectId(userId) } },
            { $unwind: { path: '$courses' } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courses',
                    foreignField: '_id',
                    as: 'courseInfo',
                },
            },
            { $unwind: '$courseInfo' },
            { $match: { 'courseInfo.type': 'PAID' } },
            {
                $project: {
                    _id: '$courseInfo._id',
                    title: '$courseInfo.title',
                    description: '$courseInfo.description',
                    type: '$courseInfo.type',
                    price: '$courseInfo.price',
                    image: '$courseInfo.image',
                    url: '$courseInfo.url',
                },
            },
        ]);

        res.status(200).json({ status: 'success', courses });
    } catch (e) {
        console.log(e);
        next(new HttpError('Something went wrong, cannot get courses!', 500));
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const {
            title,
            description,
            type,
            price,
            image,
            url,
            notesPdf,
            videoUrls,
        } = req.body;

        // Regenerate embedding if title or description changed
        const updateData = {
            title,
            description,
            type,
            price,
            image,
            url,
            notesPdf,
            videoUrls,
        };

        // Always regenerate embedding on update (since title/description are required)
        const embedding = await embeddingService.generateCourseEmbedding(
            title,
            description
        );
        updateData.embedding = embedding;

        const course = await Course.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found',
            });
        }

        res.status(200).json({
            success: true,
            data: course,
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update course',
        });
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

exports.getViewCourse = async (req, res, next) => {
    try {
        if (!req.user.courses.includes(req.params.courseId)) {
            return next(
                new HttpError(
                    'You have not purchased this course, please buy to watch',
                    401
                )
            );
        }
        const course = await Course.findById(req.params.courseId);

        res.status(200).json({
            status: 'success',
            message: 'Course fetched successfully',
            course,
        });
    } catch (e) {
        console.log(e);
        next(new HttpError('Something went wrong, please try again!', 500));
    }
};

exports.searchCourses = async (req, res) => {
    try {
        const {
            query,
            limit = 3,
            explain = 'true',
            mode = 'summary',
        } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query parameter is required',
            });
        }

        // Generate query embedding
        console.log('Generating embedding for query...');
        const queryEmbedding = await embeddingService.generateQueryEmbedding(
            query
        );

        // Perform vector search
        console.log('Performing vector search...');
        const courses = await Course.aggregate([
            {
                $vectorSearch: {
                    index: 'course_vector_index',
                    path: 'embedding',
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: parseInt(limit),
                },
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    type: 1,
                    price: 1,
                    image: 1,
                    url: 1,
                    notesPdf: 1,
                    videoUrls: 1,
                    score: { $meta: 'vectorSearchScore' },
                },
            },
            {
                $match: {
                    score: { $gte: 0.8 },
                },
            },
        ]);

        if (courses.length === 0) {
            return res.status(200).json({
                success: true,
                query: query,
                count: 0,
                data: [],
                message:
                    'No courses found matching your query. Try different keywords.',
            });
        }

        // Generate explanations if requested
        let result;
        if (explain === 'true') {
            console.log('Generating explanations...');

            if (mode === 'summary') {
                // Faster: Single summary for all courses
                result = await llmService.generateOverallSummary(
                    query,
                    courses
                );
            } else {
                // More detailed: Individual explanations (slower due to rate limits)
                const coursesWithExplanations =
                    await llmService.generateBatchExplanations(query, courses);
                result = {
                    courses: coursesWithExplanations,
                };
            }

            res.status(200).json({
                success: true,
                query: query,
                count: result.courses.length,
                ...(result.overall_summary && {
                    summary: result.overall_summary,
                }),
                data: result.courses,
            });
        } else {
            // No explanations
            res.status(200).json({
                success: true,
                query: query,
                count: courses.length,
                data: courses,
            });
        }
    } catch (error) {
        console.error('Error searching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search courses',
            error: error.message,
        });
    }
};
