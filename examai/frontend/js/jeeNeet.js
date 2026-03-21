const API_BASE = `${window.location.origin}/api`

let currentPaper = null
let userAnswers = {}
let scoreTrendChart = null
let scorePieChart = null

document.addEventListener("DOMContentLoaded", () => {
  initTabs()
  bindPracticeActions()
  bindDoubtActions()
  loadScoreAnalysis()
})

function initTabs() {
  const tabs = document.querySelectorAll(".practice-tab")
  const panels = document.querySelectorAll(".practice-panel")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"))
      panels.forEach((panel) => panel.classList.remove("active"))

      tab.classList.add("active")
      const panelId = tab.dataset.tab
      const targetPanel = document.getElementById(panelId)

      if (targetPanel) {
        targetPanel.classList.add("active")
      }

      if (panelId === "scorePanel") {
        loadScoreAnalysis()
      }
    })
  })
}

function bindPracticeActions() {
  const generateBtn = document.getElementById("generatePaperBtn")
  const clearBtn = document.getElementById("clearPaperBtn")

  if (generateBtn) {
    generateBtn.addEventListener("click", generatePaper)
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearPracticeUI)
  }
}

function bindDoubtActions() {
  const askBtn = document.getElementById("askDoubtBtn")
  const clearBtn = document.getElementById("clearDoubtBtn")

  if (askBtn) {
    askBtn.addEventListener("click", askDoubt)
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.getElementById("doubtInput").value = ""
      document.getElementById("doubtStatus").innerText = ""
      document.getElementById("doubtChat").innerHTML = ""
    })
  }
}

function setStatus(id, text, color = "") {
  const el = document.getElementById(id)
  if (!el) return
  el.innerText = text
  el.style.color = color || ""
}

function clearPracticeUI() {
  currentPaper = null
  userAnswers = {}

  const paperArea = document.getElementById("paperArea")
  const resultArea = document.getElementById("resultArea")
  const topicsInput = document.getElementById("topicsInput")

  if (paperArea) paperArea.innerHTML = ""
  if (resultArea) resultArea.innerHTML = ""
  if (topicsInput) topicsInput.value = ""

  setStatus("paperStatus", "")
}

async function generatePaper() {
  const examType = document.getElementById("examType").value
  const countMode = document.getElementById("countMode").value
  const difficulty = document.getElementById("difficultyMode").value
  const topics = document.getElementById("topicsInput").value.trim()

  setStatus("paperStatus", "Generating exam-level practice paper...")

  try {
    const response = await fetch(`${API_BASE}/practice/generate-paper`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        examType,
        countMode,
        difficulty,
        topics
      })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to generate paper")
    }

    currentPaper = data.paper
    userAnswers = {}

    renderPaper(data.paper)
    document.getElementById("resultArea").innerHTML = ""
    setStatus("paperStatus", "Paper generated successfully.", "#059669")

    window.scrollTo({
      top: document.getElementById("paperArea").offsetTop - 80,
      behavior: "smooth"
    })
  } catch (error) {
    console.error("GENERATE PAPER ERROR:", error)
    setStatus("paperStatus", error.message || "Failed to generate paper.", "#dc2626")
  }
}

function renderPaper(paper) {
  const paperArea = document.getElementById("paperArea")
  if (!paperArea) return

  paperArea.innerHTML = ""

  const wrapper = document.createElement("div")
  wrapper.className = "practice-card"

  const topicText = paper.topics
    ? `<div class="meta-chip">Topics: ${escapeHtml(paper.topics)}</div>`
    : ""

  wrapper.innerHTML = `
    <h2>${escapeHtml(paper.title || "Practice Paper")}</h2>
    <div class="paper-meta">
      <div class="meta-chip">Exam: ${escapeHtml(String(paper.examType || "").toUpperCase())}</div>
      <div class="meta-chip">Questions: ${paper.questions.length}</div>
      <div class="meta-chip">Difficulty: ${escapeHtml(String(paper.difficulty || "moderate").toUpperCase())}</div>
      <div class="meta-chip">Marking: +${paper.markingScheme.correct} / -${paper.markingScheme.incorrect}</div>
      ${topicText}
    </div>
    <div id="questionList" class="question-list"></div>
    <div class="submit-box">
      <button class="card-btn" id="submitPaperBtn" type="button">Submit Paper</button>
    </div>
  `

  paperArea.appendChild(wrapper)

  const questionList = document.getElementById("questionList")

  paper.questions.forEach((question, index) => {
    const card = document.createElement("div")
    card.className = "question-card"

    const optionsHtml = ["A", "B", "C", "D"]
      .map((key) => {
        const value = question.options?.[key] || ""
        return `
          <label class="option-item" data-question-id="${question.id}" data-option="${key}">
            <input type="radio" name="${question.id}" value="${key}">
            <div class="option-content">
              <div class="option-prefix">${key}</div>
              <div class="option-text">${escapeHtml(value)}</div>
            </div>
          </label>
        `
      })
      .join("")

    card.innerHTML = `
      <h4>Q${index + 1}. ${escapeHtml(question.question)}</h4>
      <div class="question-meta">
        <span class="small-badge">${escapeHtml(question.subject || "General")}</span>
        <span class="small-badge">${escapeHtml(question.topic || "General")}</span>
        <span class="small-badge">${escapeHtml(question.questionType || "MCQ")}</span>
        <span class="small-badge">${escapeHtml(String(question.difficulty || paper.difficulty || "moderate").toUpperCase())}</span>
      </div>
      <div class="options-list">${optionsHtml}</div>
    `

    questionList.appendChild(card)
  })

  bindQuestionSelection()
  document.getElementById("submitPaperBtn").addEventListener("click", submitPaper)
}

function bindQuestionSelection() {
  const optionLabels = document.querySelectorAll(".option-item")

  optionLabels.forEach((label) => {
    label.addEventListener("click", () => {
      const questionId = label.dataset.questionId
      const option = label.dataset.option

      userAnswers[questionId] = option

      const related = document.querySelectorAll(`.option-item[data-question-id="${questionId}"]`)
      related.forEach((item) => {
        item.classList.remove("selected")
        const radio = item.querySelector('input[type="radio"]')
        if (radio) radio.checked = false
      })

      label.classList.add("selected")
      const input = label.querySelector('input[type="radio"]')
      if (input) input.checked = true
    })
  })
}

async function submitPaper() {
  if (!currentPaper || !Array.isArray(currentPaper.questions) || currentPaper.questions.length === 0) {
    setStatus("paperStatus", "No paper available to submit.", "#dc2626")
    return
  }

  setStatus("paperStatus", "Submitting paper...")

  try {
    const response = await fetch(`${API_BASE}/practice/submit-paper`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        examType: currentPaper.examType,
        title: currentPaper.title,
        difficulty: currentPaper.difficulty,
        questions: currentPaper.questions,
        userAnswers
      })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to submit practice paper")
    }

    renderResult(data.scoreCard, data.review || [])
    loadScoreAnalysis()

    setStatus("paperStatus", "Paper submitted successfully.", "#059669")

    window.scrollTo({
      top: document.getElementById("resultArea").offsetTop - 80,
      behavior: "smooth"
    })
  } catch (error) {
    console.error("SUBMIT PAPER ERROR:", error)
    setStatus("paperStatus", error.message || "Failed to submit paper.", "#dc2626")
  }
}

function renderResult(scoreCard, review) {
  const resultArea = document.getElementById("resultArea")
  if (!resultArea) return

  const subjectHtml = (scoreCard.subjectBreakdown || [])
    .map((item) => {
      return `
        <div class="subject-pill">
          <strong>${escapeHtml(item.subject)}</strong>
          <span>Correct: ${item.correct} | Incorrect: ${item.incorrect} | Unattempted: ${item.unattempted} | Score: ${item.score}</span>
        </div>
      `
    })
    .join("")

  const reviewHtml = review
    .map((item, index) => {
      const selected = item.selectedAnswer || "Not Attempted"
      let answerClass = "answer-neutral"

      if (selected === item.correctAnswer) {
        answerClass = "answer-good"
      } else if (selected !== "Not Attempted") {
        answerClass = "answer-bad"
      }

      const options = item.options || {}
      const optionHtml = ["A", "B", "C", "D"]
        .map((key) => {
          const prefix =
            key === item.correctAnswer
              ? "✅ "
              : key === selected && selected !== item.correctAnswer && selected !== "Not Attempted"
              ? "❌ "
              : ""

          return `<div class="review-option">${prefix}<strong>${key}.</strong> ${escapeHtml(options[key] || "")}</div>`
        })
        .join("")

      return `
        <div class="review-card">
          <h4>Q${index + 1}. ${escapeHtml(item.question)}</h4>
          <div class="question-meta">
            <span class="small-badge">${escapeHtml(item.subject || "General")}</span>
            <span class="small-badge">${escapeHtml(item.topic || "General")}</span>
            <span class="small-badge">${escapeHtml(item.questionType || "MCQ")}</span>
            <span class="small-badge">${escapeHtml(String(item.difficulty || "moderate").toUpperCase())}</span>
          </div>
          <div class="${answerClass}">Your Answer: ${escapeHtml(selected)}</div>
          <div class="answer-good" style="margin-top:6px;">Correct Answer: ${escapeHtml(item.correctAnswer)}</div>
          <div class="review-options">${optionHtml}</div>
          <div class="review-extra">
            <div class="review-note correct"><strong>Why Correct:</strong> ${escapeHtml(item.explanation || "No explanation available.")}</div>
            <div class="review-note trap"><strong>Trap Explanation:</strong> ${escapeHtml(item.trapExplanation || "Students may get confused by closely worded options.")}</div>
          </div>
        </div>
      `
    })
    .join("")

  resultArea.innerHTML = `
    <div class="practice-card">
      <h2>Result Summary</h2>
      <div class="result-summary">
        <div class="result-tile">
          <h3>${scoreCard.score}</h3>
          <p>Score</p>
        </div>
        <div class="result-tile">
          <h3>${scoreCard.maxScore}</h3>
          <p>Max Score</p>
        </div>
        <div class="result-tile">
          <h3>${scoreCard.percentage}%</h3>
          <p>Percentage</p>
        </div>
        <div class="result-tile">
          <h3>${escapeHtml(String(scoreCard.difficulty || "moderate").toUpperCase())}</h3>
          <p>Difficulty</p>
        </div>
        <div class="result-tile">
          <h3>${scoreCard.attempted}</h3>
          <p>Attempted</p>
        </div>
        <div class="result-tile">
          <h3>${scoreCard.correct}</h3>
          <p>Correct</p>
        </div>
        <div class="result-tile">
          <h3>${scoreCard.incorrect}</h3>
          <p>Incorrect</p>
        </div>
        <div class="result-tile">
          <h3>${scoreCard.unattempted}</h3>
          <p>Unattempted</p>
        </div>
      </div>

      <div style="margin-top:24px;">
        <h2 style="font-size:22px;">Subject Breakdown</h2>
        <div class="subject-breakdown">
          ${subjectHtml || '<div class="subject-pill"><span>No subject breakdown available.</span></div>'}
        </div>
      </div>

      <div style="margin-top:24px;">
        <h2 style="font-size:22px;">Answer Review</h2>
        <div class="review-list">
          ${reviewHtml}
        </div>
      </div>
    </div>
  `
}

async function loadScoreAnalysis() {
  const scorecardsList = document.getElementById("scorecardsList")
  if (!scorecardsList) return

  scorecardsList.innerHTML = `<div class="scorecard-item">Loading score analysis...</div>`

  try {
    const response = await fetch(`${API_BASE}/practice/scores`)
    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load score analysis")
    }

    const scores = Array.isArray(data.scores) ? data.scores : []

    renderScorecards(scores)
    renderCharts(scores)
  } catch (error) {
    console.error("LOAD SCORE ANALYSIS ERROR:", error)
    scorecardsList.innerHTML = `<div class="scorecard-item">Failed to load score analysis.</div>`
    destroyCharts()
  }
}

function renderScorecards(scores) {
  const scorecardsList = document.getElementById("scorecardsList")
  if (!scorecardsList) return

  if (scores.length === 0) {
    scorecardsList.innerHTML = `<div class="scorecard-item">No saved scorecards yet. Submit a paper to see analysis here.</div>`
    return
  }

  scorecardsList.innerHTML = scores
    .map((score) => {
      const createdAt = formatDate(score.createdAt)
      const subjectHtml = (score.subjectBreakdown || [])
        .map((subject) => {
          return `
            <div class="subject-pill">
              <strong>${escapeHtml(subject.subject)}</strong>
              <span>Correct: ${subject.correct} | Incorrect: ${subject.incorrect} | Unattempted: ${subject.unattempted} | Score: ${subject.score}</span>
            </div>
          `
        })
        .join("")

      return `
        <div class="scorecard-item">
          <div class="scorecard-top">
            <div>
              <h3>${escapeHtml(score.title || "Practice Attempt")}</h3>
              <div class="scorecard-meta">
                ${escapeHtml(String(score.examType || "").toUpperCase())} •
                ${createdAt} •
                ${escapeHtml(String(score.difficulty || "moderate").toUpperCase())}
              </div>
            </div>
            <div>
              <strong>Score:</strong> ${score.score}/${score.maxScore} <br>
              <strong>Percentage:</strong> ${score.percentage}%
            </div>
          </div>

          <div class="scorecard-meta" style="margin-bottom:12px;">
            Attempted: ${score.attempted} |
            Correct: ${score.correct} |
            Incorrect: ${score.incorrect} |
            Unattempted: ${score.unattempted}
          </div>

          <div class="subject-breakdown">
            ${subjectHtml}
          </div>

          <div style="margin-top:14px; display:flex; justify-content:flex-end;">
            <button
              type="button"
              onclick="deleteScorecard('${score.id}')"
              style="border:none; background:#dc2626; color:#fff; padding:10px 16px; border-radius:10px; cursor:pointer; font-weight:600;"
            >
              Delete
            </button>
          </div>
        </div>
      `
    })
    .join("")
}

async function deleteScorecard(id) {
  if (!id) return

  const confirmDelete = window.confirm("Are you sure you want to delete this saved scorecard?")
  if (!confirmDelete) return

  try {
    const response = await fetch(`${API_BASE}/practice/scores/${id}`, {
      method: "DELETE"
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to delete scorecard")
    }

    loadScoreAnalysis()
  } catch (error) {
    console.error("DELETE SCORECARD ERROR:", error)
    alert(error.message || "Failed to delete scorecard")
  }
}

function renderCharts(scores) {
  destroyCharts()

  const trendCanvas = document.getElementById("scoreTrendChart")
  const pieCanvas = document.getElementById("scorePieChart")

  if (!trendCanvas || !pieCanvas) return

  const sorted = [...scores].reverse()
  const trendLabels = sorted.map((item, index) => `Attempt ${index + 1}`)
  const trendValues = sorted.map((item) => Number(item.percentage || 0))

  scoreTrendChart = new Chart(trendCanvas, {
    type: "line",
    data: {
      labels: trendLabels.length ? trendLabels : ["No Attempts"],
      datasets: [
        {
          label: "Percentage",
          data: trendValues.length ? trendValues : [0],
          borderWidth: 2,
          tension: 0.35,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 100
        }
      }
    }
  })

  const latest = scores[0] || null
  const pieData = latest
    ? [latest.correct || 0, latest.incorrect || 0, latest.unattempted || 0]
    : [1, 0, 0]

  scorePieChart = new Chart(pieCanvas, {
    type: "doughnut",
    data: {
      labels: ["Correct", "Incorrect", "Unattempted"],
      datasets: [
        {
          data: pieData,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  })
}

function destroyCharts() {
  if (scoreTrendChart) {
    scoreTrendChart.destroy()
    scoreTrendChart = null
  }

  if (scorePieChart) {
    scorePieChart.destroy()
    scorePieChart = null
  }
}

async function askDoubt() {
  const question = document.getElementById("doubtInput").value.trim()
  const examType = document.getElementById("doubtExamType").value
  const doubtChat = document.getElementById("doubtChat")

  if (!question) {
    setStatus("doubtStatus", "Please enter your doubt first.", "#dc2626")
    return
  }

  setStatus("doubtStatus", "Generating answer...")

  doubtChat.insertAdjacentHTML(
    "beforeend",
    `<div class="chat-bubble chat-user"><strong>You:</strong><br>${escapeHtml(question)}</div>`
  )

  try {
    const response = await fetch(`${API_BASE}/practice/solve-doubt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question,
        examType
      })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to solve doubt")
    }

    doubtChat.insertAdjacentHTML(
      "beforeend",
      `<div class="chat-bubble chat-ai"><strong>ExamAI:</strong><br>${escapeHtml(data.answer)}</div>`
    )

    document.getElementById("doubtInput").value = ""
    setStatus("doubtStatus", "Answer generated successfully.", "#059669")
    doubtChat.scrollTop = doubtChat.scrollHeight
  } catch (error) {
    console.error("ASK DOUBT ERROR:", error)
    doubtChat.insertAdjacentHTML(
      "beforeend",
      `<div class="chat-bubble chat-ai"><strong>ExamAI:</strong><br>Failed to solve doubt.</div>`
    )
    setStatus("doubtStatus", error.message || "Failed to solve doubt.", "#dc2626")
  }
}

function formatDate(value) {
  if (!value) return "Unknown Date"

  try {
    if (value._seconds) {
      return new Date(value._seconds * 1000).toLocaleString()
    }

    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString()
    }

    return "Unknown Date"
  } catch (error) {
    return "Unknown Date"
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}