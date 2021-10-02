const express = require('express');
const courseController = require('../controllers/courseController');

const router = express.Router();

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
router.get('/courses', courseController.getAllCourses);
router.post(
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
