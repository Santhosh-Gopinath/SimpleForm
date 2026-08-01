const express = require('express')

const router = express.Router()

const {
  getTableData,
  updateRecord,
  deleteRecord,
  bulkDeleteRecords,
  exportTablePdf,
  exportTableWord,
} = require('../../controllers/tablecontroller/tablecontroller')

router.get('/export-pdf', exportTablePdf)
router.get('/export-word', exportTableWord)
router.get('/', getTableData)
router.post('/bulk-delete', bulkDeleteRecords)
router.put('/:id', updateRecord)
router.delete('/:id', deleteRecord)

module.exports = router