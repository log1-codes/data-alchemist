import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  const prompt = `You are an expert in resource allocation. Given the following plain English rule, convert it to a JSON object with fields: type (one of coRun, slotRestriction, loadLimit, phaseWindow, patternMatch, precedenceOverride), description (string), and params (object with relevant parameters). Example: {"type":"coRun","description":"T1 and T2 must run together","params":{"tasks":["T1","T2"]}}. Rule: ${text}`;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const content = response.choices[0].message?.content || '{}';
    const parsed = JSON.parse(content);
    const rule = {
      id: Math.random().toString(36).slice(2),
      type: parsed.type || 'patternMatch',
      description: parsed.description || text,
      params: parsed.params || {},
    };
    return NextResponse.json({ rule });
  } catch (error: any) {
    return NextResponse.json({
      rule: {
        id: Math.random().toString(36).slice(2),
        type: 'patternMatch',
        description: text,
        params: {},
      },
      error: error.message || 'OpenAI error',
    }, { status: 200 });
  }
} 