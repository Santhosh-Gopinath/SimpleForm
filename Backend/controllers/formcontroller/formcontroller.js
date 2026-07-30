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

// POST /api/forms/bulk   (body: an array of form objects)
const bulkCreateForms = async (req, res) => {
  try {
    const records = req.body

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Request body must be a non-empty array' })
    }

    const inserted = await Form.insertMany(records, { ordered: true })

    res.status(201).json({ success: true, count: inserted.length, data: inserted })
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

module.exports = { createForm, bulkCreateForms, getForms }
