const express = require('express')
const app = express()
const port = 3001

app.get('/', (req, res) => {
    res.send('Serveur Diego!')
})

app.post('/api/v1/', (req, res) => {
    res.send('Serveur Diego!')
})

app.listen(port, () => {
    console.log(`Server started on ${port}`)
})
