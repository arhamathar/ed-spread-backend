const crypto = require('crypto');
const Razorpay = require('razorpay');

exports.placeOrder = async (req, res, next) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: 15500, // amount in smallest currency unit
            currency: 'INR',
            receipt: 'receipt_order_74394',
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send('Some error occured');

        res.json(order);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
};
