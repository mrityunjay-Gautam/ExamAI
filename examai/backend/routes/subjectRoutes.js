const express = require("express")
const router = express.Router()
const db = require("../config/firebase")

// ADD SUBJECT
router.post("/subjects", async (req, res) => {
  try {
    const {
      type,
      university,
      branch,
      semester,
      board,
      className,
      stream,
      subject
    } = req.body

    if (!type || !subject) {
      return res.status(400).json({
        success: false,
        message: "Type and subject are required"
      })
    }

    if (type === "university") {
      if (!university || !branch || !semester) {
        return res.status(400).json({
          success: false,
          message: "University, branch and semester are required"
        })
      }
    }

    if (type === "board") {
      if (!board || !className) {
        return res.status(400).json({
          success: false,
          message: "Board and class are required"
        })
      }
    }

    const docRef = await db.collection("subjects").add({
      type,
      university: university ? university.trim() : "",
      branch: branch ? branch.trim() : "",
      semester: semester ? semester.trim() : "",
      board: board ? board.trim() : "",
      className: className ? className.trim() : "",
      stream: stream ? stream.trim() : "",
      subject: subject.trim(),
      createdAt: new Date()
    })

    res.json({
      success: true,
      message: "Subject added successfully",
      id: docRef.id
    })
  } catch (error) {
    console.log("ADD SUBJECT ERROR:", error)
    res.status(500).json({
      success: false,
      message: "Failed to add subject",
      error: error.message
    })
  }
})

// GET ALL SUBJECTS
router.get("/subjects", async (req, res) => {
  try {
    const snapshot = await db.collection("subjects").orderBy("createdAt", "desc").get()

    const subjects = []

    snapshot.forEach((doc) => {
      subjects.push({
        id: doc.id,
        ...doc.data()
      })
    })

    res.json({
      success: true,
      subjects
    })
  } catch (error) {
    console.log("GET SUBJECTS ERROR:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: error.message
    })
  }
})

// DELETE SUBJECT
router.delete("/subjects/:id", async (req, res) => {
  try {
    await db.collection("subjects").doc(req.params.id).delete()

    res.json({
      success: true,
      message: "Subject deleted successfully"
    })
  } catch (error) {
    console.log("DELETE SUBJECT ERROR:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete subject",
      error: error.message
    })
  }
})

module.exports = router