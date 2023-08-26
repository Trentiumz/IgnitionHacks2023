const express = require('express')
require('dotenv').config()
const app = express()
const port = 3000

const {Client} = require("@notionhq/client")
const notion = new Client({auth: process.env.NOTION_KEY})

app.use(express.static('public'))

app.get('/notes_embed', (req, res) => {
  res.sendFile(__dirname + "/static/notes-embed.html")
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})