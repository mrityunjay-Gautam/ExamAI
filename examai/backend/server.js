const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const uploadRoutes = require("./routes/uploadRoutes")
const subjectRoutes = require("./routes/subjectRoutes")
const predictorRoutes = require("./routes/predictorRoutes")
const aiRoutes = require("./routes/aiRoutes")
const queryRoutes = require("./routes/queryRoutes")
const practiceRoutes = require("./routes/practiceRoutes")

const app = express()

app.use(cors())
app.use(express.json({ limit: "10mb" }))

app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/admin", express.static(path.join(__dirname, "../admin")))
app.use(express.static(path.join(__dirname, "../frontend")))

app.use("/api", uploadRoutes)
app.use("/api", subjectRoutes)
app.use("/api", predictorRoutes)
app.use("/api", aiRoutes)
app.use("/api", queryRoutes)
app.use("/api", practiceRoutes)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("SERVER STARTED ON PORT " + PORT)
})