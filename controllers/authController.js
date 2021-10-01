const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const HttpError = require('../utils/httpError');
const user = require('../models/user');

exports.signup = async (req, res, next) => {
    try {
        const { name, email, password, mobile } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return next(
                new HttpError('Signed Up failed, user already exists.', 422)
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name,
            email,
            mobile,
            hashedPassword,
        });

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES,
            }
        );

        res.status(201).json({
            status: 'success',
            user: { id: user._id, token },
        });
    } catch (e) {
        next(new HttpError('Signed Up failed, please try again !', 500));
    }
};
