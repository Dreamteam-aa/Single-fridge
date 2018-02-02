const mongoose = require('mongoose');
const DB_NAME = 'single-fridge';
const MONGO_URI = `mongodb://localhost/${DB_NAME}`;
const options = {
  useMongoClient: true,
};

mongoose.Promise = Promise;

mongoose.connect(MONGO_URI, options)
  .then(() => {
    console.log(`Connected to ${DB_NAME} database.`);
  }).catch((error) => {
    console.error(`Database connection error: ${error}`);
  });