const express = require('express')

const router = express.Router()

const { createForm, bulkCreateForms, getForms } = require('../../controllers/formcontroller/formcontroller')

router.post('/', createForm)
router.post('/bulk', bulkCreateForms)
router.get('/', getForms)

module.exports = router