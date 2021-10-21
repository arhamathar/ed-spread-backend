const express = require('express');
const { protect } = require('../middlewares/auth/protect');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/orders', paymentController.placeOrder);

router.post('/success', async (req, res) => {
    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;
        console.log(req.body);
        const secret = '12345678';
        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
        console.log('pppppppppppppppp');

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        // shasum.update(JSON.stringify(req.body));
        console.log('rrrrrrrrrrrrr');

        const digest = shasum.digest('hex');
        console.log(digest);

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: 'Transaction not legit!' });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: 'success',
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        console.log('eeeeeeeeeeeee');
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;
