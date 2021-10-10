const mongoose = require('mongoose');

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
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN', 'SUPER_USER'],
        default: 'USER',
    },
    mobile: {
        type: String,
        required: [true, 'Please enter your mobile No.'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false,
    },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    courses: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Course',
        },
    ],
});

module.exports = mongoose.model('User', userSchema);
