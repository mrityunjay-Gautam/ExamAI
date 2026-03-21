const express = require("express")
const router = express.Router()

const {
  generatePracticePaper,
  submitPracticePaper,
  getPracticeScores,
  deletePracticeScore,
  solvePracticeDoubt
} = require("../controllers/practiceController")

router.post("/practice/generate-paper", generatePracticePaper)
router.post("/practice/submit-paper", submitPracticePaper)
router.get("/practice/scores", getPracticeScores)
router.delete("/practice/scores/:id", deletePracticeScore)
router.post("/practice/solve-doubt", solvePracticeDoubt)

module.exports = router