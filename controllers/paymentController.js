const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');

const User = require('../models/user');
const Bill = require('../models/bills');
const Course = require('../models/course');
const HttpError = require('../utils/httpError');

const debug = (n) => {
    console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-', n);
};

exports.placeOrder = async (req, res, next) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });
        debug(1);

        const { amount, courseId } = req.body;

        const course = await Course.findById(courseId);
        debug(2);
        if (course.price !== amount) {
            return next(
                new HttpError(
                    'Transaction not legit!, please try again later',
                    500
                )
            );
        }
        debug(3);

        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency: 'INR',
            receipt: uuidv4(),
        };

        const order = await instance.orders.create(options);
        debug(4);

        if (!order)
            return next(
                new HttpError(
                    'Something went wrong, could not create order',
                    500
                )
            );
        debug(5);

        res.status(200).json({ status: 'success', order });
    } catch (e) {
        console.log(e, '==============================');
        next(new HttpError('Something went wrong, could not place order', 500));
    }
};

exports.successfulOrder = async (req, res, next) => {
    debug(6);
    try {
        const {
            amount,
            receipt,
            user,
            course,
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            createdAt,
            referralCode,
        } = req.body;
        debug(7);
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
        debug(8);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        // shasum.update(JSON.stringify(req.body));
        debug(9);
        const digest = shasum.digest('hex');
        debug(10);
        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature) {
            debug(555);
            return next(
                new HttpError(
                    'Transaction not legit!, please try again later',
                    400
                )
            );
        }
        debug(11);

        const newBill = await new Bill({
            amount,
            receipt,
            user,
            course,
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            createdAt,
        });
        debug(12);
        await newBill.save();
        debug(13);

        const payingUser = await User.findById(req.user._id);
        debug(14);
        if (!payingUser) {
            return next(
                new HttpError('Please login to purchase the course', 401)
            );
        }
        debug(15);

        if (payingUser.referralCode === referralCode) {
            return next(
                new HttpError(
                    'You can not use your own code to purchase courses',
                    500
                )
            );
        }
        debug(16);

        payingUser.courses.push(course);
        debug(17);

        const referralUser = await User.findOne({ referralCode });
        debug(18);
        if (referralUser) {
            await User.updateOne(
                { _id: referralUser._id },
                {
                    referralPoints: referralUser.referralPoints + 100,
                }
            );
        }
        debug(19);
        if (!referralUser && referralCode !== '') {
            return next(new HttpError('Referral Code not correct', 400));
        }

        await payingUser.save();
        debug(20);

        res.status(200).json({
            status: 'success',
            message: 'Payment successful',
        });
    } catch (e) {
        console.log(e, '+=+=+=+=+=+=+=+++++++++++++++++++++++');
        next(new HttpError('Transaction failed, please try again later', 500));
    }
};
