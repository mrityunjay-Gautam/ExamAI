const Groq = require("groq-sdk")

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

async function solveDoubt(req, res) {
  try {
    const { question } = req.body

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      })
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert teacher explaining academic concepts clearly to students preparing for exams. Always give a simple explanation and key points students can write in exams."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.4
    })

    const answer =
      completion.choices?.[0]?.message?.content ||
      "No answer generated."

    res.json({
      success: true,
      answer
    })
  } catch (error) {
    console.log("AI DOUBT ERROR:", error)

    res.status(500).json({
      success: false,
      message: "AI failed to answer",
      error: error.message
    })
  }
}

module.exports = { solveDoubt }