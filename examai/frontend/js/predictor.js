const API_BASE = "http://localhost:5000/api"

async function predictQuestions(count) {
  const questions = document.getElementById("questionsInput").value.trim()
  const status = document.getElementById("predictorStatus")
  const resultsContainer = document.getElementById("resultsContainer")

  if (!questions) {
    status.style.color = "red"
    status.innerText = "Please paste your questions first."
    resultsContainer.innerHTML = ""
    return
  }

  status.style.color = "#111827"
  status.innerText = "Analyzing questions with AI..."
  resultsContainer.innerHTML = ""

  try {
    const response = await fetch(`${API_BASE}/predict-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        questions,
        count
      })
    })

    const data = await response.json()

    if (!data.success) {
      status.style.color = "red"
      status.innerText = data.message || "Prediction failed."
      return
    }

    const topQuestions = data.result?.topQuestions || []

    if (!topQuestions.length) {
      status.style.color = "red"
      status.innerText = "No results received from AI."
      return
    }

    status.style.color = "green"
    status.innerText = `Top ${topQuestions.length} important questions generated successfully.`

    resultsContainer.innerHTML = topQuestions.map((item) => {
      const keyPointsHtml = (item.keyPoints || []).map(point => `<li>${point}</li>`).join("")

      return `
        <div class="result-card">
          <span class="rank-badge">Rank ${item.rank}</span>
          <h3>${item.question}</h3>
          <p><strong>Why important:</strong> ${item.reason}</p>
          <p><strong>Explanation:</strong> ${item.shortExplanation}</p>
          <p><strong>Key Points:</strong></p>
          <ul>
            ${keyPointsHtml}
          </ul>
        </div>
      `
    }).join("")
  } catch (error) {
    console.log("PREDICTION ERROR:", error)
    status.style.color = "red"
    status.innerText = "Prediction failed. Please check your backend and Groq API key."
  }
}