const express = require('express')
require('dotenv').config()
const app = express()
const port = 3000

const { Client } = require("@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })

const get_content = async () => {
  const blockId = process.env.NOTION_PAGE_ID
  const response = await notion.blocks.children.list({
    block_id: blockId
  })
  return response
}

const returnParsedNotes = async () +> {
  
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

//Creates new page to store Q&A
app.post('/add-sample-content1', async (req, res) => {
  const blockId = process.env.NOTION_PAGE_ID
  const q = ["1", "2", "3"]
  const a = ["1", "2", "3"]
      const response = await notion.pages.create({
        "icon": {
          "type": "emoji",
          "emoji": "📝"
        },
        "parent": {
          "type": "page_id",
          "page_id": blockId
        },
        "properties": {
          "title":[
            {
              type: "text",
              "text": {
                  "content": "Questions" 
              },
              "plain_text": "Questions"
            }
          ]
        },
        "children": [{
            "object": "block",
            "heading_2": {
                "rich_text": [
                    {
                        "text": {
                            "content": "Lacinato kale"
                        }
                    }
                ]
            }
        }]
        
    })   
  
  res.json(response)
})

app.get('/get-page-list', async (req, res) => {
  const response = await notion.search({
    filter: {
      value: 'page',
      property: 'object'
    }, sort: {
      direction: 'descending',
      timestamp: 'last_edited_time'
    }
  })
  res.json(response)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})