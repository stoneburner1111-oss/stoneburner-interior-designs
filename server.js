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

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
