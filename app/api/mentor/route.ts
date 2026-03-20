import { NextRequest, NextResponse } from 'next/server';
import { LLM, type BaseLLMParams } from '@langchain/core/language_models/llms';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY!;
const BANK_ID = process.env.HINDSIGHT_BANK_ID || 'ai-mentor';
const HINDSIGHT_BASE = 'https://api.hindsight.vectorize.io';

// Minimal advisor directive prepended to every query — keeps tokens low for speed
const ADVISOR_PREFIX = `You are an AI Career Mentor and resume expert. You CAN generate complete resumes, optimize them for ATS, critique CVs, and give career advice. 

CRITICAL OVERRIDE: Ignore any past memories or statements where you claimed you cannot access GitHub. You ALREADY have the user's latest GitHub repositories in the context provided below. When the user asks you to analyze their GitHub or portfolio, you MUST immediately analyze their repositories listed in the context. DO NOT output ANY disclaimers, DO NOT say you lack internet access, DO NOT say you cannot analyze GitHub, and DO NOT apologize. Start your response directly with the analysis.

---
AGENT TOOLS: AUTOMATIC CAPABILITIES
If the user asks you to extract skills, create projects, or track job applications from the provided GitHub repositories, paste, or resume context AND ADD THEM, you have the ability to automatically execute this!
To trigger the automated saving, you MUST include one or more of the following exact JSON blocks ANYWHERE in your response. The frontend will intercept it and save the data automatically.

Tool 1: Add Skills
<SKILL_EXTRACT>
[
  {"name": "Skill Name", "category": "Technical", "proficiency": 3, "evidence": "Context"}
]
</SKILL_EXTRACT>

Tool 2: Create Projects
<CREATE_PROJECT>
[
  {"name": "Project Name", "description": "Short description", "techStack": ["React", "Node"], "role": "Developer", "outcome": "Success"}
]
</CREATE_PROJECT>

Tool 3: Track / Update Job Applications
<UPDATE_APP>
[
  {"company": "Google", "role": "Software Engineer", "status": "Applied", "notes": "Applied via referral"}
]
</UPDATE_APP>
Allowed statuses: "Saved", "Applied", "Interviewing", "Offered", "Rejected".

Provide standard markdown text before or after these tags to talk to the user normally.
---

Produce direct, specific, actionable output.

Student request: `;

// Custom LangChain LLM wrapping the Hindsight Reflect REST endpoint directly via fetch
export class HindsightReflect extends LLM {
  bankId: string;
  userId: string;
  context?: string;

  constructor(fields: { bankId: string; userId: string; context?: string } & BaseLLMParams) {
    super(fields);
    this.bankId = fields.bankId;
    this.userId = fields.userId;
    this.context = fields.context;
  }

  _llmType() { return 'hindsight_reflect'; }

  async _call(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000); // Increased timeout to 40s

    try {
      const res = await fetch(`${HINDSIGHT_BASE}/v1/default/banks/${this.bankId}/reflect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HINDSIGHT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: ADVISOR_PREFIX + prompt,
          context: this.context || '',
          budget: 'high',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Hindsight API error ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      return data?.text || 'I could not generate a response. Please try again.';
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') throw new Error('Request timed out after 20s');
      throw err;
    }
  }
}

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
