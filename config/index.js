const dotenv = require('dotenv');
const path = require('path')
dotenv.config()

module.exports = {
  urlDb: process.env.MONGO_URL
}