const express = require('express')
const cors = require('cors')
const formRoutes = require('./routes/formroute/formroutes')
const tableRoutes = require('./routes/tableroute/tableroute')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/forms', formRoutes)
app.use('/api/table', tableRoutes)

module.exports = app
