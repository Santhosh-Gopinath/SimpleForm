const Form = require('../../model/formmodel/formmodel')

// POST /api/forms
const createForm = async (req, res) => {
  try {
    const { name, email, phone, dob, gender, address } = req.body

    const newForm = await Form.create({ name, email, phone, dob, gender, address })

    res.status(201).json({ success: true, data: newForm })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/forms
const getForms = async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, data: forms })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { createForm, getForms }
