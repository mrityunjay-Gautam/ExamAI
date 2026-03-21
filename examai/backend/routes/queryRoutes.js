const express = require("express")
const router = express.Router()
const nodemailer = require("nodemailer")

router.post("/send-query", async (req, res) => {
  try {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "gautamjay101@gmail.com",
      replyTo: email,
      subject: `New ExamAI Query from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;">
          <h2>New Query from ExamAI Website</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        </div>
      `
    })

    return res.json({
      success: true,
      message: "Query sent successfully"
    })
  } catch (error) {
    console.log("QUERY EMAIL ERROR:", error)

    return res.status(500).json({
      success: false,
      message: "Failed to send query",
      error: error.message
    })
  }
})

module.exports = router