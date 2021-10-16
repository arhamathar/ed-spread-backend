const express = require('express');
const courseController = require('../controllers/courseController');
const { check } = require('express-validator');

const router = express.Router();

router.get('/courses', courseController.getAllCourses);

router.get('/bootcamps', courseController.getAllBootcamps);

router.post(
    '/create',
    [
        check('title').notEmpty(),
        check('description').notEmpty(),
        check('type').notEmpty(),
        check('price').notEmpty(),
        check('image').notEmpty(),
    ],
    courseController.createCourse
);

router.patch(
    '/update/:id',
    [
        check('title').notEmpty(),
        check('description').notEmpty(),
        check('type').notEmpty(),
        check('price').notEmpty(),
        check('image').notEmpty(),
    ],
    courseController.updateCourse
);

router.delete('/delete/:id', courseController.deleteCourse);

module.exports = router;
