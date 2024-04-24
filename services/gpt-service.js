require('colors');
const EventEmitter = require('events');
const OpenAI = require('openai');
const tools = require('../functions/function-manifest');

// Import all functions included in function manifest
// Note: the function name and file name must be the same
const availableFunctions = {};
tools.forEach((tool) => {
  let functionName = tool.function.name;
  availableFunctions[functionName] = require(`../functions/${functionName}`);
});

class GptService extends EventEmitter {
  constructor() {
    super();
    this.openai = new OpenAI();
    this.userContext = [
      { 'role': 'system', 'content': 'You are an AI assistant that can answer the user queries.' },
      { 'role': 'assistant', 'content': 'Hello there! How can I help you ?' },
    ],
    this.partialResponseIndex = 0;
  }

  // Add the callSid to the chat context in case
  // ChatGPT decides to transfer the call.
  setCallSid (callSid) {
    this.userContext.push({ 'role': 'system', 'content': `callSid: ${callSid}` });
  }

  validateFunctionArgs (args) {
    try {
      return JSON.parse(args);
    } catch (error) {
      console.log('Warning: Double function arguments returned by OpenAI:', args);
      // Seeing an error where sometimes we have two sets of args
      if (args.indexOf('{') != args.lastIndexOf('{')) {
        return JSON.parse(args.substring(args.indexOf(''), args.indexOf('}') + 1));
      }
    }
  }

  updateUserContext(name, role, text) {
    if (name !== 'user') {
      this.userContext.push({ 'role': role, 'name': name, 'content': text });
    } else {
      this.userContext.push({ 'role': role, 'content': text });
    }
  }

  async completion(text, interactionCount, role = 'user', name = 'user') {
    this.updateUserContext(name, role, text);

    // Step 1: Send user transcription to Chat GPT
    //const stream = await this.openai.chat.completions.create({
    //  model: 'gpt-4-1106-preview',
    //  messages: this.userContext,
      //tools: tools,
      //stream: true,
    //});
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: text
        }
      ]
    };
    
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
      const content = data.choices[0].message.content ;
      let completeResponse = '';
      let partialResponse = '';
      completeResponse = content;
    partialResponse = content;
    const gptReply = { 
      partialResponseIndex: this.partialResponseIndex,
      partialResponse
    };
    this.emit('gptreply', gptReply, interactionCount);
    this.partialResponseIndex++;
    partialResponse = '';
    this.userContext.push({'role': 'assistant', 'content': completeResponse});
    console.log(`GPT -> user context length: ${this.userContext.length}`.green);
      
      console.log(data.choices[0].message.content + 'Hehehehe')
  
    }
  
  )
    .catch(error => console.error('Error:', error));
    //const content = "Echoing"; //stream.choices[0].message.content;
    //console.log(content);

    let functionName = '';
    let functionArgs = '';
    let finishReason = '';
    
  }
}

module.exports = { GptService };