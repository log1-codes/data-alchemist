import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

type Entity = 'client' | 'worker' | 'task';

export async function POST(req: NextRequest) {
  const { rawHeaders, entity } = await req.json() as { rawHeaders: string[]; entity: Entity };
  if (!rawHeaders || !entity) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  const canonical: Record<Entity, string[]> = {
    client: ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'],
    worker: ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'],
    task: ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'],
  };
  const prompt = `Map the following headers to the canonical schema for a ${entity} entity.\nCanonical: ${canonical[entity].join(', ')}\nRaw: ${rawHeaders.join(', ')}\nReturn a JSON object where keys are raw headers and values are canonical headers or null if not mappable.`;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const text = response.choices[0].message?.content || '{}';
    const mapping = JSON.parse(text);
    return NextResponse.json({ mapping });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'OpenAI error' }, { status: 500 });
  }
} 