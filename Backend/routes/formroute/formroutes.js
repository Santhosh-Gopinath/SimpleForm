const express = require('express')
const router = express.Router()
const { createForm, getForms } = require('../../controllers/formcontroller/formcontroller')

router.post('/', createForm)
router.get('/', getForms)

module.exports = router
