import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { clients, workers, tasks, rules } = await req.json();
  const prompt = `You are an expert validator for resource allocation systems. Given the following data (clients, workers, tasks, rules), list any subtle, cross-entity, or complex issues, warnings, or suggestions. Return an array of strings, each describing one issue or suggestion.\n\nClients: ${JSON.stringify(clients)}\nWorkers: ${JSON.stringify(workers)}\nTasks: ${JSON.stringify(tasks)}\nRules: ${JSON.stringify(rules)}\n\nFindings:`;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const content = response.choices[0].message?.content || '[]';
    const findings = JSON.parse(content);
    return NextResponse.json({ findings });
  } catch (error: any) {
    return NextResponse.json({ findings: [], error: error.message || 'OpenAI error' }, { status: 200 });
  }
} 