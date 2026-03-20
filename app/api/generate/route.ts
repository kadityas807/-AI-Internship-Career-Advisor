import { NextRequest, NextResponse } from 'next/server';
import { LLM, type BaseLLMParams } from '@langchain/core/language_models/llms';

const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY!;
const BANK_ID = process.env.HINDSIGHT_BANK_ID || 'ai-mentor';
const HINDSIGHT_BASE = 'https://api.hindsight.vectorize.io';

export class HindsightGeneric extends LLM {
  bankId: string;

  constructor(fields: { bankId: string } & BaseLLMParams) {
    super(fields);
    this.bankId = fields.bankId;
  }

  _llmType() { return 'hindsight_generic'; }

  async _call(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000);

    try {
      const res = await fetch(`${HINDSIGHT_BASE}/v1/default/banks/${this.bankId}/reflect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HINDSIGHT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: prompt,
          context: '',
          budget: 'high',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Hindsight API error ${res.status}`);
      }

      const data = await res.json();
      return data?.text || '{}';
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}

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
