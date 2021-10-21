require('dotenv').config();
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const connectDb = require('./utils/connectDb');
const HttpError = require('./utils/httpError');
const ErrorMiddleware = require('./middlewares/errors');
const userRoutes = require('./routes/user');
const paymentRoute = require('./routes/payments');
const courseRoute = require('./routes/course.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(morgan('dev'));
app.use(cors());

app.use('/api/user', userRoutes);
app.use('/api/course', courseRoute);
app.use('/payment', paymentRoute);

app.all('*', (req, res, next) => {
    next(new HttpError(`Can not find ${req.originalUrl} on this server`, 404));
});

app.use(ErrorMiddleware);

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
    connectDb();
});
