import { NextRequest, NextResponse } from 'next/server';
import { HindsightGeneric } from '@/lib/hindsight';

const BANK_ID = process.env.HINDSIGHT_BANK_ID || 'ai-mentor';

export async function POST(req: NextRequest) {
  try {
    const { prompt, schema } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const fullPrompt = schema 
      ? `Generate a strictly formatted JSON response for the following prompt. Do not include markdown formatting like \`\`\`json, just pure JSON text.\n\nSCHEMA REQUIREMENTS:\n${JSON.stringify(schema)}\n\nPROMPT:\n${prompt}`
      : prompt;

    const llm = new HindsightGeneric({ bankId: BANK_ID });
    let modelText = await llm.invoke(fullPrompt);

    // Clean up potential markdown blocks if schema is requested
    if (schema) {
      modelText = modelText.trim();
      if (modelText.startsWith('```json')) modelText = modelText.replace(/^```json/, '');
      if (modelText.startsWith('```')) modelText = modelText.replace(/^```/, '');
      if (modelText.endsWith('```')) modelText = modelText.replace(/```$/, '');
      modelText = modelText.trim();
    }

    return NextResponse.json({ text: modelText });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
