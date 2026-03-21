const admin = require("firebase-admin")
const fs = require("fs")
const path = require("path")

let serviceAccount

const renderSecretPath = "/etc/secrets/serviceAccountKey.json"
const localPath = path.join(__dirname, "serviceAccountKey.json")

if (fs.existsSync(renderSecretPath)) {
  serviceAccount = require(renderSecretPath)
} else {
  serviceAccount = require(localPath)
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function testConnection() {
  try {
    const ref = db.collection("connection_test").doc("test")
    await ref.set({ status: "connected", time: new Date() })
    console.log("FIREBASE CONNECTED SUCCESSFULLY")
  } catch (err) {
    console.log("FIREBASE CONNECTION ERROR:", err.message)
  }
}

testConnection()

module.exports = db