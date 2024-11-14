const mongoose = require('mongoose');
const dbConfig = require('./config/dbConfig'); // Assuming dbConfig is in CommonJS format as well

const dbConnect = async () => {
  try {
    await mongoose.connect(dbConfig.db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = dbConnect;
