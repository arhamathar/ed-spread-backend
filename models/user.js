const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    mobile: {
        type: String,
        required: [true, 'Please enter your mobile No.'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
    },
});

module.exports = mongoose.model('User', userSchema);
