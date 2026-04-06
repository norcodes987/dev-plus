import { generateContent, parseGeminiJson } from "@/lib/gemini"
import { topicsPrompt } from "@/lib/prompts"
import type { TopicCard } from "@/lib/types"

type GeminiTopicCard = Omit<TopicCard, "id">

export async function POST(request: Request) {
  try {
    let body: { category?: string }
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: "Request body must be valid JSON" }, { status: 400 })
    }
    const { category } = body

    if (!category) {
      return Response.json({ error: "category is required" }, { status: 400 })
    }

    const raw = await generateContent(topicsPrompt(category))
    const cards = parseGeminiJson<GeminiTopicCard[]>(raw, "[")

    if (!Array.isArray(cards)) {
      return Response.json({ error: "Gemini returned unexpected shape (not an array)" }, { status: 500 })
    }

    const withIds: TopicCard[] = cards.map((card) => ({
      ...card,
      id: crypto.randomUUID(),
    }))

    return Response.json(withIds)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
