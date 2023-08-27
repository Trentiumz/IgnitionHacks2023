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

const create_paragraph = (text, note_list, children=[]) => {
  const refInd = text.search("\\(Lines? \\d+(\\-\\d+)?\\)")
  const parts = text.split("\"").flatMap((val, ind, arr) => arr.length - 1 !== ind ? [val, "\""]: val);
  
  const parsedParts = parts.map((el) => {
    if(el !== "\"" && el.length > 3){
      const sourceLine = note_list.find((line) => line[0].includes(el))
      if(sourceLine){
        return {"type": "text", "text": {
            "content": el,
            "link": {
              "url": sourceLine[1]
            }
          }, 
          "plain_text": sourceLine[0]
        }
      }
    }
    return {"type": "text", "text": {"content": el}, "plain_text": el}
  })
  return {
    "object": "block",
    "type": "paragraph",
    "has_children": children.length > 0,
    "paragraph": {
      "rich_text": parsedParts, 
      "children": children.length > 0 ? children : undefined
    }
  } 
}

const create_paragraphs = (text, note_list) => {
  return text.map((x) => create_paragraph(x, note_list))
}

exports.create_questions_page = (questions, blockId, note_list) => {
  const questionBlocks = questions.map((el) => create_toggle(el.question, create_paragraphs(el.answer, note_list)))
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