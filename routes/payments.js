const express = require('express');
const { protect } = require('../middlewares/auth/protect');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.use(protect);

router.post('/orders', paymentController.placeOrder);

router.post('/success', paymentController.successfulOrder);

module.exports = router;
