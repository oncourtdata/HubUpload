/* ============================================================================
   research-data.js  —  OnCourt Research Hub data layer  (SUPABASE-BACKED)
   ----------------------------------------------------------------------------
   The PUBLIC hub and the PRIVATE admin portal both talk to the hub through this
   one module. It is backed by Supabase, so a submission made in the admin
   portal appears on the public hub for EVERY visitor, on every device.

   Config (URL + anon key) lives on window.ONCOURT_SUPABASE, set in the HTML
   before this file loads. The anon key is safe to expose in public site code —
   access is controlled by Row Level Security policies in Supabase.
   ========================================================================== */
(function () {
  'use strict';

  /* ── The 10 publishable categories (the hub adds "All" itself for filtering). */
  var CATEGORIES = [
    'Sports Science',
    'Youth Development',
    'Training Methods',
    'Recovery',
    'Nutrition',
    'Performance Analytics',
    'Cognitive Abilities',
    'Sports Psychology',
    'Neuroscience',
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

  var TABLE = 'research_items';
  var BUCKET = 'research-files';

  /* ── Supabase client ───────────────────────────────────────────────────── */
  var cfg = window.ONCOURT_SUPABASE || {};
  var sb = (window.supabase && cfg.url && cfg.anonKey)
    ? window.supabase.createClient(cfg.url, cfg.anonKey)
    : null;

  if (!sb) {
    console.error('[research-data] Supabase not configured. Set window.ONCOURT_SUPABASE { url, anonKey } and load @supabase/supabase-js before this file.');
  }

  /* ── Row (snake_case from DB) → Item (camelCase the app uses). */
  function fromRow(r) {
    return {
      id: r.id,
      createdAt: Number(r.created_at) || 0,
      title: r.title || '',
      category: r.category || CATEGORIES[0],
      typeLabel: r.type_label || '',
      format: r.format || 'PDF',
      tags: r.tags || [],
      meta: r.meta || '',
      summary: r.summary || '',
      date: r.date || '',
      publisherName: r.publisher_name || '',
      publisherLogo: r.publisher_logo || null,
      fileData: r.file_data || null,   // now a public Storage URL (not base64)
      fileName: r.file_name || null,
      url: r.url || null
    };
  }

  /* ── Item (camelCase) → Row (snake_case for DB). */
  function toRow(it) {
    return {
      id: it.id,
      created_at: it.createdAt,
      title: it.title,
      category: it.category,
      type_label: it.typeLabel,
      format: it.format,
      tags: it.tags || [],
      meta: it.meta,
      summary: it.summary,
      date: it.date,
      publisher_name: it.publisherName || '',
      publisher_logo: it.publisherLogo || null,
      file_data: it.fileData || null,
      file_name: it.fileName || null,
      url: it.url || null
    };
  }

  /* ──────────────────────────────────────────────────────────────────────────
     STORAGE DRIVER  —  Supabase.
     ────────────────────────────────────────────────────────────────────────── */

  /* getAll() → Promise<Item[]> — newest first. */
  function getAll() {
    if (!sb) return Promise.resolve([]);
    return sb.from(TABLE).select('*').order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) { console.error('[research-data] getAll', res.error); return []; }
        return (res.data || []).map(fromRow);
      });
  }

  /* Upload a base64 data URL to Storage, return its public URL.
     Files arrive as data URLs from the form (fileToDataURL); we convert and
     upload so the heavy bytes live in Storage, not the table row. */
  function _uploadDataURL(dataUrl, nameHint) {
    return fetch(dataUrl).then(function (r) { return r.blob(); }).then(function (blob) {
      var ext = (nameHint && nameHint.indexOf('.') > -1) ? nameHint.slice(nameHint.lastIndexOf('.')) : '';
      var path = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9) + ext;
      return sb.storage.from(BUCKET).upload(path, blob, {
        contentType: blob.type || 'application/octet-stream', upsert: false
      }).then(function (up) {
        if (up.error) throw up.error;
        return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      });
    });
  }

  /* add(item) → Promise<Item> */
  function add(item) {
    if (!sb) return Promise.reject(new Error('Supabase not configured'));

    var chain = Promise.resolve(item);

    // If the file/logo are base64 data URLs, push them to Storage first.
    chain = chain.then(function (it) {
      if (it.fileData && it.fileData.indexOf('data:') === 0) {
        return _uploadDataURL(it.fileData, it.fileName).then(function (publicUrl) {
          it.fileData = publicUrl; return it;
        });
      }
      return it;
    });
    chain = chain.then(function (it) {
      if (it.publisherLogo && it.publisherLogo.indexOf('data:') === 0) {
        return _uploadDataURL(it.publisherLogo, 'logo.png').then(function (publicUrl) {
          it.publisherLogo = publicUrl; return it;
        });
      }
      return it;
    });

    return chain.then(function (it) {
      return sb.from(TABLE).insert(toRow(it)).select().single().then(function (res) {
        if (res.error) throw res.error;
        _notify();
        return fromRow(res.data);
      });
    });
  }

  /* remove(id) → Promise<void> */
  function remove(id) {
    if (!sb) return Promise.resolve();
    return sb.from(TABLE).delete().eq('id', id).then(function (res) {
      if (res.error) console.error('[research-data] remove', res.error);
      _notify();
    });
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
      typeLabel: (fields.typeLabel || '').trim(),
      format: fields.format || 'PDF',
      tags: (fields.tags || []).filter(Boolean),
      meta: (fields.meta || '').trim(),
      summary: (fields.summary || '').trim(),
      date: fields.date || formatMonth(now),
      publisherName: (fields.publisherName || '').trim(),
      publisherLogo: fields.publisherLogo || null,
      fileData: fields.fileData || null,
      fileName: fields.fileName || null,
      url: (fields.url || '').trim() || null
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

  /* ── Change notification ───────────────────────────────────────────────────
     Same-tab: a custom event. Cross-client (other devices/tabs): Supabase
     Realtime on the table. Both call the subscriber so the hub refreshes live. */
  function _notify() {
    window.dispatchEvent(new CustomEvent('research-data:changed'));
  }

  function subscribe(cb) {
    function onCustom() { cb(); }
    window.addEventListener('research-data:changed', onCustom);

    var channel = null;
    if (sb) {
      channel = sb.channel('research_items_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, function () { cb(); })
        .subscribe();
    }

    return function unsubscribe() {
      window.removeEventListener('research-data:changed', onCustom);
      if (channel) sb.removeChannel(channel);
    };
  }

  /* Read a File object → data URL (base64). Returns Promise<string>.
     The form still uses this; add() converts the data URL to a Storage upload. */
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
})();
