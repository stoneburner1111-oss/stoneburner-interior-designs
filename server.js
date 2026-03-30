const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS site_store (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )
`).then(() => console.log('DB ready')).catch(console.error);

// GET a value by key
app.get('/api/data/:key', async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM site_store WHERE key = $1', [req.params.key]);
    if (result.rows.length === 0) return res.json({ value: null });
    res.json({ value: result.rows[0].value });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// SET a value by key
app.post('/api/data/:key', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO site_store (key, value, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [req.params.key, JSON.stringify(req.body.value)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET all keys with prefix
app.get('/api/keys/:prefix', async (req, res) => {
  try {
    const result = await pool.query("SELECT key, value FROM site_store WHERE key LIKE $1", [req.params.prefix + '%']);
    const data = {};
    result.rows.forEach(r => { data[r.key] = r.value; });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// DELETE a key
app.delete('/api/data/:key', async (req, res) => {
  try {
    await pool.query('DELETE FROM site_store WHERE key = $1', [req.params.key]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Serve index with server-rendered portfolio
app.get('*', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM site_store WHERE key = 'sid_albums'");
    let albums = null;
    if (result.rows.length > 0) {
      albums = result.rows[0].value;
    }
    if (!albums) {
      albums = [
        { name: 'Riverstone', location: 'Naples, FL', visible: true, photos: [{ url: 'https://st.hzcdn.com/fimgs/b3d18818026d795e_7325-w800-h600-b0-p0---.jpg' }] },
        { name: 'Royal Harbor', location: 'Naples, FL', visible: true, photos: [{ url: 'https://st.hzcdn.com/fimgs/99c138450fef1f03_7321-w800-h600-b0-p0---.jpg' }] },
        { name: 'Beach Condo Rentals', location: 'Fort Myers Beach', visible: true, photos: [{ url: 'https://st.hzcdn.com/fimgs/d3211ea70f9b0a50_6241-w800-h600-b0-p0---.jpg' }] },
        { name: 'Bayfront', location: 'Fort Myers', visible: true, photos: [{ url: 'https://st.hzcdn.com/simgs/28618b4e0f3668c0_14-9415/home-design.jpg' }] },
        { name: 'Shadowood Kitchen', location: 'Fort Myers', visible: true, photos: [{ url: 'https://st.hzcdn.com/fimgs/ca718d9e0b85b689_3419-w800-h600-b0-p0---.jpg' }] },
        { name: 'Estero Remodel', location: 'Estero, FL', visible: true, photos: [{ url: 'https://st.hzcdn.com/fimgs/8cd133df09a2e035_0312-w800-h600-b0-p0---.jpg' }] }
      ];
    }
    let cards = '';
    albums.forEach((album, i) => {
      if (!album.visible || !album.photos || album.photos.length === 0) return;
      const cover = album.photos[0].url;
      const count = album.photos.length;
      cards += '<div class="project-card reveal-scale visible" onclick="openGallery(' + i + ',0)"><div class="project-img" style="background-image:url(\'' + cover + '\')"></div><div class="project-overlay"></div><div class="project-info"><div class="project-location">' + album.location + '</div><div class="project-name">' + album.name + '</div><div class="project-view">' + count + ' Photo' + (count > 1 ? 's' : '') + ' — View Project →</div></div></div>';
    });
    let html = require('fs').readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    html = html.replace(/(<div class="portfolio-grid" id="portfolioGrid">)[\s\S]*?(<\/div>\s*<\/section>)/, '$1' + cards + '$2');
    res.send(html);
  } catch(err) {
    console.error(err);
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
