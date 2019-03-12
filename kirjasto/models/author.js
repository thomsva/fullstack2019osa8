const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 2
  },
  born: {
    type: Number,
    max: 2019
  },
  bookCount: {
    type: Number
  }
})

module.exports = mongoose.model('Author', schema)