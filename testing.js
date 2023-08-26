const { runtime, queryGPT } = require('./route')

const isIntegral = (str) => {
    return /^\+?(0|[1-9]\d*)$/.test(str);
}

// just for testing, will delete after
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

(async () => {
  console.log(await generateQuestions(["Child abuse/neglect occurs in all cultural, ethnic, occupational, and socioeconomic groups",
    "Some are not willful, may result from several factors",
    "Parental Predisposition (Having been abused/neglected themselves)",
    "Stress in home (marital, job, financial)",
    "Parent substance abuse",
    "Lack of parenting knowledge"]))
})()