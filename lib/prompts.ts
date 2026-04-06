export function topicsPrompt(category: string): string {
  return `You are a developer education assistant. Generate 6 important best practice topics for the "${category}" category of software development.

Return ONLY a raw JSON array — no markdown fences, no explanation, no other text.

The array must have exactly 6 objects with these exact fields:
- title: string (concise best practice name, 3-8 words)
- summary: string (one sentence, max 15 words, describing what it is)
- difficulty: must be exactly one of: "beginner", "intermediate", "advanced"
- impact: must be exactly one of: "high", "medium", "low"
- tags: string[] (2-4 short lowercase tags relevant to the topic)
- category: "${category}"

Do not include an "id" field.

Return only the JSON array. No markdown. No explanation. No trailing text.`
}

export function cardDetailPrompt(
  title: string,
  category: string,
  difficulty: string,
  tags: string[]
): string {
  return `You are a developer education assistant. Provide a detailed explanation of this software development best practice:

Title: "${title}"
Category: ${category}
Difficulty: ${difficulty}
Tags: ${tags.join(", ")}

Return ONLY a raw JSON object — no markdown fences, no explanation, no other text.

The object must have these exact fields:
- what: string (2-3 sentences explaining what this practice is and why it matters)
- when: string (2-3 sentences explaining when to apply it and in what situations)
- code: string (10-20 lines of real, runnable code demonstrating this practice, with inline comments explaining key lines. Use the most relevant language for this topic.)
- language: string (the programming language of the code example, lowercase, e.g. "typescript", "javascript", "python", "go", "bash")
- mistakes: string[] (exactly 3 strings, each a common mistake developers make, written as short sentences starting with a verb)

Return only the JSON object. No markdown. No explanation. No trailing text.`
}
