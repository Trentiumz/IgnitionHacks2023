const express = require('express')
require('dotenv').config()
const app = express()
const port = 3000

const { Client } = require("@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })

const { runtime, queryGPT } = require('./route')

const rich_to_plain = (rich_text) => {
  return rich_text.reduce((acc, cur) => acc + cur.plain_text, "")
}

async function get_content(id, text_values, link="https://www.notion.so/Test-Notes-069351ce9b824ceb9919f1102e82d0a1") {
  // query page
  const blockId = id
  const response = await notion.blocks.children.list({
    block_id: blockId
  })
  link += "pvs=1#" 

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

const isIntegral = (str) => {
    return /^\+?(0|[1-9]\d*)$/.test(str);
}

const generateQuestions = async (notes) => {
  // generate 15 questions
  const lines = ["Generate up to 15 questions and answers that are self-contained within this article. For each answer, give two direct quotes within the article supporting it enclosed in quotation marks with parentheses noting the line number you found the quote in. Make sure to test a random subset of lines:", ...(notes.map((x, ind) => `${ind + 1}. "${x[0]}"`))]
  const query = lines.join('\n')
  const response = (await queryGPT(query, temperature = 0)).split('\n')

  // loop through the questions
  let curQ = 0
  let inOrder = true

  // list of questions
  const questions = []

  // parse response
  response.forEach((line) => {
    if(line.length > 0){
      // split by a period
      const splitByP = line.split(".", 2)
      const numStr = splitByP[0]

      // whether the current line is the first in the question response
      let isFirst = false

      if(isIntegral(numStr)){
        // if it is the first in the response, then set the current question number
        const num = parseInt(numStr)
        if(num === curQ + 1){
          curQ = num
          isFirst = true
        } else {
          inOrder = false
        }
      }

      // add question for new questions
      if(questions.length < curQ) questions.push({
        question: "",
        answer: []
      })

      // the first line is a question
      if(isFirst) {
        questions[curQ-1].question = splitByP[1].trim()
      } else {
        // subsequent lines form answers
        questions[curQ-1].answer.push(line).trim()
      } 
    }
  })

  if(!inOrder){
    console.log("UNABLE TO ORDER QUESTIONS PROPERLY -- log of response:")
    console.log(response)
  }

  return questions
}

const create_toggle = (top_text, children) => {
  return {
    "object": "block",
    "type": "toggle",
    "has_children": children.length > 0,
    "toggle": {
      "rich_text": [
        {"type": "text", "text": {"content": top_text}, "plain_text": "Question"}
      ],
      "children": children.length > 0 ? children : undefined
    }
  }
}

const create_paragraph = (text, children=[]) => {
  return {
    "object": "block",
    "type": "paragraph",
    "has_children": children.length > 0,
    "paragraph": {
      "rich_text": [
        {"type": "text", "text": {"content": text}, "plain_text": "Answer"}
      ], 
      "children": children.length > 0 ? children : undefined
    }
  }
}

const create_questions_page = async (questions) => {
  const blockId = process.env.NOTION_PAGE_ID
  const questionBlocks = questions.map((el) => create_toggle(el.question, [create_paragraph(el.answer)]))
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
      "title": [
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
              "content": "A list of questions"
            }
          }
        ]
      }
    },
    ...questionBlocks
    ]
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

app.post('/generatequiz/:id', async (req, res) => {
  const note_list = []
  const data = JSON.parse(req.body)
  await get_content(data.link, note_list)
  console.log(note_list)
  const questions = await generateQuestions(note_list)
  const response = await create_questions_page(questions)

  res.json(response)
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

  const response = await create_questions_page([
    {
      question: "Question",
      answer: "Answer"
    },
    {
      question: "Quackity",
      answer: "Answerity"
    },
    {
      question: "yayyy",
      answer: "no."
    },
  ])
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