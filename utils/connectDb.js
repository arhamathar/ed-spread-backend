const mongoose = require('mongoose');

const connectDb = () => {
    console.log(process.env.MONGO_PASSWORD);
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
            console.log(e);
            console.log('Databse connection failed!');
        });
};

module.exports = connectDb;
