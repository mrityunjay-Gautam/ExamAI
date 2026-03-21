const express = require("express")
const router = express.Router()
const { predictQuestions } = require("../controllers/predictorController")

router.post("/predict-questions", predictQuestions)

module.exports = router