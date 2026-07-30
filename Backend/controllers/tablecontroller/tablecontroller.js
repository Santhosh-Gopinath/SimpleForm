const Table = require('../../model/tablemodel/tablemodel')

// GET /api/table
const getTableData = async (req, res) => {
  try {
    const records = await Table.find().sort({ createdAt: 1 })
    res.status(200).json({ success: true, count: records.length, data: records })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getTableData }