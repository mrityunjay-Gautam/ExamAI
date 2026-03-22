const API_BASE_URL = "https://examai-6mav.onrender.com/api"

const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/mrityunjay-gautam-693123253?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
  github: "https://github.com/mrityunjay-Gautam",
  instagram: "https://www.instagram.com/jay_gautam_98"
}

function getCurrentPage() {
  const path = window.location.pathname.split("/").pop()
  return path || "index.html"
}

function buildFooterMarkup() {
  return `
    <footer class="footer">
      <div class="footer-shell">
        <div class="footer-top">
          <div class="footer-brand">
            <h3>ExamAI</h3>
            <p>AI Powered Exam Preparation Platform for JEE, NEET, boards, and university students.</p>
            <div class="made-by">WebApp made by <strong>Jay (Mrityunjay Gautam)</strong></div>
          </div>

          <div class="footer-group">
            <h4>Quick Links</h4>
            <div class="footer-links">
              <a href="index.html">Home</a>
              <a href="universities.html">Universities</a>
              <a href="boards.html">Boards</a>
              <a href="predictor.html">Question Predictor</a>
              <a href="jee-neet.html">JEE / NEET Practice</a>
              <a href="doubt-solver.html">AI Doubt Solver</a>
            </div>
          </div>

          <div class="footer-group">
            <h4>Connect</h4>
            <div class="social-row">
              <a class="social-link" href="${SOCIAL_LINKS.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i class="fa-brands fa-linkedin-in"></i>
              </a>
              <a class="social-link" href="${SOCIAL_LINKS.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <i class="fa-brands fa-github"></i>
              </a>
              <a class="social-link" href="${SOCIAL_LINKS.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i class="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© 2026 ExamAI. All rights reserved.</span>
          <span>WebApp made by Jay (Mrityunjay Gautam).</span>
        </div>
      </div>
    </footer>
  `
}

function replaceFooterEverywhere() {
  const footer = document.querySelector("footer")
  if (!footer) return
  footer.outerHTML = buildFooterMarkup()
}

function createSidebar() {
  const currentPage = getCurrentPage()

  const overlay = document.createElement("div")
  overlay.className = "sidebar-overlay"
  overlay.id = "sidebarOverlay"

  const sidebar = document.createElement("aside")
  sidebar.className = "site-sidebar"
  sidebar.id = "siteSidebar"

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-brand">ExamAI</div>
      <button class="close-sidebar" id="closeSidebarBtn" aria-label="Close menu">&times;</button>
    </div>

    <div class="sidebar-body">
      <div class="sidebar-section">
        <h3>Quick Navigation</h3>
        <div class="sidebar-links">
          <a class="sidebar-link" href="index.html">Home <span>→</span></a>
          <a class="sidebar-link" href="universities.html">Universities <span>→</span></a>
          <a class="sidebar-link" href="boards.html">Boards <span>→</span></a>
          <a class="sidebar-link" href="predictor.html">Question Predictor <span>→</span></a>
          <a class="sidebar-link" href="jee-neet.html">JEE / NEET Practice <span>→</span></a>
          <a class="sidebar-link" href="doubt-solver.html">AI Doubt Solver <span>→</span></a>
        </div>
      </div>

      <div class="sidebar-section">
        <h3>Website Tools</h3>
        <div class="sidebar-links">
          <a class="sidebar-link" href="/admin/login.html">Admin Login <span>🔐</span></a>
          <button class="sidebar-link" id="openQueryBtn" style="cursor:pointer;border:none;text-align:left;">Send Query <span>✉️</span></button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3>Appearance</h3>
        <div class="theme-row">
          <div>
            <strong>Day / Night Mode</strong>
            <div class="query-note">Switch your reading theme</div>
          </div>
          <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme"></button>
        </div>
      </div>

      <div class="sidebar-section">
        <h3>Connect</h3>
        <div class="social-row">
          <a class="social-link" href="${SOCIAL_LINKS.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <i class="fa-brands fa-linkedin-in"></i>
          </a>
          <a class="social-link" href="${SOCIAL_LINKS.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <i class="fa-brands fa-github"></i>
          </a>
          <a class="social-link" href="${SOCIAL_LINKS.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i class="fa-brands fa-instagram"></i>
          </a>
        </div>
      </div>

      <div class="sidebar-section">
        <div class="footer-mini">
          WebApp made by Jay (Mrityunjay Gautam)
        </div>
      </div>
    </div>
  `

  document.body.appendChild(overlay)
  document.body.appendChild(sidebar)

  const menuToggle = document.getElementById("menuToggle")
  const closeSidebarBtn = document.getElementById("closeSidebarBtn")
  const openQueryBtn = document.getElementById("openQueryBtn")

  if (menuToggle) {
    menuToggle.addEventListener("click", openSidebar)
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener("click", closeSidebar)
  }

  overlay.addEventListener("click", closeSidebar)

  if (openQueryBtn) {
    openQueryBtn.addEventListener("click", () => {
      closeSidebar()
      openQueryModal()
    })
  }

  highlightActiveLinks(currentPage)
}

function createQueryModal() {
  const modal = document.createElement("div")
  modal.id = "queryModalWrapper"
  modal.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(15,23,42,0.55);
    display:none;
    align-items:center;
    justify-content:center;
    z-index:1400;
    padding:18px;
  `

  modal.innerHTML = `
    <div style="
      width:100%;
      max-width:560px;
      background:var(--bg-soft);
      color:var(--text);
      border-radius:22px;
      box-shadow:var(--shadow);
      border:1px solid var(--border);
      overflow:hidden;
    ">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 22px;border-bottom:1px solid var(--border);">
        <div>
          <h2 style="font-size:24px;">Send Your Query</h2>
          <p style="font-size:14px;color:var(--text-soft);margin-top:4px;">Your message will be sent directly to ExamAI support.</p>
        </div>
        <button id="closeQueryModalBtn" style="width:42px;height:42px;border:none;border-radius:12px;background:#eef2ff;color:#4f46e5;font-size:22px;cursor:pointer;">&times;</button>
      </div>

      <div style="padding:22px;">
        <div class="query-form">
          <input id="queryName" type="text" placeholder="Your Name">
          <input id="queryEmail" type="email" placeholder="Your Email">
          <textarea id="queryMessage" placeholder="Write your query here..."></textarea>
          <button class="card-btn query-btn" id="sendQueryBtn">Send Query</button>
          <div id="queryStatus" class="query-status"></div>
          <div class="query-note">Messages are sent to gautamjay101@gmail.com</div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  document.getElementById("closeQueryModalBtn").addEventListener("click", closeQueryModal)
  modal.addEventListener("click", (e) => {
    if (e.target.id === "queryModalWrapper") {
      closeQueryModal()
    }
  })
  document.getElementById("sendQueryBtn").addEventListener("click", sendQuery)
}

function openSidebar() {
  const overlay = document.getElementById("sidebarOverlay")
  const sidebar = document.getElementById("siteSidebar")
  if (overlay) overlay.classList.add("active")
  if (sidebar) sidebar.classList.add("active")
}

function closeSidebar() {
  const overlay = document.getElementById("sidebarOverlay")
  const sidebar = document.getElementById("siteSidebar")
  if (overlay) overlay.classList.remove("active")
  if (sidebar) sidebar.classList.remove("active")
}

function openQueryModal() {
  const modal = document.getElementById("queryModalWrapper")
  if (modal) modal.style.display = "flex"
}

function closeQueryModal() {
  const modal = document.getElementById("queryModalWrapper")
  if (modal) modal.style.display = "none"
}

async function sendQuery() {
  const name = document.getElementById("queryName").value.trim()
  const email = document.getElementById("queryEmail").value.trim()
  const message = document.getElementById("queryMessage").value.trim()
  const status = document.getElementById("queryStatus")

  if (!name || !email || !message) {
    status.style.color = "red"
    status.innerText = "Please fill all fields."
    return
  }

  status.style.color = "#111827"
  status.innerText = "Sending query..."

  try {
    const response = await fetch(`${API_BASE_URL}/send-query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        message
      })
    })

    const data = await response.json()

    if (data.success) {
      status.style.color = "green"
      status.innerText = data.message
      document.getElementById("queryName").value = ""
      document.getElementById("queryEmail").value = ""
      document.getElementById("queryMessage").value = ""
    } else {
      status.style.color = "red"
      status.innerText = data.message || "Failed to send query."
    }
  } catch (error) {
    console.log("QUERY SEND ERROR:", error)
    status.style.color = "red"
    status.innerText = "Failed to send query."
  }
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("examai-theme")
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode")
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode")
  const isDark = document.body.classList.contains("dark-mode")
  localStorage.setItem("examai-theme", isDark ? "dark" : "light")
}

function bindThemeToggle() {
  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme)
  }
}

function highlightActiveLinks(currentPage) {
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href")
    if (href === currentPage) {
      link.classList.add("active-link")
    }
  })
}

window.addEventListener("DOMContentLoaded", () => {
  applySavedTheme()
  replaceFooterEverywhere()
  createSidebar()
  createQueryModal()
  bindThemeToggle()
  highlightActiveLinks(getCurrentPage())
})
