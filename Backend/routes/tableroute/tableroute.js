const express = require('express')
const router = express.Router()
const { getTableData } = require('../../controllers/tablecontroller/tablecontroller')

router.get('/', getTableData)

module.exports = router