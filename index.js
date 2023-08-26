const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

require('dotenv').config()
const app = express()
app.use(cors())
const port = 3000

const { Client } = require("@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })
const jsonParser = bodyParser.json()

const { generateQuestions } = require('./route')
const {create_questions_page} = require('./notion-question-create')

const rich_to_plain = (rich_text) => {
  return rich_text.reduce((acc, cur) => acc + cur.plain_text, "")
}

async function get_content(id, text_values, link="https://www.notion.so/Test-Notes-069351ce9b824ceb9919f1102e82d0a1") {
  // query page
  const blockId = id
  const response = await notion.blocks.children.list({
    block_id: blockId
  })
  link += "?pvs=1#" 

  // recursively search responses, adding text & blocks to a list
  for (let i = 0; i < response.results.length; i++){ 
    const el = response.results[i]
    const properties = ['bulleted_list_item', 'numbered_list_item', 'paragraph', 'quote', 'toggle']

    // allowed property types
    for(let property of properties){
      if(el.type === property){
        // if the property matches, add it
        if(el[property].rich_text.length > 0){
          const currAns = [rich_to_plain(el[property].rich_text)]
          currAns.push(link + el.id.split('-').join (''))
          text_values.push(currAns);
        }
      }
    }

    // recursively search
    if (el.has_children && el.type != 'child_page') {
      await get_content(el.id, text_values)
    }
  }
}

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/generatequiz/:id', jsonParser, async (req, res) => {
  const note_list = []
  const id = req.params.id
  await get_content(id, note_list, req.body.link)

  const questions = await generateQuestions(note_list)
  console.log(questions)
  const response = await notion.pages.create(create_questions_page(questions, id, note_list))
  res.status(200).json(response)
})

app.post('/read-page-content', async (req, res) => {
  const response = []
  await get_content(process.env.NOTION_PAGE_ID, response)
  res.json(response)
})

app.post('/read-raw-page', async (req, res) => {
  const blockId = process.env.NOTION_PAGE_ID
  const response = await notion.blocks.children.list({
    block_id: blockId
  })
  res.json(response)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})