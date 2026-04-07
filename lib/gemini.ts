import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) throw new Error("Missing required env var: GEMINI_API_KEY")
const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

export async function generateContent(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt)
  return result.response.text()
}

/**
 * Parse JSON from a Gemini response, which sometimes wraps output in markdown fences.
 * bracketChar: '[' for arrays, '{' for objects
 */
export function parseGeminiJson<T>(raw: string, bracketChar: "[" | "{"): T {
  const closingChar = bracketChar === "[" ? "]" : "}"

  // Tier 1: direct parse
  try {
    return JSON.parse(raw) as T
  } catch {
    // continue
  }

  // Tier 2: strip markdown fences
  const stripped = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim()
  try {
    return JSON.parse(stripped) as T
  } catch {
    // continue
  }

  // Tier 3: regex extract first bracket to last bracket
  const start = raw.indexOf(bracketChar)
  const end = raw.lastIndexOf(closingChar)
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1)) as T
    } catch {
      // fall through
    }
  }

  throw new Error(
    `Failed to parse Gemini response as JSON. Raw response:\n${raw}`
  )
}
