const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const HttpError = require('../utils/httpError');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
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
        console.log(newUser);
        const token = generateToken(newUser._id);
        newUser.password = undefined;
        const userInfo = {
            id: newUser._id,
            role: newUser.role,
            mobile: newUser.mobile,
            name: newUser.name,
        };

        res.status(201).json({
            message: 'Signup Successfully',
            user: { token, ...userInfo },
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

        const token = generateToken(existingUser._id);
        existingUser.password = undefined;
        const userInfo = {
            id: existingUser._id,
            role: existingUser.role,
            mobile: existingUser.mobile,
            name: existingUser.name,
            email: existingUser.email,
        };

        res.status(200).json({
            message: 'Login Successfully',
            user: { token, ...userInfo },
        });
    } catch (e) {
        console.log(e);
        next(new HttpError('Signed Up failed, please try again !', 500));
    }
};

exports.forgotPassword = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return next(
            new HttpError('Invalid credentials, check your credentials', 422)
        );
    }
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return next(
                new HttpError('User does not exists for provided email', 404)
            );
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetToken = hashedResetToken;
        user.resetTokenExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        res.status(200).json({ message: 'Reset token sent to your email' });
    } catch (e) {
        next(
            new HttpError('Resetting passwrod failed, please try again !', 500)
        );
    }
};

exports.resetPassword = async (req, res, next) => {
    // const hashedResetToken = crypto
    //     .createHash('sha256')
    //     .update(req.params.token)
    //     .digest('hex');

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            return next(new HttpError('Token is invalid or expired !', 400));
        }
        const hashedNewPassword = await bcrypt.hash(req.body.password, 12);

        user.password = hashedNewPassword;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;

        await user.save();
        const token = generateToken(user._id);

        res.status(200).json({
            status: 'Password reset successfully!',
            user: { id: user._id, token },
        });
    } catch (e) {
        next(
            new HttpError('Resetting password failed, please try again !', 500)
        );
    }
};
