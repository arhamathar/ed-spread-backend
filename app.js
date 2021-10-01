const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(morgan('dev'));

app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can not find ${req.originalUrl} on this server`,
    });
});

app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
