const mongoDb = require('mongoose')
require('dotenv').config()
const express = require('express')
const app = express()
//const verify = require('./middleware/verifyJwt')
const cookie = require('cookie-parser')
const cors = require('cors')





mongoDb.connect(process.env.MONGODB_URI, (err, success) => {
    if (err) {
        console.log('there was an error connecting to your database, please try again')
    } else {
        app.listen(3000, ()=> {
            console.log('server is running on port 3000')
        })
        console.log('connection to db successful')
    }
})
app.use(cors())
app.use(cookie())
app.use(express.json())

app.use('/', require('./routes/auth.js'))
app.use('/', require('./routes/post'))
app.use('/', require('./routes/profile'))

app.get('/home(.html)?', (req, res) => {
    res.send("this is a testing page")
})



