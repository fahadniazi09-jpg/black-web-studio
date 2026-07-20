// ========== API BASE URL ==========
// Pxxl par deploy hai, seedha origin use karein
const API_BASE = window.location.origin; // https://black-web-studio.pxxl.run

// ========== STATE ==========
let currentProjectId = null;
let isPremium = false;
let creditBalance = 0;
let chatHistory = [];

// ========== AGENT CHAT ==========
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  
  addMessage('user', msg);
  input.value = '';
  setStatus('🔍 Generating...');
  
  try {
    const type = document.getElementById('projectType').value;
    const res = await fetch(`${API_BASE}/api/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: msg, type })
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Data received:', data);
    
    if (data.code) {
      document.getElementById('codeEditor').value = data.code;
      addMessage('agent', '✅ Code generated! Check the editor.');
      setStatus('✅ Ready');
      openPreview();
    } else {
      addMessage('agent', '❌ Error generating project. Please try again.');
      setStatus('❌ Error');
    }
  } catch (e) {
    console.error('Fetch error:', e);
    addMessage('agent', '❌ Network error. Please check your connection and try again.');
    setStatus('❌ Error');
  }
}

function generateCode() {
  const msg = prompt('Describe what you want to build:');
  if (!msg) return;
  document.getElementById('chatInput').value = msg;
  sendMessage();
}

// ========== PREVIEW ==========
function openPreview() {
  const code = document.getElementById('codeEditor').value;
  const win = window.open('', '_blank');
  win.document.write(code + `<div style="position:fixed;bottom:20px;right:20px;"><button onclick="window.close()" style="padding:8px 16px;background:#4cc9f0;color:#0a0a0a;border:none;border-radius:6px;cursor:pointer;">← Back</button></div>`);
  win.document.close();
}

// ========== PUBLISH ==========
async function publishProject() {
  if (!currentProjectId) { alert('Create a project first!'); return; }
  setStatus('⏳ Publishing...');
  try {
    await fetch(`${API_BASE}/api/projects/${currentProjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: document.getElementById('codeEditor').value })
    });
    const res = await fetch(`${API_BASE}/api/publish/${currentProjectId}`, { method: 'POST' });
    const data = await res.json();
    addMessage('agent', `✅ Published! URL: ${data.url}`);
    setStatus('✅ Published!');
  } catch (e) { setStatus('❌ Publish failed'); }
}

// ========== CHAT HELPERS ==========
function addMessage(type, text) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-message ${type}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  chatHistory.push({ role: type, content: text });
}

function clearChat() {
  document.getElementById('chatMessages').innerHTML = '';
  chatHistory = [];
  addMessage('system', '🧹 Chat cleared.');
}

function setStatus(text) {
  document.getElementById('statusBar').textContent = text;
}

// ========== FILE UPLOAD ==========
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    addMessage('system', `📎 Uploaded: ${file.name}`);
    document.getElementById('chatInput').value = `Make a website like: ${file.name}`;
  }
}

// ========== AUTH ==========
function showSignup() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}
function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('verifyForm').style.display = 'none';
  document.getElementById('forgotForm').style.display = 'none';
  document.getElementById('resendForm').style.display = 'none';
}
function showResend() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('resendForm').style.display = 'block';
}
function showForgot() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('forgotForm').style.display = 'block';
}
function closeAuth() { document.getElementById('authModal').classList.remove('active'); }

async function handleSignup() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const error = document.getElementById('signupError');
  if (!email || !password) { error.textContent = 'Fill all fields'; return; }
  try {
    const res = await fetch(`${API_BASE}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) { error.textContent = data.error; return; }
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('verifyForm').style.display = 'block';
    document.getElementById('verifyError').textContent = '✅ Code sent! Check email.';
  } catch (e) { error.textContent = 'Network error'; }
}

async function handleVerify() {
  const email = document.getElementById('signupEmail').value;
  const code = document.getElementById('verifyCode').value;
  const error = document.getElementById('verifyError');
  try {
    const res = await fetch(`${API_BASE}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (data.error) { error.textContent = data.error; return; }
    document.getElementById('verifyForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginEmail').value = email;
    error.textContent = '✅ Verified! Please login.';
  } catch (e) { error.textContent = 'Network error'; }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const error = document.getElementById('authError');
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) { error.textContent = data.error; return; }
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('mainApp').style.display = 'flex';
    document.getElementById('userBadge').textContent = email + ' 👑';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    loadProjects();
  } catch (e) { error.textContent = 'Network error'; }
}

async function handleForgot() {
  const email = document.getElementById('forgotEmail').value;
  const error = document.getElementById('forgotError');
  try {
    const res = await fetch(`${API_BASE}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.error) { error.textContent = data.error; return; }
    error.textContent = '✅ New password sent!';
  } catch (e) { error.textContent = 'Network error'; }
}

async function handleResend() {
  const email = document.getElementById('resendEmail').value;
  const error = document.getElementById('resendError');
  try {
    const res = await fetch(`${API_BASE}/api/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.error) { error.textContent = data.error; return; }
    error.textContent = '✅ New code sent!';
  } catch (e) { error.textContent = 'Network error'; }
}

async function handleLogout() {
  await fetch(`${API_BASE}/api/logout`, { method: 'POST' });
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('authModal').classList.add('active');
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('userBadge').textContent = 'Guest';
}

// ========== PAGE NAV ==========
function showMain() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelector('.main-layout').style.display = 'grid';
}
function showPage(pageId) {
  document.querySelector('.main-layout').style.display = 'none';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
}

// ========== PROJECTS ==========
async function loadProjects() {
  try {
    const res = await fetch(`${API_BASE}/api/projects`);
    const data = await res.json();
    const list = document.getElementById('projectsList');
    if (data.projects && data.projects.length > 0) {
      const p = data.projects[data.projects.length - 1];
      currentProjectId = p.id;
      list.innerHTML = data.projects.map(p => `
        <div class="project-card">
          <div class="info"><div class="name"><i class="fas fa-file-code"></i> ${p.name}</div>
          <div class="date">${new Date(p.created_at).toLocaleDateString()}</div></div>
          <button class="open-btn" onclick="alert('Open ${p.name}')"><i class="fas fa-external-link-alt"></i> Open</button>
        </div>
      `).join('');
    } else {
      list.innerHTML = '<p style="color:#888;">No projects yet. Generate one!</p>';
    }
  } catch (e) { console.error(e); }
}

// ========== SETTINGS ==========
function saveSetting(type) {
  if (type === 'username') alert('Username updated: ' + document.getElementById('settingsUsername').value);
  else if (type === 'email') alert('Email updated: ' + document.getElementById('settingsEmail').value);
  else if (type === 'language') alert('Language updated: ' + document.getElementById('settingsLanguage').value);
  else if (type === 'theme') alert('Theme updated: ' + document.getElementById('settingsTheme').value);
}

function processTopup(amount) {
  creditBalance += amount;
  document.getElementById('creditBalanceDisplay').textContent = `$${creditBalance}`;
  document.getElementById('settingsCredit').textContent = `$${creditBalance}`;
  alert(`$${amount} added! New balance: $${creditBalance}`);
}

// ========== SESSION CHECK ==========
fetch(`${API_BASE}/api/session`).then(res => res.json()).then(data => {
  if (data.loggedIn) {
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('mainApp').style.display = 'flex';
    document.getElementById('userBadge').textContent = data.user.email + ' 👑';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    loadProjects();
  }
}).catch(() => {});
