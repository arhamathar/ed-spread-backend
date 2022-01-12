const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const Bill = require('../models/bills');
const Course = require('../models/course');
const HttpError = require('../utils/httpError');

const debug = (n) => {
    console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-', n);
};

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key: process.env.SENDGRID_API,
        },
    })
);

exports.placeOrder = async (req, res, next) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const { amount, courseId, referralCode } = req.body;

        const course = await Course.findById(courseId);

        if (course.price !== amount) {
            return next(
                new HttpError(
                    'Transaction not legit!, please try again later',
                    500
                )
            );
        }

        const payingUser = await User.findById(req.user._id);
        if (!payingUser) {
            return next(
                new HttpError('Please login to purchase the course', 401)
            );
        }

        if (payingUser.referralCode === referralCode) {
            return next(
                new HttpError(
                    'You can not use your own code to purchase courses',
                    500
                )
            );
        }

        const referralUser = await User.findOne({ referralCode });
        if (!referralUser && referralCode !== '') {
            return next(new HttpError('Referral Code not correct', 400));
        }

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

        res.status(200).json({ status: 'success', order });
    } catch (e) {
        console.log(e, '==============================');
        next(new HttpError('Something went wrong, could not place order', 500));
    }
};

exports.successfulOrder = async (req, res, next) => {
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
            // createdAt,
            referralCode,
        } = req.body;

        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        // shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');
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

        const newBill = await new Bill({
            amount,
            receipt,
            user,
            course,
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            createdAt: new Date().toISOString(),
        });

        await newBill.save();

        const payingUser = await User.findById(req.user._id);
        if (!payingUser) {
            return next(
                new HttpError('Please login to purchase the course', 401)
            );
        }

        payingUser.courses.push(course);

        const referralUser = await User.findOne({ referralCode });

        if (referralUser) {
            await User.updateOne(
                { _id: referralUser._id },
                {
                    referralPoints: referralUser.referralPoints + 100,
                }
            );
        }

        await payingUser.save();

        try {
            await transporter.sendMail({
                to: payingUser.email,
                from: process.env.SENDGRID_SENDER_EMAIL,
                subject: 'Thank you for buying the course.',
                html: `
            <p>Hey,
            Thanks for purchasing the 30-day python programming course by Ed Spread.
            You will receive your course completion certificate to your registered mail Id after 30 days from now. 
            </p>
            <p>As promised here is the suggested reading of python.</p>
            <a href="https://drive.google.com/drive/folders/10R8EKXGBvf15E1g0bsYc9lbwH3aFEqk6?usp=sharing">Pdf Link</a>
            <p>For any questions,
            Text us on Whatsapp (+91-7842605842)
            </p>
            <p>OR</p>
            <p>Mail us to:</p>
            <a href="mailto:support@edspread.in">Email</a>
            <p>Thanks & Regards,</p>
            <h5>ED SPREAD</h5>
            
        `,
            });
        } catch (err) {
            console.log(err, 'Thankyou email error');
            return next(
                new HttpError(
                    'Could not send thankyou email,please try again',
                    500
                )
            );
        }

        res.status(200).json({
            status: 'success',
            message: 'Payment successful',
        });
    } catch (e) {
        console.log(e, '+=+=+=+=+=+=+=+++++++++++++++++++++++');
        next(new HttpError('Transaction failed, please try again later', 500));
    }
};
