const Groq = require("groq-sdk")

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

function buildPrompt(questions, count) {
  return `
You are an expert exam question predictor and academic assistant for university exams.

Your task:

1. Analyze the student's pasted questions.
2. Select the top ${count} most important questions.
3. Rank them by exam importance.
4. Provide a short explanation.
5. Provide 4 to 6 key points that students can expand in the exam hall to write bigger answers.

Important rules:

Return ONLY valid JSON.

Each result must contain:

- rank
- question
- reason
- shortExplanation
- keyPoints

Example format:

{
  "topQuestions": [
    {
      "rank": 1,
      "question": "Explain Deadlock in Operating System",
      "reason": "Deadlock is frequently asked in OS exams",
      "shortExplanation": "Deadlock occurs when multiple processes are waiting for resources held by each other.",
      "keyPoints": [
        "Definition of Deadlock",
        "Four necessary conditions of deadlock",
        "Deadlock prevention techniques",
        "Deadlock avoidance methods",
        "Real world example of deadlock"
      ]
    }
  ]
}

Student questions:

${questions}
`
}

async function predictQuestions(req, res) {
  try {
    const { questions, count } = req.body

    if (!questions || !questions.trim()) {
      return res.status(400).json({
        success: false,
        message: "Questions are required"
      })
    }

    const totalCount = Number(count) || 10

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a precise academic exam predictor that always returns clean JSON."
        },
        {
          role: "user",
          content: buildPrompt(questions, totalCount)
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const raw = completion.choices[0]?.message?.content || "{}"
    const parsed = JSON.parse(raw)

    return res.json({
      success: true,
      result: parsed
    })
  } catch (error) {
    console.log("PREDICTOR ERROR:", error)

    return res.status(500).json({
      success: false,
      message: "Prediction failed",
      error: error.message
    })
  }
}

module.exports = { predictQuestions }