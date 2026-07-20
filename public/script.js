// ========== AUTH ==========
function showAuth() { document.getElementById('authModal').classList.add('active'); }
function closeAuth() { document.getElementById('authModal').classList.remove('active'); }

function showSignup() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}
function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('verifyForm').style.display = 'none';
}
function showVerify() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('verifyForm').style.display = 'block';
}
function showResend() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('resendForm').style.display = 'block';
}
function showForgot() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('forgotForm').style.display = 'block';
}

async function handleSignup() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const error = document.getElementById('signupError');
  if (!email || !password) { error.textContent = 'Fill all fields'; return; }
  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) { error.textContent = data.error; return; }
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('verifyForm').style.display = 'block';
    document.getElementById('verifyError').textContent = '✅ Code sent!';
  } catch (e) { error.textContent = 'Network error'; }
}

async function handleVerify() {
  const email = document.getElementById('signupEmail').value;
  const code = document.getElementById('verifyCode').value;
  const error = document.getElementById('verifyError');
  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (data.error) { error.textContent = data.error; return; }
    document.getElementById('verifyForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    error.textContent = '✅ Verified! Please login.';
  } catch (e) { error.textContent = 'Network error'; }
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const error = document.getElementById('authError');
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.error) { error.textContent = data.error; return; }
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('authBtn').innerHTML = `<i class="fas fa-user"></i> ${email}`;
    alert('✅ Login successful!');
  } catch (e) { error.textContent = 'Network error'; }
}

async function handleForgot() {
  const email = document.getElementById('forgotEmail').value;
  const error = document.getElementById('forgotError');
  try {
    const res = await fetch('/api/forgot-password', {
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
    const res = await fetch('/api/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.error) { error.textContent = data.error; return; }
    error.textContent = '✅ New code sent!';
  } catch (e) { error.textContent = 'Network error'; }
}

// ========== CONTACT ==========
document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const message = document.getElementById('contactMessage').value;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const data = await res.json();
    alert(data.success ? '✅ Message sent!' : '❌ Failed to send');
  } catch (e) { alert('Network error'); }
});

// ========== SESSION CHECK ==========
fetch('/api/session').then(res => res.json()).then(data => {
  if (data.loggedIn) {
    document.getElementById('authBtn').innerHTML = `<i class="fas fa-user"></i> ${data.user.email}`;
  }
});
