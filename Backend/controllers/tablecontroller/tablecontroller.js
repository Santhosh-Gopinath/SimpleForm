const Table = require('../../model/tablemodel/tablemodel')
const DeleteLog = require('../../model/deletelogmodel/deletelogmodel')
const PDFDocument = require('pdfkit')

// GET /api/table?page=1&limit=5&search=text
const getTableData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page - 1) * limit
    const search = (req.query.search || '').trim()

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    const totalCount = await Table.countDocuments(filter)

    const records = await Table.find(filter)
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
      id, req.body,
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

// GET /api/table/export-pdf
// Renders each employee as a Bio-Data + Employee detail card (black & white,
// Times New Roman), two cards per page, matching the Hurryep bio-data form.
const exportTablePdf = async (req, res) => {
  try {
    const records = await Table.find().sort({ createdAt: 1 })

    const genderLabel = (value) => {
      if (value === 'male') return 'Male'
      if (value === 'female') return 'Female'
      if (value === 'other') return 'Other'
      return value || ''
    }

    const BLACK = '#000000'
    const GRAY = '#D9D9D9'
    const ROW_H = 22
    const SPACER_H = 10
    const CARD_GAP = 20
    const PER_PAGE = 2

    const doc = new PDFDocument({ size: 'A4', margin: 40 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=Employee-Bio-Data.pdf')
    doc.pipe(res)

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const left = doc.page.margins.left

    const drawRow = (y, cols, opts = {}) => {
      const h = opts.height || ROW_H
      let x = left
      if (opts.shaded) {
        doc.rect(left, y, pageWidth, h).fillColor(GRAY).fill()
      }
      doc.strokeColor(BLACK).lineWidth(1)
      doc.rect(left, y, pageWidth, h).stroke()
      doc.fillColor(BLACK)
      doc.font(opts.bold ? 'Times-Bold' : 'Times-Roman').fontSize(10)
      cols.forEach((col) => {
        if (opts.centered) {
          doc.text(col.text, x, y + h / 2 - 5, { width: col.width, align: 'center' })
        } else {
          doc.text(col.text, x + 5, y + h / 2 - 5, { width: col.width - 10, align: 'left' })
        }
        x += col.width
      })
      if (cols.length > 1) {
        let vx = left
        for (let i = 0; i < cols.length - 1; i++) {
          vx += cols[i].width
          doc.moveTo(vx, y).lineTo(vx, y + h).stroke()
        }
      }
      return y + h
    }

    const drawBlankRow = (y) => {
      doc.strokeColor(BLACK).lineWidth(1)
      doc.rect(left, y, pageWidth, SPACER_H).stroke()
      return y + SPACER_H
    }

    const cardHeight = () => ROW_H * 8 + SPACER_H

    const drawCard = (startY, r) => {
      const w3 = pageWidth / 3
      let y = startY

      y = drawRow(y, [{ text: `Bio-Data: ${r.name || ''}`, width: pageWidth }], { shaded: true, bold: true, centered: true })
      y = drawRow(y, [
        { text: `Full name: ${r.name || ''}`, width: w3 },
        { text: `Email: ${r.email || ''}`, width: w3 },
        { text: `Blood Group: ${r.bloodGroup || ''}`, width: w3 },
      ])
      y = drawRow(y, [
        { text: `Gender: ${genderLabel(r.gender)}`, width: w3 },
        { text: `Phone Number: ${r.phone || ''}`, width: w3 },
        { text: `Highest Qualification: ${r.qualification || ''}`, width: w3 },
      ])
      y = drawRow(y, [
        { text: `Emergency contact: ${r.emergencyContact || ''}`, width: w3 },
        { text: `Address: ${r.address || ''}`, width: w3 * 2 },
      ])
      y = drawBlankRow(y)
      y = drawRow(y, [{ text: 'Employee detail', width: pageWidth }], { shaded: true, bold: true, centered: true })
      y = drawRow(y, [
        { text: `Employee ID: ${r.employeeId || ''}`, width: w3 },
        { text: `Designation: ${r.designation || ''}`, width: w3 },
        { text: `Department: ${r.department || ''}`, width: w3 },
      ])
      y = drawRow(y, [
        { text: `Date of Joining: ${r.dateOfJoining || ''}`, width: w3 },
        { text: `Employment Type: ${r.employmentType || ''}`, width: w3 * 2 },
      ])
      y = drawRow(y, [{ text: `Reporting Manager: ${r.reportingManager || ''}`, width: pageWidth }])

      return y
    }

    // ---- title + totals ----
    doc.font('Times-Bold').fontSize(18).fillColor(BLACK)
    doc.text('HURRYEP TECHNOLOGY', left, doc.y, { width: pageWidth, align: 'center' })
    doc.font('Times-Bold').fontSize(14)
    doc.text('EMPLOYEE RECORDS', { width: pageWidth, align: 'center' })
    doc.moveDown(1)

    const totalCount = records.length
    const maleCount = records.filter((r) => r.gender === 'male').length
    const femaleCount = records.filter((r) => r.gender === 'female').length

    doc.font('Times-Bold').fontSize(12)
    doc.text(`TOTAL COUNTS: ${totalCount}`, left, doc.y, { width: pageWidth })
    doc.text(`TOTAL MALE: ${maleCount}`, left, doc.y, { width: pageWidth })
    doc.text(`TOTAL FEMALE: ${femaleCount}`, left, doc.y, { width: pageWidth })
    doc.moveDown(1)

    let y = doc.y
    records.forEach((record, index) => {
      const h = cardHeight()
      if (y + h > doc.page.height - doc.page.margins.bottom) {
        doc.addPage()
        y = doc.page.margins.top
      }
      y = drawCard(y, record)
      y += CARD_GAP

      const posOnPage = (index + 1) % PER_PAGE
      if (posOnPage === 0 && index + 1 < records.length) {
        doc.addPage()
        y = doc.page.margins.top
      }
    })

    doc.end()
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getTableData, updateRecord, deleteRecord, bulkDeleteRecords, exportTablePdf }
