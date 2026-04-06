import { generateContent, parseGeminiJson } from "@/lib/gemini"
import { topicsPrompt } from "@/lib/prompts"
import type { TopicCard } from "@/lib/types"

type GeminiTopicCard = Omit<TopicCard, "id">

export async function POST(request: Request) {
  try {
    const { category } = await request.json() as { category: string }

    if (!category) {
      return Response.json({ error: "category is required" }, { status: 400 })
    }

    const raw = await generateContent(topicsPrompt(category))
    const cards = parseGeminiJson<GeminiTopicCard[]>(raw, "[")

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
