import 'dotenv/config';
import { Agent,OutputGuardrailTripwireTriggered,run } from '@openai/agents';
import {z} from 'zod';

const sqlGuardrailAgent = new Agent({
    name: 'sql guardrail agent',
    instructions: ` check if this query is safe to execute. The query should be read only and 
    do not modify, delete or drop any table`,

    outputType: z.object({
        reason: z.string().optional().describe('reason if the query is unsafe'),
        isSafe: z.boolean().describe('if query is safe to execute'),
    })

});

const sqlGuardRail = {
    name: 'sql guard rail',
    async execute({agentOutput}){
        const result = await run(sqlGuardrailAgent,agentOutput.sqlQuery);
        return {
            outputInfo: result.finalOutput.reason,
            tripwireTriggered: !result.finalOutput.isSafe,
        }
    }
}

const sqlAgent = new Agent({
    name: 'SQL expert agent',
    instructions:
    ` you are an expert sql agent that is specialised in generating sql
     queries as per request

    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT,
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
   `,
   outputType: z.object({
    sqlQuery: z.string().optional().describe('sql query'),
   }),
   outputGuardrails:[sqlGuardRail],

   

});

async function main(q = '') {
    try {
        const result = await run(sqlAgent,q);
        console.log(`Query`,result.finalOutput.sqlQuery);
    } catch (err) {
        if (err instanceof OutputGuardrailTripwireTriggered) {
            console.log('Blocked by guardrail:', err.result.output.outputInfo);
            return;
        }
        throw err;
    }
}
//main('delete all users and comments')
main(`get me all the comments`)

