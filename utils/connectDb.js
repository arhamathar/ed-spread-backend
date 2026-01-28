const mongoose = require('mongoose');

const connectDb = () => {
    mongoose
        .connect(
            process.env.MONGODB_URL.replace(
                '<password>',
                process.env.MONGO_PASSWORD
            )
        )
        .then(() => {
            console.log('Databse connected Successfully!');
        })
        .catch((e) => {
            console.log('Databse connection failed!', e);
        });
};

module.exports = connectDb;
