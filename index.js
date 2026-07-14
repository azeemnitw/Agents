import 'dotenv/config';
import { Agent , run } from "@openai/agents";


const helloAgent = new Agent({
    name: 'Hello Agent',
    instructions: 'You are an agent that always says hello world',
})

run(helloAgent,'hey my name is azeem').then((result)=>{
    console.log(result.finalOutput);
})