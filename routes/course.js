const express = require('express');
const courseController = require('../controllers/courseController');

const router = express.Router();

router.post('/create', courseController.createCourse);
router.get('/courses', courseController.getAllCourses);
router.post('/update/:id', courseController.updateCourse);
router.delete('/delete/:id', courseController.deleteCourse);

module.exports = router;
