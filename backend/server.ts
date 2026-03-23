import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { HindsightReflect, HindsightGeneric } from './hindsight';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const BANK_ID = process.env.HINDSIGHT_BANK_ID || 'ai-mentor';

// Non-blocking fire-and-forget retain
function retainMemory(bankId: string, content: string, userId: string) {
  const HINDSIGHT_API_KEY = process.env.HINDSIGHT_API_KEY!;
  const HINDSIGHT_BASE = 'https://api.hindsight.vectorize.io';
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

app.post('/api/mentor', async (req, res) => {
  try {
    const { userMessage, history, profileContext, userId } = req.body;

    if (!userMessage || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const recentHistory = (history || []).slice(-4)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Mentor'}: ${m.content.slice(0, 200)}`)
      .join('\n');

    const context = (profileContext?.slice(0, 6000) || '') + 
      (recentHistory ? `\n\nRecent:\n${recentHistory}` : '');

    const llm = new HindsightReflect({ bankId: BANK_ID, userId, context });
    const chain = RunnableSequence.from([PromptTemplate.fromTemplate('{input}'), llm]);
    const modelText = await chain.invoke({ input: userMessage });

    retainMemory(BANK_ID, `User: ${userMessage}\nMentor: ${modelText}`, userId);

    res.json({ text: modelText });
  } catch (error: any) {
    console.error('Mentor API error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, schema } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const fullPrompt = schema 
      ? `Generate a strictly formatted JSON response for the following prompt. Do not include markdown formatting like \`\`\`json, just pure JSON text.\n\nSCHEMA REQUIREMENTS:\n${JSON.stringify(schema)}\n\nPROMPT:\n${prompt}`
      : prompt;

    const llm = new HindsightGeneric({ bankId: BANK_ID });
    let modelText = await llm.invoke(fullPrompt);

    if (schema) {
      modelText = modelText.trim();
      if (modelText.startsWith('\`\`\`json')) modelText = modelText.replace(/^\`\`\`json/, '');
      if (modelText.startsWith('\`\`\`')) modelText = modelText.replace(/^\`\`\`/, '');
      if (modelText.endsWith('\`\`\`')) modelText = modelText.replace(/\`\`\`$/, '');
      modelText = modelText.trim();
    }

    res.json({ text: modelText });
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// File upload route
import multer from 'multer';
import { HindsightClient } from '@vectorize-io/hindsight-client';

const upload = multer({ storage: multer.memoryStorage() });

const hindsight = new HindsightClient({
  baseUrl: 'https://api.hindsight.vectorize.io',
  apiKey: process.env.HINDSIGHT_API_KEY!,
});

app.post('/api/mentor/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body?.userId;

    if (!file || !userId) {
      return res.status(400).json({ error: 'File and userId are required.' });
    }

    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    const fileObj = new File([blob], file.originalname, { type: file.mimetype });

    const response = await (hindsight as any).retainFiles(
      BANK_ID,
      [fileObj],
      {
        filesMetadata: [{ tags: [userId.toString()], context: `Uploaded file for user ${userId}` }],
      }
    );

    res.json({ success: true, response });
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error during upload' });
  }
});

// ── Adzuna Job Search Proxy ──────────────────────────────────────────────────
app.get('/api/jobs', async (req, res) => {
  try {
    const { role = 'software intern', location = 'london', page = '1', country = 'gb' } = req.query as any;
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      return res.status(503).json({ error: 'ADZUNA_NOT_CONFIGURED', message: 'Job listings API not configured on this server.' });
    }

    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: '20',
      what: role,
      where: location,
      content_type: 'application/json',
    });

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Adzuna error:', errText);
      return res.status(response.status).json({ error: 'Adzuna API error', message: errText });
    }

    const data = await response.json() as any;
    const results = (data.results || []).map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || '',
      description: job.description,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      created: job.created,
      redirect_url: job.redirect_url,
    }));

    res.json({ count: data.count, results });
  } catch (error: any) {
    console.error('Jobs API error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// ── GitHub Repos Proxy ──────────────────────────────────────────────────────
app.get('/api/github/repos/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    // Optionally use a token for higher rate limits
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30&type=public`, { headers });
    if (!reposRes.ok) {
      const err = await reposRes.json() as any;
      return res.status(reposRes.status).json({ error: err.message || 'GitHub API error' });
    }
    const repos = await reposRes.json() as any[];

    // Fetch languages for each repo (up to 10 to avoid rate limiting)
    const top = repos.slice(0, 10);
    const withLangs = await Promise.all(top.map(async (repo: any) => {
      try {
        const langRes = await fetch(repo.languages_url, { headers });
        const langs = langRes.ok ? Object.keys(await langRes.json()) : [];
        return {
          id: repo.id,
          name: repo.name,
          description: repo.description || '',
          url: repo.html_url,
          stars: repo.stargazers_count,
          language: repo.language,
          languages: langs,
          topics: repo.topics || [],
          updatedAt: repo.updated_at,
        };
      } catch {
        return { id: repo.id, name: repo.name, description: repo.description || '', url: repo.html_url, stars: repo.stargazers_count, language: repo.language, languages: repo.language ? [repo.language] : [], topics: repo.topics || [], updatedAt: repo.updated_at };
      }
    }));

    res.json({ repos: withLangs });
  } catch (error: any) {
    console.error('GitHub proxy error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
