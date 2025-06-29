import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { clients, workers, tasks, rules } = await req.json();
  const prompt = `You are an expert in resource allocation. Given the following data (clients, workers, tasks, and current rules), suggest 2-3 new business rules that could improve allocation. For each, return a JSON object with fields: type (one of coRun, slotRestriction, loadLimit, phaseWindow, patternMatch, precedenceOverride), description (string), and params (object with relevant parameters). Return an array of such objects.\n\nClients: ${JSON.stringify(clients)}\nWorkers: ${JSON.stringify(workers)}\nTasks: ${JSON.stringify(tasks)}\nCurrent Rules: ${JSON.stringify(rules)}\n\nSuggestions:`;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });
    const content = response.choices[0].message?.content || '[]';
    const arr = JSON.parse(content);
    const suggestions = Array.isArray(arr) ? arr.map((r: any) => ({
      id: Math.random().toString(36).slice(2),
      type: r.type || 'patternMatch',
      description: r.description || '',
      params: r.params || {},
    })) : [];
    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json({ suggestions: [], error: error.message || 'OpenAI error' }, { status: 200 });
  }
} 