import { codeToHtml } from 'shiki';
import { generateContent, parseGeminiJson } from '@/lib/gemini';
import { cardDetailPrompt } from '@/lib/prompts';
import type { CardDetail } from '@/lib/types';

type RawCardDetail = Omit<CardDetail, 'code'> & { code: string };

async function highlightCode(code: string, language: string): Promise<string> {
  try {
    return await codeToHtml(code, { lang: language, theme: 'github-dark' });
  } catch {
    // fallback to plaintext if language is not recognised by Shiki
    return await codeToHtml(code, { lang: 'text', theme: 'github-dark' });
  }
}

export async function POST(request: Request) {
  try {
    let body: { title?: string; category?: string; difficulty?: string; tags?: string[] }
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: 'Request body must be valid JSON' }, { status: 400 })
    }
    const { title, category, difficulty, tags } = body

    if (!title || !category) {
      return Response.json(
        { error: 'title and category are required' },
        { status: 400 },
      );
    }

    const raw = await generateContent(
      cardDetailPrompt(title, category, difficulty ?? '', tags ?? []),
    );
    const detail = parseGeminiJson<RawCardDetail>(raw, '{');

    if (typeof detail !== 'object' || Array.isArray(detail) || detail === null) {
      return Response.json({ error: 'Gemini returned unexpected shape (not an object)' }, { status: 500 })
    }

    const highlightedCode = await highlightCode(
      detail.code,
      detail.language || 'text',
    );

    const response: CardDetail = {
      ...detail,
      code: highlightedCode,
    };

    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
