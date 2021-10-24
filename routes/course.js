const express = require('express');
const { check } = require('express-validator');
const courseController = require('../controllers/courseController');
const { protect, restrictedTo } = require('../middlewares/auth/protect');

const router = express.Router();

router.get('/courses', courseController.getAllCourses);

router.get('/bootcamps', courseController.getAllBootcamps);

router.use(protect);

router.post(
    '/create',
    [
        check('title').notEmpty(),
        check('description').notEmpty(),
        check('type').notEmpty(),
        check('price').notEmpty(),
        check('image').notEmpty(),
        check('url').notEmpty(),
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
        check('url').notEmpty(),
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
