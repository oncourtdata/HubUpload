/* ============================================================================
   research-data.js  —  OnCourt Research Hub data layer
   ----------------------------------------------------------------------------
   The PUBLIC hub and the PRIVATE admin portal both talk to the hub through this
   one module. Today it is backed by the browser's localStorage, which is why,
   in the local demo, a submission made in the admin portal appears instantly in
   the public hub (same browser = same storage).

   ── GOING LIVE (Claude Code / Supabase) ──────────────────────────────────────
   To publish for ALL visitors across devices, replace ONLY the four functions
   in the "STORAGE DRIVER" block below with Supabase calls. Nothing else in the
   app needs to change. See the SUPABASE SWAP NOTES at the bottom of this file.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'oncourt.research.items.v1';

  /* The 8 publishable categories (the hub adds "All" itself for filtering). */
  var CATEGORIES = [
    'Sports Science',
    'Youth Development',
    'Training Methods',
    'Recovery',
    'Nutrition',
    'Performance Analytics',
    'Psychology & Cognitive Abilities',
    'Technical Proficiency'
  ];

  /* Material formats and the verb each one uses on its card. */
  var FORMATS = {
    PDF:      { label: 'PDF',      verb: 'Download', accepts: '.pdf',                  source: 'file' },
    Slides:   { label: 'Slides',   verb: 'Open',     accepts: '.pdf,.ppt,.pptx,.key', source: 'file' },
    Document: { label: 'Document', verb: 'Download', accepts: '.pdf,.doc,.docx',      source: 'file' },
    Video:    { label: 'Video',    verb: 'Watch',    accepts: '',                     source: 'url'  },
    Link:     { label: 'Link',     verb: 'Read',     accepts: '',                     source: 'url'  }
  };

  /* ──────────────────────────────────────────────────────────────────────────
     STORAGE DRIVER  —  swap THIS block for Supabase when going live.
     Every function returns a Promise so the swap is drop-in (async by nature).
     ────────────────────────────────────────────────────────────────────────── */

  function _readRaw() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('[research-data] read failed', e);
      return [];
    }
  }

  function _writeRaw(items) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Notify the current tab (storage event only fires in OTHER tabs).
    window.dispatchEvent(new CustomEvent('research-data:changed'));
  }

  /* getAll() → Promise<Item[]> — newest first. */
  function getAll() {
    var items = _readRaw().slice().sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return Promise.resolve(items);
  }

  /* add(item) → Promise<Item> */
  function add(item) {
    var items = _readRaw();
    items.push(item);
    _writeRaw(items);
    return Promise.resolve(item);
  }

  /* remove(id) → Promise<void> */
  function remove(id) {
    var items = _readRaw().filter(function (it) { return it.id !== id; });
    _writeRaw(items);
    return Promise.resolve();
  }

  /* ──────────────────────────────────────────────────────────────────────────
     END STORAGE DRIVER. Everything below is storage-agnostic.
     ────────────────────────────────────────────────────────────────────────── */

  /* Build a normalized item from raw form values. */
  function makeItem(fields) {
    var now = Date.now();
    return {
      id: 'r_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 7),
      createdAt: now,
      title: (fields.title || '').trim(),
      category: fields.category || CATEGORIES[0],
      typeLabel: (fields.typeLabel || '').trim(),     // e.g. "Research Paper", "White Paper"
      format: fields.format || 'PDF',                  // PDF | Slides | Document | Video | Link
      tags: (fields.tags || []).filter(Boolean),
      meta: (fields.meta || '').trim(),                // e.g. "12 min read" / "8:40"
      summary: (fields.summary || '').trim(),
      date: fields.date || formatMonth(now),           // human label e.g. "Jun 2026"
      publisherName: (fields.publisherName || '').trim(),
      publisherLogo: fields.publisherLogo || null,     // data: URL or external URL
      // Source of the actual material — exactly one of these is populated:
      fileData: fields.fileData || null,               // data: URL (base64) for uploaded files
      fileName: fields.fileName || null,
      url: (fields.url || '').trim() || null           // external URL for Video / Link
    };
  }

  function formatMonth(ts) {
    var d = new Date(ts);
    var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return m[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* Resolve where a card's "open" action should go. */
  function resolveAction(item) {
    if (item.url) return { kind: 'url', href: item.url };
    if (item.fileData) return { kind: 'file', href: item.fileData, download: item.fileName };
    return null;
  }

  /* Subscribe to changes (same-tab custom event + cross-tab storage event). */
  function subscribe(cb) {
    function onCustom() { cb(); }
    function onStorage(e) { if (e.key === STORAGE_KEY) cb(); }
    window.addEventListener('research-data:changed', onCustom);
    window.addEventListener('storage', onStorage);
    return function unsubscribe() {
      window.removeEventListener('research-data:changed', onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }

  /* Read a File object → data URL (base64). Returns Promise<string>. */
  function fileToDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  window.ResearchData = {
    CATEGORIES: CATEGORIES,
    FORMATS: FORMATS,
    getAll: getAll,
    add: add,
    remove: remove,
    makeItem: makeItem,
    resolveAction: resolveAction,
    subscribe: subscribe,
    fileToDataURL: fileToDataURL,
    formatMonth: formatMonth
  };

  /* ============================================================================
     SUPABASE SWAP NOTES  (for Claude Code)
     ----------------------------------------------------------------------------
     1. Create a table `research_items` with columns matching makeItem():
          id text primary key, created_at bigint, title text, category text,
          type_label text, format text, tags text[], meta text, summary text,
          date text, file_path text, file_name text, url text.
     2. Create a Storage bucket `research-files` (public read).
     3. In the STORAGE DRIVER block above, replace:
          getAll  → const { data } = await supabase.from('research_items')
                       .select('*').order('created_at', { ascending: false });
          add     → upload the File to Storage, get its public URL, then
                       supabase.from('research_items').insert({...}); store the
                       public URL in `fileData`/`url` instead of a base64 string.
          remove  → supabase.from('research_items').delete().eq('id', id)
                       (and remove the Storage object).
     4. AUTH (keeps the portal private): gate the admin page with
          supabase.auth.signInWithPassword and a Row Level Security policy so
          only authenticated users can INSERT/DELETE. Public hub uses the anon
          key with SELECT-only access. The obscure URL stays as layer one.
     5. Because files then live in Storage (not base64 in the row), the 5 MB
        localStorage ceiling disappears — videos/decks of any size are fine.
     ========================================================================== */
})();
