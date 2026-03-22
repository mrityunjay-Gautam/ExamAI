const API_BASE_URL = "https://examai-6mav.onrender.com/api"
const FILE_BASE_URL = "https://examai-6mav.onrender.com"

async function fetchAllPapers() {
  const response = await fetch(`${API_BASE_URL}/papers`)
  return await response.json()
}

async function fetchAllSubjects() {
  const response = await fetch(`${API_BASE_URL}/subjects`)
  return await response.json()
}
