const express = require('express')
const app = express()
const port = 3002

app.get('/', (req, res) => {
    res.send('Serveur Elise!')
})

app.post('/api/v1/', (req, res) => {
    res.send('Serveur Elise!')
})

app.listen(port, () => {
    console.log(`Server started on ${port}`)
})
