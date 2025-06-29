import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { entity, data, errors } = await req.json();
  const prompt = `You are an expert data wrangler. Given the following ${entity} data and a list of validation errors, return a fixed version of the data as valid JSON.\n\nData: ${JSON.stringify(data)}\nErrors: ${JSON.stringify(errors)}\n\nFixed Data:`;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const content = response.choices[0].message?.content || '[]';
    const fixed = JSON.parse(content);
    return NextResponse.json({ fixed });
  } catch (error: any) {
    return NextResponse.json({ fixed: data, error: error.message || 'OpenAI error' }, { status: 200 });
  }
} 