const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const authController = require('../controllers/authController');

router.post(
    '/signup',
    [
        check('email').isEmail().normalizeEmail(),
        check('name').notEmpty(),
        check('password').isLength({ min: 6 }),
        check('mobile').isLength({ min: 10, max: 10 }),
    ],
    authController.signup
);

router.post(
    '/login',
    [
        check('email').isEmail().normalizeEmail(),
        check('password').isLength({ min: 6 }),
    ],
    authController.login
);
module.exports = router;
