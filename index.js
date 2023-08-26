const express = require('express')
require('dotenv').config()
const app = express()
const port = 3000

const {Client} = require("@notionhq/client")
const notion = new Client({auth: process.env.NOTION_KEY})

const get_content = async () => {
  const blockId = process.env.NOTION_PAGE_ID
  const response = await notion.blocks.children.list({
    block_id: blockId
  })
  return response
}

app.use(express.static('public'))

app.get('/notes_embed', (req, res) => {
  res.sendFile(__dirname + "/static/notes-embed.html")
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/read-page-content', async (req, res) => {
  const response = await get_content()
  res.json(response)
})

app.post('/add-sample-content', async (req, res) => {
  const blockId = process.env.NOTION_PAGE_ID
  const response = await notion.blocks.children.append({
    block_id: blockId,
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Sample Text!'
              },
              plain_text: 'text'
            }
          ]
        }
      }
    ]
  })
  res.json(response)
})

app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})