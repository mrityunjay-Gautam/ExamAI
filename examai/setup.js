const fs = require("fs");

function makeDir(dir){
if(!fs.existsSync(dir)){
fs.mkdirSync(dir,{recursive:true});
}
}

function makeFile(file,content){
fs.writeFileSync(file,content);
}

/* ---------------------------
FOLDER STRUCTURE
---------------------------*/

makeDir("frontend/css");
makeDir("frontend/js");
makeDir("frontend/assets/logo");

makeDir("admin");

makeDir("backend/routes");
makeDir("backend/controllers");
makeDir("backend/config");

/* ---------------------------
FRONTEND HTML FILES
---------------------------*/

makeFile("frontend/index.html",`

<!DOCTYPE html>

<html lang="en">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>ExamAI | AI Powered Exam Preparation</title>

<link rel="stylesheet" href="css/style.css">

</head>

<body>

<header class="navbar">

<h2 class="logo">ExamAI</h2>

<ul class="nav-links">

<li><a href="index.html">Home</a></li>
<li><a href="universities.html">Universities</a></li>
<li><a href="boards.html">Boards</a></li>
<li><a href="predictor.html">Predictor</a></li>
<li><a href="jee-neet.html">JEE / NEET</a></li>

</ul>

</header>

<section class="hero">

<h1>AI Powered Exam Preparation Platform</h1>

<p>Predict important questions using AI</p>

<a href="predictor.html" class="btn">Start Predicting</a>

</section>

<section class="features">

<div class="card">
<h3>Universities</h3>
<a href="universities.html">Explore</a>
</div>

<div class="card">
<h3>Boards</h3>
<a href="boards.html">Explore</a>
</div>

<div class="card">
<h3>Question Predictor</h3>
<a href="predictor.html">Predict</a>
</div>

<div class="card">
<h3>JEE / NEET Practice</h3>
<a href="jee-neet.html">Practice</a>
</div>

</section>

<footer>

<p>Website made by Jay (Mrityunjay Gautam)</p>

</footer>

<script src="js/main.js"></script>

</body>
</html>
`);

makeFile("frontend/universities.html","<h1>Universities Page</h1>");
makeFile("frontend/boards.html","<h1>Boards Page</h1>");
makeFile("frontend/predictor.html","<h1>AI Predictor Page</h1>");
makeFile("frontend/jee-neet.html","<h1>JEE / NEET Practice</h1>");

/* ---------------------------
CSS
---------------------------*/

makeFile("frontend/css/style.css",`

body{
margin:0;
font-family:Arial;
background:#f4f6f9;
}

.navbar{
display:flex;
justify-content:space-between;
align-items:center;
padding:20px;
background:#4f46e5;
color:white;
}

.nav-links{
display:flex;
gap:20px;
list-style:none;
}

.nav-links a{
color:white;
text-decoration:none;
}

.hero{
text-align:center;
padding:120px;
background:#6366f1;
color:white;
}

.btn{
background:white;
color:#6366f1;
padding:12px 20px;
border-radius:6px;
text-decoration:none;
}

.features{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
gap:20px;
padding:40px;
}

.card{
background:white;
padding:20px;
border-radius:10px;
box-shadow:0 3px 10px rgba(0,0,0,0.1);
text-align:center;
}

footer{
background:#111;
color:white;
text-align:center;
padding:20px;
}

`);

/* ---------------------------
JS
---------------------------*/

makeFile("frontend/js/main.js",`

console.log("ExamAI Frontend Loaded");

`);

/* ---------------------------
ADMIN PANEL
---------------------------*/

makeFile("admin/login.html","<h1>Admin Login</h1>");
makeFile("admin/dashboard.html","<h1>Admin Dashboard</h1>");
makeFile("admin/subjects.html","<h1>Manage Subjects</h1>");
makeFile("admin/upload-paper.html","<h1>Upload Question Paper</h1>");
makeFile("admin/manage-papers.html","<h1>Manage Papers</h1>");

/* ---------------------------
BACKEND
---------------------------*/

makeFile("backend/server.js",`

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
res.send("ExamAI Backend Running");
});

app.listen(5000,()=>{
console.log("Server running on port 5000");
});

`);

makeFile("backend/routes/predictorRoutes.js","module.exports = {};");
makeFile("backend/routes/studyRoutes.js","module.exports = {};");

makeFile("backend/controllers/predictorController.js","module.exports = {};");
makeFile("backend/controllers/studyController.js","module.exports = {};");

makeFile("backend/config/firebase.js","module.exports = {};");

/* ---------------------------
DONE
---------------------------*/

console.log("ExamAI project structure created successfully!");
