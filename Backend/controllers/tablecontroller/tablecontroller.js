const Table = require('../../model/tablemodel/tablemodel')
const DeleteLog = require('../../model/deletelogmodel/deletelogmodel')

// GET /api/table?page=1&limit=5
const getTableData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page - 1) * limit

    const totalCount = await Table.countDocuments()

    const records = await Table.find()
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      data: records,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/table/:id
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, dob, gender, address } = req.body

    const updated = await Table.findByIdAndUpdate(
      id,
      { name, email, phone, dob, gender, address },
      { new: true, runValidators: true }
    )

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' })
    }

    res.status(200).json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/table/:id  (single record)
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params

    const record = await Table.findById(id)
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' })
    }

    // Save a full copy into the delete log before removing it
    await DeleteLog.create({
      originalId: record._id.toString(),
      name: record.name,
      email: record.email,
      phone: record.phone,
      dob: record.dob,
      gender: record.gender,
      address: record.address,
      deletedAt: new Date(),
    })

    await Table.findByIdAndDelete(id)

    res.status(200).json({ success: true, message: 'Record deleted successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/table/bulk-delete  (body: { ids: [id1, id2, ...] })
const bulkDeleteRecords = async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No records selected' })
    }

    const records = await Table.find({ _id: { $in: ids } })

    const logEntries = records.map((record) => ({
      originalId: record._id.toString(),
      name: record.name,
      email: record.email,
      phone: record.phone,
      dob: record.dob,
      gender: record.gender,
      address: record.address,
      deletedAt: new Date(),
    }))

    await DeleteLog.insertMany(logEntries)
    await Table.deleteMany({ _id: { $in: ids } })

    res.status(200).json({ success: true, message: 'Selected records deleted successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getTableData, updateRecord, deleteRecord, bulkDeleteRecords }
