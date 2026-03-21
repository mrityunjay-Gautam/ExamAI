const API_BASE_URL = "http://localhost:5000/api"
const FILE_BASE_URL = "http://localhost:5000"

async function fetchAllPapers() {
  const response = await fetch(`${API_BASE_URL}/papers`)
  return await response.json()
}

async function fetchAllSubjects() {
  const response = await fetch(`${API_BASE_URL}/subjects`)
  return await response.json()
}