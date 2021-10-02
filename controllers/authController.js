const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/user');
const HttpError = require('../utils/httpError');
const user = require('../models/user');

const generateToken = (id, email) =>
    jwt.sign({ id, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

exports.signup = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(
            new HttpError('Invalid credentials, check your credentials', 422)
        );
    }

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
            password: hashedPassword,
        });
        const token = generateToken(newUser._id, newUser.email);

        res.status(201).json({
            status: 'success',
            user: { id: newUser._id, token },
        });
    } catch (e) {
        console.log(e);
        next(new HttpError('Signed Up failed, please try again !', 500));
    }
};

exports.login = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(
            new HttpError('Invalid credentials, check your credentials', 422)
        );
    }

    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email }).select('+password');

        if (!existingUser) {
            return next(
                new HttpError('User not found , please check email.', 403)
            );
        }

        const isValidUser = await bcrypt.compare(
            password,
            existingUser.password
        );

        if (!isValidUser) {
            return next(new HttpError('Password is incorrect.', 401));
        }

        const token = generateToken(existingUser._id, existingUser.email);

        res.status(200).json({
            status: 'success',
            user: { id: existingUser._id, token },
        });
    } catch (e) {
        console.log(e);
        next(new HttpError('Signed Up failed, please try again !', 500));
    }
};
