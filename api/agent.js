export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type } = req.body;
  console.log('Agent called with prompt:', prompt);

  // ========== TEMPLATES (No API) ==========
  const getTemplate = (prompt) => {
    const p = prompt.toLowerCase();
    
    // Portfolio
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
    
    // E-commerce
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
    
    // Blog
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
    
    // Restaurant
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
    
    // Default
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
    <div class="card"><h3>🚀 Feature 1</h3><p>Description</p></div>
    <div class="card"><h3>💡 Feature 2</h3><p>Description</p></div>
    <div class="card"><h3>⚡ Feature 3</h3><p>Description</p></div>
  </section>
  <footer>&copy; 2025 Black Web Studio</footer>
</body>
</html>`;
  };

  const code = getTemplate(prompt);
  console.log('Template generated, length:', code.length);

  res.status(200).json({
    research: { summary: 'AI Agent built your website using professional templates' },
    requirements: 'Full website with HTML/CSS/JS, responsive design',
    code: code,
    preview: code
  });
}
