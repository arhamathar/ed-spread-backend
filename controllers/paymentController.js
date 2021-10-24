const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');

const HttpError = require('../utils/httpError');

exports.placeOrder = async (req, res, next) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const { amount } = req.body;
        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency: 'INR',
            receipt: uuidv4(),
        };

        const order = await instance.orders.create(options);

        if (!order)
            return next(
                new HttpError(
                    'Something went wrong, could not create order',
                    500
                )
            );

        res.status(200).json({ status: 'success', order });
    } catch (e) {
        console.log(e);
        next(new HttpError('Something went wrong, could not place order', 500));
    }
};

exports.successfulOrder = async (req, res, next) => {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        // const secret = '12345678';
        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        // shasum.update(JSON.stringify(req.body));

        const digest = shasum.digest('hex');

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return next(
                new HttpError(
                    'Transaction not legit!, please try again later',
                    400
                )
            );

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.status(200).json({
            status: 'success',
            message: 'Payment successful',
        });
    } catch (e) {
        console.log(e);
        next(new HttpError('Transaction failed, please try again later', 500));
    }
};
