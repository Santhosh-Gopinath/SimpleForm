const mongoose = require('mongoose')

// Same fields as formmodel — points to the SAME 'forms' collection
// so this model can read the data that formmodel already saved.
const tableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true, collection: 'forms' }
)

module.exports = mongoose.model('Table', tableSchema)