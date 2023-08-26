const OpenAI = require('openai')
const { OpenAIStream, StreamingTextResponse } = require('ai');
 
// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 
// Set the runtime to edge for best performance
exports.runtime = 'edge';
 
exports.queryGPT = async (prompt, temperature=0.6) => {
  // Ask OpenAI for a streaming completion given the prompt
  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
    temperature: temperature
  });
  return response.choices[0].message.content
}