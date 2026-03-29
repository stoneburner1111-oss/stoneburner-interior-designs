f = open('index.html','r').read()

# Add a DB helper layer that syncs with both API and localStorage (fallback)
db_layer = """// ===== DATABASE LAYER =====
var DB = {
  async get(key) {
    try {
      var res = await fetch('/api/data/' + encodeURIComponent(key));
      var data = await res.json();
      if (data.value !== null) {
        localStorage.setItem(key, JSON.stringify(data.value));
        return data.value;
      }
    } catch(e) {}
    // Fallback to localStorage
    try { var s = localStorage.getItem(key); if (s) return JSON.parse(s); } catch(e) {}
    return null;
  },
  async set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
    try { await fetch('/api/data/' + encodeURIComponent(key), { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({value:value}) }); } catch(e) {}
  },
  async del(key) {
    try { localStorage.removeItem(key); } catch(e) {}
    try { await fetch('/api/data/' + encodeURIComponent(key), { method:'DELETE' }); } catch(e) {}
  }
};

"""

# Insert DB layer before the hero slider code
f = f.replace('// ===== HERO SLIDER =====', db_layer + '// ===== HERO SLIDER =====')

# Update getSiteAlbums to be async-aware with a sync fallback
f = f.replace(
    """function getSiteAlbums() {
  try {
    var saved = localStorage.getItem('sid_albums');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return defaultAlbums;
}
function saveSiteAlbums(albums) {
  try { localStorage.setItem('sid_albums', JSON.stringify(albums)); } catch(e) {}
}""",
    """function getSiteAlbums() {
  try {
    var saved = localStorage.getItem('sid_albums');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return defaultAlbums;
}
function saveSiteAlbums(albums) {
  try { localStorage.setItem('sid_albums', JSON.stringify(albums)); } catch(e) {}
  DB.set('sid_albums', albums);
}"""
)

# Update saveHeroState to also save to DB
f = f.replace(
    """function saveHeroState() {
  try {
    const heroSlides = [];
    document.querySelectorAll('.hero-slide').forEach(slide => {
      heroSlides.push({
        url: slide.style.backgroundImage.replace(/url\\(['"]?|['"]?\\)/g, ''),
        zoom: slide.dataset.zoom || 1.02
      });
    });
    localStorage.setItem('sid_heroSlides', JSON.stringify(heroSlides));
  } catch(e) {}
}""",
    """function saveHeroState() {
  try {
    const heroSlides = [];
    document.querySelectorAll('.hero-slide').forEach(slide => {
      heroSlides.push({
        url: slide.style.backgroundImage.replace(/url\\(['"]?|['"]?\\)/g, ''),
        zoom: slide.dataset.zoom || 1.02
      });
    });
    localStorage.setItem('sid_heroSlides', JSON.stringify(heroSlides));
    DB.set('sid_heroSlides', heroSlides);
  } catch(e) {}
}"""
)

# Update saveBAState to also save to DB
f = f.replace(
    """function saveBAState() {
  try {
    const before = document.getElementById('baBefore');
    const after = document.getElementById('baAfter');
    if (before && after) {
      localStorage.setItem('sid_baBefore', before.style.backgroundImage.replace(/url\\(['"]?|['"]?\\)/g, ''));
      localStorage.setItem('sid_baAfter', after.style.backgroundImage.replace(/url\\(['"]?|['"]?\\)/g, ''));
    }
  } catch(e) {}
}""",
    """function saveBAState() {
  try {
    const before = document.getElementById('baBefore');
    const after = document.getElementById('baAfter');
    if (before && after) {
      var bUrl = before.style.backgroundImage.replace(/url\\(['"]?|['"]?\\)/g, '');
      var aUrl = after.style.backgroundImage.replace(/url\\(['"]?|['"]?\\)/g, '');
      localStorage.setItem('sid_baBefore', bUrl);
      localStorage.setItem('sid_baAfter', aUrl);
      DB.set('sid_baBefore', bUrl);
      DB.set('sid_baAfter', aUrl);
    }
  } catch(e) {}
}"""
)

# Update saveProjects to also save to DB
f = f.replace(
    "function saveProjects() { try { localStorage.setItem('sid_projects', JSON.stringify(projects)); } catch(e) {} }",
    "function saveProjects() { try { localStorage.setItem('sid_projects', JSON.stringify(projects)); } catch(e) {} DB.set('sid_projects', projects); }"
)

# Update saveVisionBoard to also save to DB
f = f.replace(
    """try { localStorage.setItem('sid_proj_' + projIdx + '_vision', JSON.stringify(boards)); } catch(e) {}""",
    """try { localStorage.setItem('sid_proj_' + projIdx + '_vision', JSON.stringify(boards)); } catch(e) {}
  DB.set('sid_proj_' + projIdx + '_vision', boards);"""
)

# Update saveScopeItems to also save to DB
f = f.replace(
    """try { localStorage.setItem('sid_proj_' + projIdx + '_scope', JSON.stringify(items)); } catch(e) {}""",
    """try { localStorage.setItem('sid_proj_' + projIdx + '_scope', JSON.stringify(items)); } catch(e) {}
  DB.set('sid_proj_' + projIdx + '_scope', items);"""
)

# Update saveNotes to also save to DB
f = f.replace(
    """try { localStorage.setItem('sid_proj_' + projIdx + '_notes', ta.value); } catch(e) {}""",
    """try { localStorage.setItem('sid_proj_' + projIdx + '_notes', ta.value); } catch(e) {}
    DB.set('sid_proj_' + projIdx + '_notes', ta.value);"""
)

# Update saveBudgetItems to also save to DB
f = f.replace(
    """try { localStorage.setItem('sid_proj_' + projIdx + '_budget', JSON.stringify(items)); } catch(e) {}""",
    """try { localStorage.setItem('sid_proj_' + projIdx + '_budget', JSON.stringify(items)); } catch(e) {}
  DB.set('sid_proj_' + projIdx + '_budget', items);"""
)

# Add initial DB load on page startup - fetch from DB and sync to localStorage
# Insert right before loadSavedState call
f = f.replace(
    '// Load saved state on page load\nloadSavedState();',
    """// Load data from database on page startup
async function initFromDB() {
  try {
    var albums = await DB.get('sid_albums');
    if (albums) { localStorage.setItem('sid_albums', JSON.stringify(albums)); renderPortfolio(); }
    var hero = await DB.get('sid_heroSlides');
    if (hero) localStorage.setItem('sid_heroSlides', JSON.stringify(hero));
    var baBefore = await DB.get('sid_baBefore');
    if (baBefore) localStorage.setItem('sid_baBefore', JSON.stringify(baBefore));
    var baAfter = await DB.get('sid_baAfter');
    if (baAfter) localStorage.setItem('sid_baAfter', JSON.stringify(baAfter));
    var projects = await DB.get('sid_projects');
    if (projects) localStorage.setItem('sid_projects', JSON.stringify(projects));
    loadSavedState();
    renderPortfolio();
  } catch(e) {
    loadSavedState();
  }
}
// Load saved state on page load
loadSavedState();
initFromDB();"""
)

open('index.html','w').write(f)
print('Done')
