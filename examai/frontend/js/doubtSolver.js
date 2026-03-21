const API_BASE = "http://localhost:5000/api"

async function askAI() {

const input = document.getElementById("questionInput")
const chatBox = document.getElementById("chatBox")

const question = input.value.trim()

if (!question) {
alert("Please enter your question")
return
}

chatBox.innerHTML += `
<div class="message user">
<strong>You:</strong><br>${question}
</div>
`

input.value = ""

const loading = document.createElement("div")
loading.className = "message ai"
loading.innerHTML = "AI is thinking..."
chatBox.appendChild(loading)

try {

const response = await fetch(`${API_BASE}/ai-doubt`, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({ question })
})

const data = await response.json()

loading.remove()

chatBox.innerHTML += `
<div class="message ai">
<strong>AI:</strong><br>${data.answer}
</div>
`

} catch (error) {

loading.remove()

chatBox.innerHTML += `
<div class="message ai">
AI failed to answer.
</div>
`

}

}