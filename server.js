
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ========== DATABASE ==========
const DB_PATH = path.join(__dirname, 'db.json');
fs.ensureFileSync(DB_PATH);

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } 
  catch { return { users: [], sessions: [], projects: [], messages: [] }; }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ========== EMAIL SETUP ==========
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fahadniazi09@gmail.com',
    pass: 'yior bzzm lwhj oecr'
  }
});

// ========== UPLOAD ==========
const upload = multer({ dest: 'uploads/' });

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

// ========== RESEND + FORGOT PASSWORD ==========
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

// ========== AI GENERATE ==========
app.post('/api/generate', async (req, res) => {
  const { prompt, type } = req.body;
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) return res.status(401).json({ error: 'Not logged in' });

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCMnvtJPKjHsE8jIggS8vuuIPGJxVCHaV0`,
      {
        contents: [{
          parts: [{ text: `Generate complete HTML/CSS/JS code for a ${type}: ${prompt}. Include full page, styling, and interactivity. Only output the raw code.` }]
        }]
      }
    );
    let code = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '// AI response not available';
    code = code.replace(/```html/g, '').replace(/```/g, '').trim();
    res.json({ code });
  } catch (err) {
    console.error('AI error:', err.message);
    const templates = {
      website: `<!DOCTYPE html><html><head><title>${prompt}</title><style>body{font-family:system-ui;background:#0a0a0a;color:#e0e0e0;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;}h1{background:linear-gradient(45deg,#4cc9f0,#f72585);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}</style></head><body><h1>🕸️ ${prompt}</h1><p>Built with Black Web Studio</p></body></html>`,
      game: `<canvas id="game" style="display:block;margin:auto;border:2px solid #4cc9f0;"></canvas><script>const c=document.getElementById('game');c.width=400;c.height=300;const ctx=c.getContext('2d');let x=50,y=50,dx=2,dy=2;function draw(){ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#4cc9f0';ctx.fillRect(x,y,30,30);x+=dx;y+=dy;if(x>c.width-30||x<0)dx=-dx;if(y>c.height-30||y<0)dy=-dy;requestAnimationFrame(draw);}draw();</script>`,
      app: `export default function App(){return <h1>${prompt}</h1>}`
    };
    res.json({ code: templates[type] || templates.website });
  }
});

// ========== TOPUP ==========
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

app.use('/published', express.static(path.join(__dirname, 'public', 'published')));

// ========== CONTACT FORM ==========
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========== SERVER START ==========
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {  console.log(`✅ Black Web Studio running on port ${process.env.PORT || 3000}`);});
  console.log(`✅ Black Web Studio running on http://localhost:${PORT}`);
});
