import 'dotenv/config';
import { Agent,tool,run } from '@openai/agents';
import {z} from 'zod';
import fs from 'node:fs/promises'

const fetchAvailablePlans = tool({
    name:'fetch_available_plans',
    description:'fetch available plans for the internet',
    parameters: z.object({}),
    execute:async function () {
        return [{plan_id:'1',price_inr:300,speed:'30MB/s'},
            {plan_id:'2',price_inr:400,speed:'40MB/s'},
        {plan_id:'3',price_inr:600,speed:'80MB/s'}]
        
    }
});

const processRefund = tool({
    name: 'process_refund',
    description:' this tool refund the amount of the customer',
    parameters: z.object({
        customerId: z.string().describe('id of the cutomer'),
        reason: z.string().describe('reason to cancel the plan'),
    }),
    execute: async function ({customerId,reason}) {
        await fs.appendFile('./refund.txt',`Refund for customer having ${customerId} for ${reason}`,'utf-8' )
        
    },

})
const refundAgent = new Agent({
    name:'Refund Agent',
    instructions: ' you are expert in issuing refund to the customers',
    tools:[processRefund],


})


const salesAgent = new Agent({
    name: 'Sales Agent',
    instructions: 'you are expert in sales of broadband company talk to user and help them what they need',
    tools:[fetchAvailablePlans,refundAgent.asTool({
        toolName:'refund_expert',
        toolDescription: 'handles refund questions and requests'
    })],

})

async function runAgent(query = ''){
    const result = await run(salesAgent,query);
    console.log(result.finalOutput);

}

runAgent('i had a plan of 300 inr and i need refund right now. my customer id is cust123 because i am shifting to a new place');
