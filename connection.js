const mongoose = require('mongoose');
class Database {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose.connect(process.env.MONGODB_URL)
      .then(() => {
        console.log('database connected successfully');
      })
      .catch((err) => {
        console.log(`Error connection to database : ${err}`);
      })
  }
}

module.exports = new Database();