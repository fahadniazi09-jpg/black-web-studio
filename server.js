const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = path.join(__dirname, 'db.json');
fs.ensureFileSync(DB_PATH);

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } 
  catch { return { users: [], sessions: [], projects: [], agents: [] }; }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'fahadniazi09@gmail.com', pass: 'yior bzzm lwhj oecr' }
});

// ========== AUTH ROUTES ==========
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  db.users.push({ id: Date.now().toString(), email, password, verified: false, code });
  writeDB(db);
  try {
    await transporter.sendMail({
      from: 'fahadniazi09@gmail.com',
      to: email,
      subject: 'Black Web Studio — Verification Code',
      html: `<h1>Welcome to Black Web Studio! 🕸️</h1><p>Your code: <b>${code}</b></p>`
    });
    res.json({ message: '✅ Code sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Email failed' });
  }
});

app.post('/api/verify', (req, res) => {
  const { email, code } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email && u.code === code);
  if (!user) return res.status(400).json({ error: 'Invalid code' });
  user.verified = true;
  user.code = null;
  writeDB(db);
  res.json({ message: '✅ Verified!' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  if (email === 'fahadniazi09@gmail.com' && password === 'Fahad5848?.') {
    db.sessions.push({ id: Date.now().toString(), email, role: 'admin' });
    writeDB(db);
    return res.json({ message: '✅ Admin login!', user: { email } });
  }
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  if (!user.verified) return res.status(400).json({ error: 'Verify email first' });
  db.sessions.push({ id: Date.now().toString(), email });
  writeDB(db);
  res.json({ message: '✅ Login successful!', user: { email } });
});

app.post('/api/logout', (req, res) => {
  const db = readDB();
  db.sessions = [];
  writeDB(db);
  res.json({ message: 'Logged out' });
});

app.get('/api/session', (req, res) => {
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: { email: session.email } });
});

app.post('/api/resend-verification', async (req, res) => {
  const { email } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Email not found' });
  if (user.verified) return res.status(400).json({ error: 'Already verified' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.code = code;
  writeDB(db);
  try {
    await transporter.sendMail({
      from: 'fahadniazi09@gmail.com',
      to: email,
      subject: 'Black Web Studio — New Verification Code',
      html: `<h1>Black Web Studio 🕸️</h1><p>Your new code: <b>${code}</b></p>`
    });
    res.json({ message: '✅ New code sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Email failed' });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Email not found' });
  const newPassword = Math.random().toString(36).slice(-8);
  user.password = newPassword;
  writeDB(db);
  try {
    await transporter.sendMail({
      from: 'fahadniazi09@gmail.com',
      to: email,
      subject: 'Black Web Studio — New Password',
      html: `<h1>Black Web Studio 🕸️</h1><p>Your new password: <b>${newPassword}</b></p>`
    });
    res.json({ message: '✅ New password sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Email failed' });
  }
});

// ========== AI AGENT (No API — Direct Templates) ==========
app.post('/api/agent', async (req, res) => {
  const { prompt, type } = req.body;
  console.log('Agent called with prompt:', prompt);
  
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) {
    console.log('No session found');
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Professional templates based on prompt keywords
  const getTemplate = (prompt) => {
    const p = prompt.toLowerCase();
    
    // Portfolio website
    if (p.includes('portfolio') || p.includes('photographer') || p.includes('creative')) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio — Black Web Studio</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; background: #0a0a0a; color: #e0e0e0; }
    nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links { display: flex; gap: 20px; list-style: none; }
    .nav-links a { color: #e0e0e0; text-decoration: none; }
    .nav-links a:hover { color: #4cc9f0; }
    .hero { text-align: center; padding: 80px 20px; }
    .hero h1 { font-size: 3rem; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 1.2rem; opacity: 0.8; max-width: 600px; margin: 20px auto; }
    .btn { padding: 12px 30px; border: none; border-radius: 50px; background: linear-gradient(45deg, #4cc9f0, #f72585); color: #0a0a0a; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .btn:hover { transform: scale(1.05); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; padding: 40px; max-width: 1200px; margin: 0 auto; }
    .card { background: rgba(255,255,255,0.03); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
    .card:hover { transform: translateY(-10px); border-color: #4cc9f0; }
    .card h3 { color: #4cc9f0; }
    footer { text-align: center; padding: 40px; opacity: 0.6; border-top: 1px solid rgba(255,255,255,0.05); }
    @media (max-width: 768px) { nav { flex-direction: column; gap: 10px; } .hero h1 { font-size: 2rem; } }
  </style>
</head>
<body>
  <nav><div class="logo">🕸️ Portfolio</div><ul class="nav-links"><li><a href="#">Home</a></li><li><a href="#">Work</a></li><li><a href="#">About</a></li><li><a href="#">Contact</a></li></ul></nav>
  <section class="hero">
    <h1>🕸️ Creative Portfolio</h1>
    <p>${prompt}</p>
    <button class="btn" onclick="alert('Welcome!')">View My Work</button>
  </section>
  <section class="grid">
    <div class="card"><h3>📸 Photography</h3><p>Capturing moments, telling stories.</p></div>
    <div class="card"><h3>🎨 Design</h3><p>Creative, minimal, impactful.</p></div>
    <div class="card"><h3>💻 Web</h3><p>Modern, responsive, fast.</p></div>
  </section>
  <footer>&copy; 2025 Black Web Studio</footer>
</body>
</html>`;
    }
    
    // E-commerce website
    if (p.includes('shop') || p.includes('store') || p.includes('ecommerce') || p.includes('product')) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Store — Black Web Studio</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; background: #0a0a0a; color: #e0e0e0; }
    nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero { text-align: center; padding: 60px 20px; }
    .hero h1 { font-size: 3rem; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; padding: 40px; max-width: 1200px; margin: 0 auto; }
    .product { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
    .product:hover { border-color: #4cc9f0; }
    .product .price { color: #4cc9f0; font-size: 1.5rem; }
    .btn { padding: 10px 24px; border: none; border-radius: 50px; background: linear-gradient(45deg, #4cc9f0, #f72585); color: #0a0a0a; font-weight: 700; cursor: pointer; }
    footer { text-align: center; padding: 40px; opacity: 0.6; border-top: 1px solid rgba(255,255,255,0.05); }
    @media (max-width: 768px) { nav { flex-direction: column; } .hero h1 { font-size: 2rem; } }
  </style>
</head>
<body>
  <nav><div class="logo">🛒 Black Store</div></nav>
  <section class="hero"><h1>🕸️ Premium Products</h1><p>${prompt}</p></section>
  <section class="grid">
    <div class="product"><h3>Product 1</h3><p>Description</p><div class="price">$29</div><button class="btn">Add to Cart</button></div>
    <div class="product"><h3>Product 2</h3><p>Description</p><div class="price">$49</div><button class="btn">Add to Cart</button></div>
    <div class="product"><h3>Product 3</h3><p>Description</p><div class="price">$99</div><button class="btn">Add to Cart</button></div>
  </section>
  <footer>&copy; 2025 Black Web Studio</footer>
</body>
</html>`;
    }
    
    // Blog website
    if (p.includes('blog') || p.includes('article') || p.includes('post') || p.includes('news')) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — Black Web Studio</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; background: #0a0a0a; color: #e0e0e0; }
    nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero { text-align: center; padding: 60px 20px; }
    .hero h1 { font-size: 3rem; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; padding: 40px; max-width: 1200px; margin: 0 auto; }
    .post { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
    .post:hover { border-color: #4cc9f0; }
    .post .tag { color: #4cc9f0; font-size: 0.8rem; }
    footer { text-align: center; padding: 40px; opacity: 0.6; border-top: 1px solid rgba(255,255,255,0.05); }
    @media (max-width: 768px) { nav { flex-direction: column; } .hero h1 { font-size: 2rem; } }
  </style>
</head>
<body>
  <nav><div class="logo">📝 Black Blog</div></nav>
  <section class="hero"><h1>🕸️ Latest Posts</h1><p>${prompt}</p></section>
  <section class="grid">
    <div class="post"><span class="tag">AI</span><h3>Post Title 1</h3><p>Short description...</p></div>
    <div class="post"><span class="tag">Tech</span><h3>Post Title 2</h3><p>Short description...</p></div>
    <div class="post"><span class="tag">Design</span><h3>Post Title 3</h3><p>Short description...</p></div>
  </section>
  <footer>&copy; 2025 Black Web Studio</footer>
</body>
</html>`;
    }
    
    // Restaurant website
    if (p.includes('restaurant') || p.includes('food') || p.includes('cafe') || p.includes('menu')) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restaurant — Black Web Studio</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; background: #0a0a0a; color: #e0e0e0; }
    nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero { text-align: center; padding: 80px 20px; }
    .hero h1 { font-size: 3rem; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; padding: 40px; max-width: 1200px; margin: 0 auto; }
    .item { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
    .item:hover { border-color: #4cc9f0; }
    .item .price { color: #4cc9f0; }
    footer { text-align: center; padding: 40px; opacity: 0.6; border-top: 1px solid rgba(255,255,255,0.05); }
    @media (max-width: 768px) { nav { flex-direction: column; } .hero h1 { font-size: 2rem; } }
  </style>
</head>
<body>
  <nav><div class="logo">🍽️ Black Restaurant</div></nav>
  <section class="hero"><h1>🕸️ Delicious Food</h1><p>${prompt}</p></section>
  <section class="grid">
    <div class="item"><h3>🍕 Pizza</h3><p>Classic Italian</p><div class="price">$15</div></div>
    <div class="item"><h3>🍔 Burger</h3><p>Premium beef</p><div class="price">$12</div></div>
    <div class="item"><h3>🍣 Sushi</h3><p>Fresh and authentic</p><div class="price">$22</div></div>
  </section>
  <footer>&copy; 2025 Black Web Studio</footer>
</body>
</html>`;
    }
    
    // Default modern website
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${prompt} — Black Web Studio</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; background: #0a0a0a; color: #e0e0e0; }
    nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .nav-links { display: flex; gap: 20px; list-style: none; }
    .nav-links a { color: #e0e0e0; text-decoration: none; }
    .nav-links a:hover { color: #4cc9f0; }
    .hero { text-align: center; padding: 80px 20px; }
    .hero h1 { font-size: 3rem; background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 1.2rem; opacity: 0.8; max-width: 600px; margin: 20px auto; }
    .btn { padding: 12px 30px; border: none; border-radius: 50px; background: linear-gradient(45deg, #4cc9f0, #f72585); color: #0a0a0a; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .btn:hover { transform: scale(1.05); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; padding: 40px; max-width: 1200px; margin: 0 auto; }
    .card { background: rgba(255,255,255,0.03); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; }
    .card:hover { transform: translateY(-10px); border-color: #4cc9f0; }
    .card h3 { color: #4cc9f0; }
    footer { text-align: center; padding: 40px; opacity: 0.6; border-top: 1px solid rgba(255,255,255,0.05); }
    @media (max-width: 768px) { nav { flex-direction: column; gap: 10px; } .hero h1 { font-size: 2rem; } }
  </style>
</head>
<body>
  <nav><div class="logo">🕸️ ${prompt}</div><ul class="nav-links"><li><a href="#">Home</a></li><li><a href="#">Services</a></li><li><a href="#">About</a></li><li><a href="#">Contact</a></li></ul></nav>
  <section class="hero">
    <h1>🕸️ ${prompt}</h1>
    <p>Built by Black Web Studio AI Agent — Professional, responsive, and modern.</p>
    <button class="btn" onclick="alert('Welcome to ${prompt}!')">Get Started</button>
  </section>
  <section class="grid">
    <div class="card"><h3>🚀 Feature 1</h3><p>Description of feature 1.</p></div>
    <div class="card"><h3>💡 Feature 2</h3><p>Description of feature 2.</p></div>
    <div class="card"><h3>⚡ Feature 3</h3><p>Description of feature 3.</p></div>
  </section>
  <footer>&copy; 2025 Black Web Studio</footer>
</body>
</html>`;
  };

  const code = getTemplate(prompt);
  console.log('Template generated, length:', code.length);

  const agentResponse = {
    research: { summary: 'AI Agent built your website using professional templates' },
    requirements: 'Full website with HTML/CSS/JS, responsive design',
    code: code,
    preview: code
  };

  res.json(agentResponse);
});

// ========== PROJECTS ==========
app.get('/api/projects', (req, res) => {
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) return res.status(401).json({ error: 'Not logged in' });
  res.json({ projects: db.projects || [] });
});

app.post('/api/projects', (req, res) => {
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) return res.status(401).json({ error: 'Not logged in' });
  const { name, type, code } = req.body;
  db.projects.push({
    id: Date.now().toString(),
    userId: session.email,
    name: name || 'Untitled',
    type: type || 'website',
    code: code || '<h1>Black Web Studio 🕸️</h1>',
    created_at: new Date().toISOString()
  });
  writeDB(db);
  res.json({ project: db.projects[db.projects.length - 1] });
});

app.put('/api/projects/:id', (req, res) => {
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) return res.status(401).json({ error: 'Not logged in' });
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  if (req.body.code) project.code = req.body.code;
  writeDB(db);
  res.json({ project });
});

app.post('/api/publish/:id', (req, res) => {
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) return res.status(401).json({ error: 'Not logged in' });
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });
  const publishDir = path.join(__dirname, 'public', 'published', req.params.id);
  fs.ensureDirSync(publishDir);
  fs.writeFileSync(path.join(publishDir, 'index.html'), project.code);
  res.json({ url: `http://localhost:${PORT}/published/${req.params.id}/index.html` });
});

app.post('/api/topup', (req, res) => {
  const { amount } = req.body;
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) return res.status(401).json({ error: 'Not logged in' });
  db.settings = db.settings || {};
  db.settings[session.email] = db.settings[session.email] || {};
  db.settings[session.email].credit = (db.settings[session.email].credit || 0) + amount;
  writeDB(db);
  res.json({ success: true, newBalance: db.settings[session.email].credit });
});

app.get('/api/balance', (req, res) => {
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) return res.status(401).json({ error: 'Not logged in' });
  res.json({ balance: db.settings?.[session.email]?.credit || 0 });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await transporter.sendMail({
      from: 'fahadniazi09@gmail.com',
      to: 'fahadniazi09@gmail.com',
      subject: `New Contact Message from ${name}`,
      html: `<h2>New Message</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Message:</b> ${message}</p>`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Email failed' });
  }
});

app.use('/published', express.static(path.join(__dirname, 'public', 'published')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Black Web Studio running on port ${PORT}`);
});
