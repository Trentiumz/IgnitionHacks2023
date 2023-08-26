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

const create_paragraphs = (text) => {
  return text.map((x) => create_paragraph(x))
}

exports.create_questions_page = (questions, blockId) => {
  const questionBlocks = questions.map((el) => create_toggle(el.question, create_paragraphs(el.answer)))
  return {
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
  }
}