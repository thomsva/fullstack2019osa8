const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 1
  },
  born: {
    type: Number,
    max: 2019
  },
})

module.exports = mongoose.model('Author', schema)