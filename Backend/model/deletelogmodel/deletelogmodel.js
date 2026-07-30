const mongoose = require('mongoose')

const deleteLogSchema = new mongoose.Schema(
  {
    originalId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'deletelogs' }
)

module.exports = mongoose.model('DeleteLog', deleteLogSchema)
