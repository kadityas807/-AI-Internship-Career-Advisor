import { NextRequest, NextResponse } from 'next/server';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { HindsightReflect } from '@/lib/hindsight';

const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY!;
const BANK_ID = process.env.HINDSIGHT_BANK_ID || 'ai-mentor';
const HINDSIGHT_BASE = 'https://api.hindsight.vectorize.io';

// Non-blocking fire-and-forget retain
function retainMemory(bankId: string, content: string, userId: string) {
  fetch(`${HINDSIGHT_BASE}/v1/default/banks/${bankId}/memories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HINDSIGHT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ content, tags: [userId] }],
      async: true,
    }),
  }).catch((err) => console.warn('Retain failed (non-blocking):', err));
}

export async function POST(req: NextRequest) {
  try {
    const { userMessage, history, profileContext, userId } = await req.json();

    if (!userMessage || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only pass the last 2 exchanges as context to keep tokens minimal
    const recentHistory = (history || []).slice(-4)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Mentor'}: ${m.content.slice(0, 200)}`)
      .join('\n');

    // Pass the profile context (up to 6000 chars) + recent history
    const context = (profileContext?.slice(0, 6000) || '') + 
      (recentHistory ? `\n\nRecent:\n${recentHistory}` : '');

    const llm = new HindsightReflect({ bankId: BANK_ID, userId, context });
    const chain = RunnableSequence.from([PromptTemplate.fromTemplate('{input}'), llm]);
    const modelText = await chain.invoke({ input: userMessage });

    // Retain non-blocking
    retainMemory(BANK_ID, `User: ${userMessage}\nMentor: ${modelText}`, userId);

    return NextResponse.json({ text: modelText });
  } catch (error: any) {
    console.error('Mentor API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
