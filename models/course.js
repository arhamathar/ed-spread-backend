const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please tell us the course title!'],
    },
    description: {
        type: String,
        required: [true, 'Please tell us about the course!'],
    },
    type: {
        type: String,
        enum: ['PAID', 'FREE'],
        default: 'FREE',
        required: [true, 'Please tell us about the course type!'],
    },
    price: {
        type: Number,
        required: [true, 'Please tell us the price of the course!'],
    },
    image: {
        type: String,
        required: [true, 'Please provide an image'],
    },
    url: {
        type: String,
        required: [true, 'Please provide course url'],
    },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Course', courseSchema);
