const express = require('express')
const cors = require('cors')
const formRoutes = require('./routes/formroute/formroutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/forms', formRoutes)

module.exports = app
