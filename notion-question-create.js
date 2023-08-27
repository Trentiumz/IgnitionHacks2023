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
  
  if(refInd >= 0){
    let closeInd = text.slice(refInd).search("\\)|\\-")
    if(closeInd >= 0) closeInd += refInd
    let closeBracket = text.indexOf(")", refInd)
    
    if(closeInd >= 0){
      const before = text.substr(0, refInd+1)
      const after = text.substr(closeBracket)
      const index = parseInt(text.substr(refInd+6+(text.charAt(refInd+5) === 's' ? 1 : 0), closeInd))
      const toInclude = index <= note_list.length
      if(toInclude){
        return {
          "object": "block",
          "type": "paragraph",
          "has_children": children.length > 0,
          "paragraph": {
            "rich_text": [
              {"type": "text", "text": {"content": before}, "plain_text": before},
              {"type": "text", "text": {
                  "content": "source",
                  "link": {
                    "url": note_list[index-1][1]
                  }
                }, 
                "plain_text": "source"
              },
              {"type": "text", "text": {"content": after}, "plain_text": after}
            ], 
            "children": children.length > 0 ? children : undefined
          }
        } 
      } else {
        text = text.substr(0, refInd).trim()
      }
    }
  }
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