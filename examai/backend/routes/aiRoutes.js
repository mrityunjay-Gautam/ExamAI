const express = require("express")
const router = express.Router()

const { solveDoubt } = require("../controllers/aiController")

router.post("/ai-doubt", solveDoubt)

module.exports = router