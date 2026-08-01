const Table = require('../../model/tablemodel/tablemodel')
const DeleteLog = require('../../model/deletelogmodel/deletelogmodel')
const PDFDocument = require('pdfkit')
const { Document, Packer, Paragraph, PageBreak } = require('docx')

const { MARGIN, drawWatermark, drawSlimHeader, drawFooter } = require('./pdfDesign')
const { drawCoverPage, drawCard, cardHeight } = require('./pdfSections')
const { buildCoverPage, buildEmployeeCard } = require('./wordSections')

// A4 in DXA (twips): 1 inch = 1440 DXA. Margin kept at 0.5in so the content
// width closely matches the PDF's usable width (A4 width - 2*40pt margin).
const WORD_PAGE = { width: 11906, height: 16838 }
const WORD_MARGIN = 720

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
// Cover page (brand + headcount stats + department breakdown) followed by
// two employee bio-data cards per page. See pdfDesign.js / pdfSections.js
// for the drawing helpers.
// Shared by both the PDF and Word exports: headcount + department tally for
// the cover page. Free-text department values are trimmed as typed; blank
// values are grouped under "Unspecified". If there are many distinct
// departments, keep the top 8 and roll the rest into "Other" so the
// breakdown panel never overflows.
function summarizeRecords(records) {
  const totalCount = records.length
  const maleCount = records.filter((r) => r.gender === 'male').length
  const femaleCount = records.filter((r) => r.gender === 'female').length

  const tally = {}
  records.forEach((r) => {
    const dept = (r.department || '').trim() || 'Unspecified'
    tally[dept] = (tally[dept] || 0) + 1
  })
  let deptCounts = Object.entries(tally).sort((a, b) => b[1] - a[1])
  if (deptCounts.length > 8) {
    const top = deptCounts.slice(0, 7)
    const otherTotal = deptCounts.slice(7).reduce((sum, [, c]) => sum + c, 0)
    deptCounts = [...top, ['Other', otherTotal]]
  }
  if (deptCounts.length === 0) deptCounts = [['No records yet', 0]]

  return { totalCount, maleCount, femaleCount, deptCounts }
}

const exportTablePdf = async (req, res) => {
  try {
    const records = await Table.find().sort({ createdAt: 1 })
    const { totalCount, maleCount, femaleCount, deptCounts } = summarizeRecords(records)

    const doc = new PDFDocument({ size: 'A4', margin: MARGIN })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=Employee-Bio-Data.pdf')
    doc.pipe(res)

    const pageWidth = doc.page.width - 2 * MARGIN
    const PER_PAGE = 2
    const totalPages = 1 + Math.ceil(totalCount / PER_PAGE)

    drawCoverPage(doc, { totalCount, maleCount, femaleCount, deptCounts })

    for (let i = 0; i < records.length; i += PER_PAGE) {
      doc.addPage()
      drawWatermark(doc)
      drawSlimHeader(doc, pageWidth)

      const chunk = records.slice(i, i + PER_PAGE)
      const ch = cardHeight()
      const usableTop = MARGIN + 30
      const usableBottom = doc.page.height - MARGIN - 40
      const usableH = usableBottom - usableTop
      const gap = (usableH - chunk.length * ch) / (chunk.length + 1)

      let y = usableTop + gap
      chunk.forEach((record, j) => {
        drawCard(doc, MARGIN, y, record, i + j + 1, totalCount, pageWidth)
        y += ch + gap
      })

      drawFooter(doc, pageWidth, i / PER_PAGE + 2, totalPages)
    }

    doc.end()
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/table/export-word
// Same content and layout intent as exportTablePdf (cover page + department
// breakdown + one bordered "card" per employee), rebuilt with the `docx`
// library so the download is a real .docx instead of a PDF. Word has no
// free-form vector drawing, so a few PDF-only touches (true circular
// avatars, the rotated diagonal watermark, fully-rounded pills) are
// approximated with shaded table cells/text instead — see wordDesign.js.
const exportTableWord = async (req, res) => {
  try {
    const records = await Table.find().sort({ createdAt: 1 })
    const { totalCount, maleCount, femaleCount, deptCounts } = summarizeRecords(records)

    const contentWidth = WORD_PAGE.width - 2 * WORD_MARGIN

    const coverBlocks = buildCoverPage({ totalCount, maleCount, femaleCount, deptCounts, contentWidth })

    const cardBlocks = []
    records.forEach((record, i) => {
      cardBlocks.push(buildEmployeeCard(record, i + 1, totalCount, contentWidth))
      cardBlocks.push(new Paragraph({ spacing: { after: 200 }, children: [] }))
    })

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: { width: WORD_PAGE.width, height: WORD_PAGE.height },
              margin: { top: WORD_MARGIN, bottom: WORD_MARGIN, left: WORD_MARGIN, right: WORD_MARGIN },
            },
          },
          children: [
            ...coverBlocks,
            ...(cardBlocks.length ? [new Paragraph({ children: [new PageBreak()] }), ...cardBlocks] : []),
          ],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', 'attachment; filename=Employee-Bio-Data.docx')
    res.status(200).send(buffer)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getTableData, updateRecord, deleteRecord, bulkDeleteRecords, exportTablePdf, exportTableWord }
