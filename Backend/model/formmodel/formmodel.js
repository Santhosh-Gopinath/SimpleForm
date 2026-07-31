const mongoose = require('mongoose')

const formSchema = new mongoose.Schema(
  {
    // ---- core fields ----
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },

    // ---- employee details (extra fields) ----
    employeeId: { type: String, default: '' },
    designation: { type: String, default: '' },
    department: { type: String, default: '' },
    dateOfJoining: { type: String, default: '' },
    employmentType: { type: String, enum: ['', 'Full-time', 'Intern', 'Contract'], default: '' },
    employmentStatus: { type: String, enum: ['Active', 'Resigned', 'On Leave'], default: 'Active' },
    reportingManager: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    qualification: { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Form', formSchema)