const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const db = require("../config/firebase")

const uploadDir = path.join(__dirname, "../uploads")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname
    cb(null, uniqueName)
  }
})

const upload = multer({ storage: storage })

function getSafeTimestamp(item) {
  if (item.createdAt && item.createdAt._seconds) {
    return item.createdAt._seconds
  }
  return 0
}

function sortByCreatedAtDesc(items) {
  return items.sort((a, b) => getSafeTimestamp(b) - getSafeTimestamp(a))
}

function buildSectionKey(data) {
  const type = String(data.type || "").trim().toLowerCase()

  if (type === "university") {
    return [
      "university",
      String(data.university || "").trim().toLowerCase(),
      String(data.branch || "").trim().toLowerCase(),
      String(data.semester || "").trim().toLowerCase(),
      String(data.subject || "").trim().toLowerCase()
    ].join("|")
  }

  if (type === "board") {
    return [
      "board",
      String(data.board || "").trim().toLowerCase(),
      String(data.className || "").trim().toLowerCase(),
      String(data.stream || "").trim().toLowerCase(),
      String(data.subject || "").trim().toLowerCase()
    ].join("|")
  }

  return ""
}

// UPLOAD PAPER
router.post("/upload-paper", upload.single("paper"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      })
    }

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

    const normalizedType = String(type).trim().toLowerCase()

    if (normalizedType === "university") {
      if (!university || !branch || !semester) {
        return res.status(400).json({
          success: false,
          message: "University, branch and semester are required"
        })
      }
    }

    if (normalizedType === "board") {
      if (!board || !className) {
        return res.status(400).json({
          success: false,
          message: "Board and class are required"
        })
      }
    }

    const paperData = {
      type: normalizedType,
      university: university ? university.trim() : "",
      branch: branch ? branch.trim() : "",
      semester: semester ? semester.trim() : "",
      board: board ? board.trim() : "",
      className: className ? className.trim() : "",
      stream: stream ? stream.trim() : "",
      subject: subject ? subject.trim() : "",
      image: "/uploads/" + req.file.filename,
      originalFileName: req.file.originalname,
      sectionKey: "",
      createdAt: new Date()
    }

    paperData.sectionKey = buildSectionKey(paperData)

    // Prevent duplicate entry if same file name is uploaded again in same section
    const duplicateSnapshot = await db
      .collection("papers")
      .where("sectionKey", "==", paperData.sectionKey)
      .where("originalFileName", "==", paperData.originalFileName)
      .get()

    if (!duplicateSnapshot.empty) {
      const existingDoc = duplicateSnapshot.docs[0]
      const existingData = existingDoc.data()

      if (existingData.image) {
        const oldFileName = path.basename(existingData.image)
        const oldFilePath = path.join(uploadDir, oldFileName)

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      await db.collection("papers").doc(existingDoc.id).update({
        ...paperData,
        updatedAt: new Date()
      })

      return res.json({
        success: true,
        message: "Paper updated successfully in the same section",
        id: existingDoc.id,
        path: paperData.image
      })
    }

    const docRef = await db.collection("papers").add(paperData)

    res.json({
      success: true,
      message: "Paper uploaded successfully",
      id: docRef.id,
      path: paperData.image
    })
  } catch (error) {
    console.log("UPLOAD ERROR:", error)
    res.status(500).json({
      success: false,
      message: "Error uploading paper",
      error: error.message
    })
  }
})

// GET ALL PAPERS
router.get("/papers", async (req, res) => {
  try {
    const snapshot = await db.collection("papers").get()

    const papers = []

    snapshot.forEach((doc) => {
      papers.push({
        id: doc.id,
        ...doc.data()
      })
    })

    res.json({
      success: true,
      papers: sortByCreatedAtDesc(papers)
    })
  } catch (error) {
    console.log("FETCH PAPERS ERROR:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching papers",
      error: error.message
    })
  }
})

// GET UNIVERSITY PAPERS
router.get("/papers/university", async (req, res) => {
  try {
    const snapshot = await db.collection("papers").get()

    const papers = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      const type = String(data.type || "").toLowerCase()

      const isUniversityPaper =
        type === "university" ||
        (!!data.university || !!data.branch || !!data.semester)

      if (isUniversityPaper) {
        papers.push({
          id: doc.id,
          ...data
        })
      }
    })

    res.json({
      success: true,
      papers: sortByCreatedAtDesc(papers)
    })
  } catch (error) {
    console.log("FETCH UNIVERSITY PAPERS ERROR:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching university papers",
      error: error.message
    })
  }
})

// GET BOARD PAPERS
router.get("/papers/board", async (req, res) => {
  try {
    const snapshot = await db.collection("papers").get()

    const papers = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      const type = String(data.type || "").toLowerCase()

      const isBoardPaper =
        type === "board" ||
        (!!data.board || !!data.className || !!data.stream)

      if (isBoardPaper) {
        papers.push({
          id: doc.id,
          ...data
        })
      }
    })

    res.json({
      success: true,
      papers: sortByCreatedAtDesc(papers)
    })
  } catch (error) {
    console.log("FETCH BOARD PAPERS ERROR:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching board papers",
      error: error.message
    })
  }
})

// DELETE PAPER
router.delete("/papers/:id", async (req, res) => {
  try {
    const paperId = req.params.id
    const docRef = db.collection("papers").doc(paperId)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      })
    }

    const paperData = docSnap.data()

    if (paperData.image) {
      const fileName = path.basename(paperData.image)
      const filePath = path.join(uploadDir, fileName)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await docRef.delete()

    res.json({
      success: true,
      message: "Paper deleted successfully"
    })
  } catch (error) {
    console.log("DELETE PAPER ERROR:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting paper",
      error: error.message
    })
  }
})

module.exports = router