const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ========== DATABASE ==========
const DB_PATH = path.join(__dirname, 'db.json');
fs.ensureFileSync(DB_PATH);

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } 
  catch { return { users: [], sessions: [], projects: [], agents: [] }; }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ========== EMAIL SETUP ==========
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'fahadniazi09@gmail.com',
    pass: process.env.EMAIL_PASS || 'yior bzzm lwhj oecr'
  }
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

// ========== AI AGENT (PROFESSIONAL RESEARCH + CODE) ==========
app.post('/api/agent', async (req, res) => {
  const { prompt, type } = req.body;
  const db = readDB();
  const session = db.sessions[db.sessions.length - 1];
  if (!session) return res.status(401).json({ error: 'Not logged in' });

  const agentResponse = {
    research: [],
    requirements: [],
    code: '',
    preview: ''
  };

  try {
    // Step 1: Research the prompt
    const researchPrompt = `Research and analyze the following project requirement in detail:
"${prompt}"
Provide:
1. Project type and category
2. Key features needed
3. Recommended tech stack
4. Design requirements (colors, layout, responsiveness)
5. APIs needed (if any, list free options)
6. Target audience
7. Estimated complexity

Format the response as a structured JSON object.`;

    const researchResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCMnvtJPKjHsE8jIggS8vuuIPGJxVCHaV0`,
      {
        contents: [{ parts: [{ text: researchPrompt }] }]
      }
    );
    
    let researchText = researchResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    try {
      const researchJson = JSON.parse(researchText.replace(/```json/g, '').replace(/```/g, ''));
      agentResponse.research = researchJson;
    } catch {
      agentResponse.research = { summary: researchText };
    }

    // Step 2: Generate requirements checklist
    const requirementsPrompt = `Based on the project: "${prompt}", list all the requirements needed to build it. Include:
1. Frontend requirements (HTML/CSS/JS)
2. Backend requirements (if any)
3. Database requirements (if any)
4. API requirements (list free APIs)
5. Authentication requirements
6. Hosting requirements
7. Special features needed

Format as a bullet list.`;

    const reqResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCMnvtJPKjHsE8jIggS8vuuIPGJxVCHaV0`,
      {
        contents: [{ parts: [{ text: requirementsPrompt }] }]
      }
    );
    
    agentResponse.requirements = reqResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Requirements not available';

    // Step 3: Generate the code
    const codePrompt = `Generate complete, production-ready HTML/CSS/JS code for the following project:
"${prompt}"

Requirements: ${agentResponse.requirements}

Include:
- Full HTML structure
- Professional CSS styling (dark theme recommended)
- Interactive JavaScript functionality
- Responsive design (mobile + desktop)
- No external dependencies (except Font Awesome for icons)
- Use placeholder images from picsum.photos

Only output the raw HTML code. Do not include markdown or explanations.`;

    const codeResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCMnvtJPKjHsE8jIggS8vuuIPGJxVCHaV0`,
      {
        contents: [{ parts: [{ text: codePrompt }] }]
      }
    );
    
    let code = codeResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '// AI response not available';
    code = code.replace(/```html/g, '').replace(/```/g, '').trim();
    agentResponse.code = code;
    agentResponse.preview = code;

    // Save to database
    db.agents = db.agents || [];
    db.agents.push({
      id: Date.now().toString(),
      userId: session.email,
      prompt: prompt,
      type: type || 'website',
      research: agentResponse.research,
      requirements: agentResponse.requirements,
      code: code,
      created_at: new Date().toISOString()
    });
    writeDB(db);

    res.json(agentResponse);

  } catch (err) {
    console.error('Agent error:', err.message);
    // Fallback template
    const fallbackCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${prompt}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui; background: #0a0a0a; color: #e0e0e0; min-height: 100vh; display: flex; justify-content: center; align-items: center; text-align: center; padding: 20px; }
    h1 { background: linear-gradient(45deg, #4cc9f0, #f72585); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2.5rem; }
    p { color: #888; margin: 20px 0; }
    .btn { padding: 12px 30px; border: none; border-radius: 50px; background: linear-gradient(45deg, #4cc9f0, #f72585); color: #0a0a0a; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <div>
    <h1>🕸️ ${prompt}</h1>
    <p>Built by Black Web Studio AI Agent</p>
    <button class="btn" onclick="alert('Welcome!')">Get Started</button>
  </div>
</body>
</html>`;
    
    agentResponse.code = fallbackCode;
    agentResponse.preview = fallbackCode;
    agentResponse.research = { summary: 'Research failed. Using fallback template.' };
    agentResponse.requirements = 'Requirements unavailable. Using fallback template.';
    res.json(agentResponse);
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
