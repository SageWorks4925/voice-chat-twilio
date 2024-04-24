const OpenAI = require('openai');

const openai = new OpenAI();

async function callMyGPT() {  
  const completion = await openai.chat.completions.create({
    messages: [{"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Who won the world series in 2020?"},
        {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
        {"role": "user", "content": "Where was it played?"}],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}


module.exports = callMyGPT;