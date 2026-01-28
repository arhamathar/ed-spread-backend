const express = require('express');
const { check } = require('express-validator');
const courseController = require('../controllers/courseController');
const { protect, restrictedTo } = require('../middlewares/auth/protect');

const router = express.Router();

router.get('/courses', courseController.getAllCourses);

router.get('/bootcamps', courseController.getAllBootcamps);

router.get('/search', courseController.searchCourses);

router.use(protect);

router.get('/my-course/:userId', courseController.getMyCourses);

router.get('/:courseId', courseController.getViewCourse);

router.post(
    '/create',
    [
        check('title').notEmpty(),
        check('description').notEmpty(),
        check('type').notEmpty(),
        check('price').notEmpty(),
        check('image').notEmpty(),
    ],
    protect,
    restrictedTo('ADMIN', 'SUPER_USER'),
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
    protect,
    restrictedTo('ADMIN', 'SUPER_USER'),
    courseController.updateCourse
);

router.delete(
    '/delete/:id',
    protect,
    restrictedTo('ADMIN', 'SUPER_USER'),
    courseController.deleteCourse
);

module.exports = router;
