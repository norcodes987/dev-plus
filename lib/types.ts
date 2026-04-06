export type TopicCard = {
  id: string
  title: string
  summary: string
  difficulty: "beginner" | "intermediate" | "advanced"
  impact: "high" | "medium" | "low"
  tags: string[]
  category: string
}

export type CardDetail = {
  what: string
  when: string
  code: string      // pre-highlighted HTML from Shiki
  language: string
  mistakes: string[]
}
