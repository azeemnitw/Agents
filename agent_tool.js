import 'dotenv/config';
import { Agent, run, tool } from "@openai/agents";
import {z} from 'zod';
import axios from 'axios';

const GetWeatherCity = z.object({
    city: z.string().describe('name of the city'),
    degree: z.number().describe('the degree celcius'),
    condition: z.string().optional().describe('condition of the weather'),

});

const getWeather = tool({
    name:'get weather',
    description: ' returns the current weather information of the asked city',
    parameters: z.object({
        city: z.string().describe('name of the city'),
    }),
    execute: async function ({city}){
        const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
        const response = await axios.get(url,{responseType:'text'});
        return `the weather of city ${city} is ${response.data}`;
    },
})

const sendEmail = tool({
    name: 'send email',
    description: 'this tool sends the email',
    parameters: z.object({
        toEmail: z.string().describe('email address to'),
        subject: z.string().describe('subject'),
        body: z.string().describe('body of the email'),
    }),
    execute: async function ({body,toEmail,subject}) {
        
    }
})

const agent = new Agent({
    name: 'weather agent',
    instructions: 'you are weather agent you need to tell temperature',
    tools:[getWeather],
    outputType: GetWeatherCity,
});



async function main(query = ''){
    const result = await run(agent,query);
    console.log(`Result`, result.finalOutput);
}
main('weather in lalitpur ');