const express = require('express')

const router = express.Router()

const {
  getTableData,
  updateRecord,
  deleteRecord,
  bulkDeleteRecords,
} = require('../../controllers/tablecontroller/tablecontroller')

router.get('/', getTableData)
router.post('/bulk-delete', bulkDeleteRecords)
router.put('/:id', updateRecord)
router.delete('/:id', deleteRecord)

module.exports = router