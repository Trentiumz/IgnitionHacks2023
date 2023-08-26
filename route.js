const OpenAI = require('openai')
const { OpenAIStream, StreamingTextResponse } = require('ai');
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
// Set the runtime to edge for best performance
const runtime = 'edge';
 
const queryGPT = async (prompt, temperature=0.6) => {
  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
    temperature: temperature
  });
  return response.choices[0].message.content
}

exports.generateQuestions = async (notes) => {
  const isIntegral = (str) => {
    return /^\+?(0|[1-9]\d*)$/.test(str);
  }
  
  // generate 15 questions
  const lines = ["Generate exactly 15 questions and answers that are self-contained within this article. For each answer, also give a direct quote within the article supporting it enclosed in quotation marks with parentheses noting the line number you found the quote in. Make sure to test a random subset of lines:", ...(notes.map((x, ind) => `${ind + 1}. "${x[0]}"`))]
  const query = lines.join('\n')
  const response = (await queryGPT(query)).split('\n')

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
        questions[curQ-1].answer.push(line.trim())
      } 
    }
  })

  if(!inOrder){
    console.log("UNABLE TO ORDER QUESTIONS PROPERLY -- log of response:")
    console.log(response)
  }

  return questions
}