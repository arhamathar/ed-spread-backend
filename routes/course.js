import express, { Router } from 'express';
import {
    getAllCourses,
    updateCourse,
    deleteCourse,
    createCourse,
} from '../controller/coursecontroller';

const router = express.Router();

router.post('/create', createCourse);
router.get('/courses', getAllCourses);
router.post('/update/:id', updateCourse);
router.delete('/delete/:id', deleteCourse);

module.export = router;
