'use server';

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { Weather } from '@/components/weather';
import { generateText } from 'ai';
import { createStreamableUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';


const axios = require('axios');

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  display?: ReactNode;
}

export async function getResponseFromCeleris(messages: CoreMessage[]){
  console.log(`Calling the Celeris Search APIs`)
  try {
    
    const length_of_message = messages.length
    console.log(messages[length_of_message-1])
    const response = await axios({
      method: 'post', // or 'post' for POST requests
      url: 'https://ramisra--celeris-yc-fastapi-app.modal.run/search?query='+ messages[length_of_message-1].content,
    });

    console.log(response.data)
    return response.data

    // Pipe the response to process.stdout to log to the console, or handle the stream as needed.
    // response.data.pipe(process.stdout);

    // // Optionally, handle the stream events directly.
    // response.data.on('data', (chunk) => {
    //   console.log('New chunk received:', chunk.toString());
    // });

    // response.data.on('end', () => {
    //   console.log('Streaming complete');
    // });
  } catch (error) {
    console.error('Error while streaming:', error);
  }
  
}

// Streaming Chat 
export async function continueTextConversation(messages: CoreMessage[]) {
  console.log("Calling open ai model")
    
  const search_result = await getResponseFromCeleris(messages)
  const result = await streamText({
    model: openai('gpt-4-turbo'),
    prompt: `Represent the below data in tabular format; you can format the table as:
    | Column 1 | Column 2 | Column 3 |
    |----------|----------|----------|
    | Data 1   | Data 2   | Data 3   |
    | Data 4   | Data 5   | Data 6   | 

    <Data>
    ${JSON.stringify(search_result)}
    </Data>
    `
  })

  console.log("called the open ai")
  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

// Gen UIs 
export async function continueConversation(history: Message[]) {
  const stream = createStreamableUI();

  const { text, toolResults } = await generateText({
    model: openai('gpt-3.5-turbo'),
    system: 'You are a friendly weather assistant!',
    messages: history,
    tools: {
      showWeather: {
        description: 'Show the weather for a given location.',
        parameters: z.object({
          city: z.string().describe('The city to show the weather for.'),
          unit: z
            .enum(['F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async ({ city, unit }) => {
          // stream.done(<Weather city={city} unit={unit} />)
          return `Here's the weather for ${city}!`
        },
      },
    },
  })

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content:
          text || toolResults.map(toolResult => toolResult.result).join(),
        display: stream.value,
      },
    ],
  }
}

// Utils
export async function checkAIAvailability() {
  const envVarExists = !!process.env.OPENAI_API_KEY;
  return envVarExists;
}