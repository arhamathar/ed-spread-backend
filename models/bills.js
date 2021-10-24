const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    orderCreationId: { type: String },
    receipt: { type: String },
    createdAt: { type: Date },
    razorpayPaymentId: { type: String, required: true },
    razorpayOrderId: { type: String, required: true },
    razorpaySignature: { type: String, required: true },
    course: { type: mongoose.Types.ObjectId, ref: 'Course', required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Bill', billSchema);
