/* submit-app.jsx — OnCourt Research Console (PRIVATE)
   A standalone, unlinked admin tool. Submit a paper/video/deck/link and it is
   published to the public Research Hub via the shared data layer.

   ── PRIVACY ──────────────────────────────────────────────────────────────────
   Layer 1: this page is never linked from the public site — it lives at its own
            obscure URL that only you bookmark.
   Layer 2: the passcode gate below. (In production, Claude Code swaps this for a
            real Supabase login — see SUPABASE SWAP NOTES in research-data.js.)
   Change the passcode here: */
const CONSOLE_PASSCODE = 'oncourt-2026';
const UNLOCK_KEY = 'oncourt.admin.unlocked.v1';

/* ── Set this to your public Research Hub URL once deployed ── */
const PUBLIC_HUB_URL = ''; // e.g. 'https://oncourt.com/research-hub.html'

const RD = window.ResearchData;

const TYPE_SUGGESTIONS = ['Research Paper', 'Research Summary', 'White Paper', 'Methodology', 'Case Study', 'Lecture'];

/* ── Shared style atoms ───────────────────────────────────────── */
const cs = {
  label: {
    display: 'block',
    fontFamily: 'var(--font-label)',
    fontWeight: 'var(--weight-medium)',
    fontSize: 'var(--fs-caption)',
    letterSpacing: 'var(--tracking-label)',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: 'var(--space-2)'
  },
  hint: {
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--fs-caption)',
    color: 'var(--text-tertiary)',
    marginTop: 6,
    lineHeight: 1.5
  },
  fieldGroup: { marginBottom: 'var(--space-5)' }
};

/* ════════════════════════════════════════════════════════════════
   LOCK SCREEN
   ════════════════════════════════════════════════════════════════ */
function LockScreen({ onUnlock }) {
  const { Button } = window.OnCourtDesignSystem_dbd40f;
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, []);

  const submit = (e) => {
    e.preventDefault();
    if (value === CONSOLE_PASSCODE) {
      try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch (e2) {}
      onUnlock();
    } else {
      setError(true);
      setValue('');
    }
  };

  return React.createElement('div', {
    style: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--gutter)', background: 'var(--graphite-900)'
    }
  },
    React.createElement('div', {
      style: {
        width: '100%', maxWidth: 400, background: 'var(--graphite-800)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)',
        padding: 'clamp(2rem, 5vw, 3rem)', boxShadow: 'var(--shadow-lg)'
      }
    },
      React.createElement('div', {
        style: {
          width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(240,83,41,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-5)'
        }
      },
        React.createElement('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--flame-400)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2 }),
          React.createElement('path', { d: 'M7 11V7a5 5 0 0110 0v4' })
        )
      ),
      React.createElement('h1', {
        style: {
          fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-medium)',
          fontSize: 'var(--fs-h3)', color: 'var(--bone-50)', letterSpacing: 'var(--tracking-tight)',
          marginBottom: 'var(--space-2)'
        }
      }, 'Research Console'),
      React.createElement('p', {
        style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', color: 'var(--graphite-400)', marginBottom: 'var(--space-6)', lineHeight: 'var(--leading-body)' }
      }, 'Private — enter your passcode to manage the Research Hub.'),
      React.createElement('form', { onSubmit: submit },
        React.createElement('input', {
          ref: inputRef,
          type: 'password',
          className: 'oc-field',
          placeholder: 'Passcode',
          value: value,
          onChange: (e) => { setValue(e.target.value); setError(false); },
          style: error ? { borderColor: 'var(--critical)', boxShadow: '0 0 0 3px rgba(216,66,27,0.18)' } : null
        }),
        error ? React.createElement('p', {
          style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--flame-300)', marginTop: 8 }
        }, 'Incorrect passcode. Try again.') : null,
        React.createElement('div', { style: { marginTop: 'var(--space-5)' } },
          React.createElement(Button, { variant: 'primary', size: 'md', type: 'submit', style: { width: '100%' } }, 'Unlock')
        )
      )
    )
  );
}

/* ════════════════════════════════════════════════════════════════
   FORMAT PICKER (segmented)
   ════════════════════════════════════════════════════════════════ */
function FormatPicker({ value, onChange }) {
  const formats = Object.keys(RD.FORMATS);
  return React.createElement('div', {
    style: { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }
  },
    formats.map((f) => {
      const active = value === f;
      return React.createElement('button', {
        key: f,
        type: 'button',
        onClick: () => onChange(f),
        style: {
          fontFamily: 'var(--font-label)', fontWeight: 'var(--weight-medium)',
          fontSize: 'var(--fs-caption)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase',
          padding: '9px 16px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
          border: active ? '1px solid var(--flame-500)' : '1px solid var(--border-default)',
          background: active ? 'var(--flame-500)' : 'var(--surface-card)',
          color: active ? '#fff' : 'var(--text-secondary)',
          transition: 'all var(--dur-fast) var(--ease-standard)'
        }
      }, RD.FORMATS[f].label);
    })
  );
}

/* ════════════════════════════════════════════════════════════════
   FILE DROPZONE
   ════════════════════════════════════════════════════════════════ */
function Dropzone({ file, accepts, onFile }) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);

  const pick = (f) => { if (f) onFile(f); };

  return React.createElement('div', null,
    React.createElement('div', {
      onClick: () => inputRef.current && inputRef.current.click(),
      onDragOver: (e) => { e.preventDefault(); setDrag(true); },
      onDragLeave: () => setDrag(false),
      onDrop: (e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); },
      style: {
        border: drag ? '1.5px dashed var(--flame-500)' : '1.5px dashed var(--border-strong)',
        borderRadius: 'var(--radius-md)',
        background: drag ? 'var(--flame-50)' : 'var(--surface-raised)',
        padding: 'var(--space-6)', textAlign: 'center', cursor: 'pointer',
        transition: 'all var(--dur-fast) var(--ease-standard)'
      }
    },
      React.createElement('input', {
        ref: inputRef, type: 'file', accept: accepts || undefined, style: { display: 'none' },
        onChange: (e) => pick(e.target.files[0])
      }),
      React.createElement('svg', { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--text-tertiary)', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', style: { marginBottom: 8 } },
        React.createElement('path', { d: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4' }),
        React.createElement('path', { d: 'M17 8l-5-5-5 5M12 3v12' })
      ),
      React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-secondary)', margin: 0 } },
        file ? null : 'Drop a file here, or click to browse'
      ),
      file ? React.createElement('p', { style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)', margin: 0 } },
        file.name + '  ·  ' + (file.size / 1024 / 1024).toFixed(2) + ' MB'
      ) : null
    ),
    React.createElement('p', { style: cs.hint },
      file && file.size > 4 * 1024 * 1024
        ? '⚠ Over ~4 MB — fine once on the real backend, but may exceed the local-demo storage limit.'
        : 'Demo stores files in your browser (≈4 MB cap). On the live backend, any size is fine.'
    )
  );
}

/* ════════════════════════════════════════════════════════════════
   TAG INPUT
   ════════════════════════════════════════════════════════════════ */
function TagInput({ tags, onChange }) {
  const [draft, setDraft] = React.useState('');
  const add = () => {
    const t = draft.trim();
    if (t && tags.indexOf(t) === -1) onChange(tags.concat(t));
    setDraft('');
  };
  return React.createElement('div', null,
    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: tags.length ? 10 : 0 } },
      tags.map((t) =>
        React.createElement('span', {
          key: t,
          style: {
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-label)', fontSize: '0.6875rem', letterSpacing: '0.04em',
            padding: '5px 8px 5px 12px', borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-sunken)', color: 'var(--text-primary)'
          }
        }, t,
          React.createElement('button', {
            type: 'button',
            onClick: () => onChange(tags.filter((x) => x !== t)),
            style: { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0, lineHeight: 1, fontSize: 14 }
          }, '×')
        )
      )
    ),
    React.createElement('input', {
      type: 'text', className: 'oc-field', placeholder: 'Add a tag, press Enter',
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onKeyDown: (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }
    })
  );
}

/* ════════════════════════════════════════════════════════════════
   LIVE PREVIEW CARD (mirrors the public hub card)
   ════════════════════════════════════════════════════════════════ */
function PreviewCard({ draft }) {
  const fmt = RD.FORMATS[draft.format] || RD.FORMATS.PDF;
  const tags = draft.tags || [];
  return React.createElement('div', {
    style: {
      background: 'var(--graphite-800)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)',
      border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
      minHeight: 260
    }
  },
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 } },
      React.createElement('span', {
        style: { fontFamily: 'var(--font-label)', fontWeight: 'var(--weight-medium)', fontSize: '0.6875rem', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--flame-400)' }
      }, draft.typeLabel || draft.category || 'Type'),
      React.createElement('span', {
        style: { fontFamily: 'var(--font-label)', fontWeight: 'var(--weight-medium)', fontSize: '0.625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--graphite-300)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-pill)', padding: '4px 10px' }
      }, fmt.label)
    ),
    React.createElement('h3', {
      style: { fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--fs-h4)', lineHeight: 'var(--leading-snug)', color: 'var(--text-on-ink)', letterSpacing: 'var(--tracking-tight)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word', minWidth: 0 }
    }, draft.title || 'Your title will appear here'),
    draft.summary ? React.createElement('p', {
      style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', lineHeight: 'var(--leading-body)', color: 'var(--graphite-400)', margin: 0 }
    }, draft.summary) : null,
    tags.length ? React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
      tags.map((t) => React.createElement('span', {
        key: t, style: { fontFamily: 'var(--font-label)', fontSize: '0.6875rem', letterSpacing: '0.04em', padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.05)', color: 'var(--graphite-300)' }
      }, t))
    ) : null,
    React.createElement('div', {
      style: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-caption)', color: 'var(--graphite-400)', marginTop: 4 }
    },
      React.createElement('span', null, draft.date || RD.formatMonth(Date.now())),
      draft.meta ? React.createElement('span', { style: { width: 3, height: 3, borderRadius: '50%', background: 'var(--graphite-500)', flexShrink: 0 } }) : null,
      draft.meta ? React.createElement('span', null, draft.meta) : null,
      (draft.publisherName || (draft.publisherLogoMode === 'url' && draft.publisherLogoUrl) || (draft.publisherLogoMode === 'file' && draft.publisherLogoFile))
        ? React.createElement('span', { style: { width: 3, height: 3, borderRadius: '50%', background: 'var(--graphite-500)', flexShrink: 0 } })
        : null,
      /* Publisher logo or name */
      (draft.publisherLogoMode === 'url' && draft.publisherLogoUrl)
        ? React.createElement('img', { src: draft.publisherLogoUrl, alt: draft.publisherName || 'Publisher', style: { height: 40, maxWidth: 64, objectFit: 'contain', borderRadius: 4, flexShrink: 0 } })
        : (draft.publisherLogoMode === 'file' && draft.publisherLogoFile)
        ? React.createElement('img', { src: URL.createObjectURL(draft.publisherLogoFile), alt: draft.publisherName || 'Publisher', style: { height: 40, maxWidth: 64, objectFit: 'contain', borderRadius: 4, flexShrink: 0 } })
        : draft.publisherName
        ? React.createElement('span', null, draft.publisherName)
        : null,
      React.createElement('span', {
        style: { marginLeft: 'auto', fontFamily: 'var(--font-label)', fontWeight: 'var(--weight-medium)', fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--flame-400)' }
      }, fmt.verb + ' →')
    )
  );
}

/* ════════════════════════════════════════════════════════════════
   PUBLISHED LIST (manage / delete)
   ════════════════════════════════════════════════════════════════ */
function PublishedList({ items, onDelete }) {
  if (!items.length) {
    return React.createElement('p', {
      style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', color: 'var(--text-tertiary)', padding: 'var(--space-4) 0' }
    }, 'Nothing published yet. Your first submission will appear here and on the hub.');
  }
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
    items.map((it) =>
      React.createElement('div', {
        key: it.id,
        style: {
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          padding: '12px 14px', background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)'
        }
      },
        React.createElement('div', { style: { minWidth: 0, flex: 1 } },
          React.createElement('p', {
            style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
          }, it.title),
          React.createElement('p', {
            style: { fontFamily: 'var(--font-label)', fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '3px 0 0' }
          }, it.format + '  ·  ' + it.category + '  ·  ' + it.date)
        ),
        React.createElement('button', {
          type: 'button',
          onClick: () => onDelete(it.id),
          title: 'Remove from hub',
          style: { border: '1px solid var(--border-default)', background: 'var(--surface-card)', color: 'var(--text-tertiary)', borderRadius: 'var(--radius-sm)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all var(--dur-fast) var(--ease-standard)' },
          onMouseEnter: (e) => { e.currentTarget.style.borderColor = 'var(--critical)'; e.currentTarget.style.color = 'var(--critical)'; },
          onMouseLeave: (e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }
        },
          React.createElement('svg', { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
            React.createElement('path', { d: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6' })
          )
        )
      )
    )
  );
}

/* ════════════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════════════ */
function Toast({ message, onDone }) {
  React.useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return React.createElement('div', {
    style: {
      position: 'fixed', bottom: 'var(--space-6)', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--graphite-900)', color: 'var(--bone-50)', padding: '14px 22px',
      borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-lg)', zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body-sm)', fontWeight: 'var(--weight-medium)'
    }
  },
    React.createElement('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--flame-400)', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('path', { d: 'M20 6L9 17l-5-5' })
    ),
    message
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN CONSOLE
   ════════════════════════════════════════════════════════════════ */
const BLANK = {
  format: 'PDF',
  sourceMode: 'file',   // 'file' | 'url'
  title: '',
  category: RD.CATEGORIES[0],
  typeLabel: 'Research Paper',
  tags: [],
  meta: '',
  date: '',
  summary: '',
  url: '',
  publisherName: '',
  publisherLogoMode: 'none',  // 'none' | 'url' | 'file'
  publisherLogoUrl: '',
  publisherLogoFile: null
};

function Console({ onLock }) {
  const { Button } = window.OnCourtDesignSystem_dbd40f;
  const [draft, setDraft] = React.useState(BLANK);
  const [file, setFile] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const [toast, setToast] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const refresh = React.useCallback(() => {
    RD.getAll().then(setItems);
  }, []);

  React.useEffect(() => {
    refresh();
    const unsub = RD.subscribe(refresh);
    return unsub;
  }, [refresh]);

  // When format changes, default the source mode to the format's natural source.
  const onFormat = (f) => {
    set({ format: f, sourceMode: RD.FORMATS[f].source });
  };

  const validate = () => {
    const e = {};
    if (!draft.title.trim()) e.title = true;
    if (draft.sourceMode === 'file' && !file) e.source = 'Attach a file.';
    if (draft.sourceMode === 'url' && !draft.url.trim()) e.source = 'Enter a URL.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const publish = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const fields = {
        title: draft.title,
        category: draft.category,
        typeLabel: draft.typeLabel,
        format: draft.format,
        tags: draft.tags,
        meta: draft.meta,
        date: draft.date || RD.formatMonth(Date.now()),
        summary: draft.summary,
        url: draft.sourceMode === 'url' ? draft.url : '',
        publisherName: draft.publisherName,
        publisherLogo: draft.publisherLogoMode === 'url' ? draft.publisherLogoUrl : null
      };
      if (draft.sourceMode === 'file' && file) {
        try {
          fields.fileData = await RD.fileToDataURL(file);
          fields.fileName = file.name;
        } catch (err) {
          setToast('Could not read that file.'); setBusy(false); return;
        }
      }
      if (draft.publisherLogoMode === 'file' && draft.publisherLogoFile) {
        try {
          fields.publisherLogo = await RD.fileToDataURL(draft.publisherLogoFile);
        } catch (err) {
          setToast('Could not read the publisher logo.'); setBusy(false); return;
        }
      }
      const item = RD.makeItem(fields);
      try {
        await RD.add(item);
      } catch (err) {
        setToast('Storage is full — that file is too large for the local demo.');
        setBusy(false); return;
      }
      setToast('Published to the Research Hub ✓');
      setDraft({ ...BLANK, format: draft.format, sourceMode: draft.sourceMode, category: draft.category });
      setFile(null);
      set({ publisherLogoFile: null });
      setErrors({});
    } finally {
      setBusy(false);
    }
  };

  const remove = (id) => { RD.remove(id); };

  const fmt = RD.FORMATS[draft.format];
  const allowsFileToggle = true; // any format can use either a file or a URL

  /* ── Layout ── */
  const page = {
    maxWidth: 1180, margin: '0 auto', padding: 'var(--space-7) var(--gutter) var(--space-9)'
  };
  const grid = {
    display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
    gap: 'clamp(2rem, 4vw, 4rem)', alignItems: 'start'
  };

  return React.createElement(React.Fragment, null,
    /* Header */
    React.createElement('header', {
      style: {
        borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-raised)',
        position: 'sticky', top: 0, zIndex: 50
      }
    },
      React.createElement('div', {
        style: { maxWidth: 1180, margin: '0 auto', padding: '16px var(--gutter)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--space-4)' } },
          React.createElement('img', { src: 'assets/oncourt-horizontal-color.png', alt: 'OnCourt', style: { height: 22 } }),
          React.createElement('span', {
            style: { fontFamily: 'var(--font-label)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--fs-caption)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-tertiary)', borderLeft: '1px solid var(--border-default)', paddingLeft: 'var(--space-4)' }
          }, 'Research Console · Private')
        ),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' } },
          React.createElement('a', {
            href: PUBLIC_HUB_URL || '#', target: '_blank', rel: 'noopener noreferrer',
            style: { fontFamily: 'var(--font-label)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--fs-caption)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }
          }, 'View hub',
            React.createElement('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
              React.createElement('path', { d: 'M7 17L17 7M17 7H7M17 7V17' })
            )
          ),
          React.createElement('button', {
            type: 'button', onClick: onLock, title: 'Lock console',
            style: { border: '1px solid var(--border-default)', background: 'var(--surface-card)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-pill)', height: 36, padding: '0 14px', display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontFamily: 'var(--font-label)', fontSize: 'var(--fs-caption)', fontWeight: 'var(--weight-medium)', letterSpacing: '0.04em' }
          },
            React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
              React.createElement('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2 }),
              React.createElement('path', { d: 'M7 11V7a5 5 0 0110 0v4' })
            ),
            'Lock'
          )
        )
      )
    ),

    React.createElement('main', { style: page },
      React.createElement('div', { style: { marginBottom: 'var(--space-7)' } },
        React.createElement('h1', {
          style: { fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-medium)', fontSize: 'var(--fs-h2)', color: 'var(--text-primary)', letterSpacing: 'var(--tracking-tight)', marginBottom: 'var(--space-2)' }
        }, 'Publish to the Research Hub'),
        React.createElement('p', {
          style: { fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-body)', color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 'var(--leading-body)' }
        }, 'Add a paper, summary, video, deck, or link. It goes live on the public hub the moment you publish.')
      ),

      React.createElement('div', { style: grid },
        /* ── LEFT: form ── */
        React.createElement('div', null,
          /* Format */
          React.createElement('div', { style: cs.fieldGroup },
            React.createElement('label', { style: cs.label }, 'Material format'),
            React.createElement(FormatPicker, { value: draft.format, onChange: onFormat })
          ),

          /* Source toggle + input */
          React.createElement('div', { style: cs.fieldGroup },
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' } },
              React.createElement('label', { style: { ...cs.label, marginBottom: 0 } }, 'The material'),
              React.createElement('div', { style: { display: 'inline-flex', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2 } },
                ['file', 'url'].map((m) =>
                  React.createElement('button', {
                    key: m, type: 'button', onClick: () => set({ sourceMode: m }),
                    style: {
                      fontFamily: 'var(--font-label)', fontWeight: 'var(--weight-medium)', fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '6px 12px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
                      background: draft.sourceMode === m ? 'var(--surface-card)' : 'transparent',
                      color: draft.sourceMode === m ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      boxShadow: draft.sourceMode === m ? 'var(--shadow-xs)' : 'none',
                      transition: 'all var(--dur-fast) var(--ease-standard)'
                    }
                  }, m === 'file' ? 'Upload' : 'Link')
                )
              )
            ),
            draft.sourceMode === 'file'
              ? React.createElement(Dropzone, { file, accepts: fmt.accepts, onFile: (f) => { setFile(f); setErrors((e) => ({ ...e, source: undefined })); } })
              : React.createElement('div', null,
                  React.createElement('input', {
                    type: 'url', className: 'oc-field', placeholder: draft.format === 'Video' ? 'https://youtube.com/watch?v=…' : 'https://…',
                    value: draft.url, onChange: (e) => { set({ url: e.target.value }); setErrors((er) => ({ ...er, source: undefined })); }
                  }),
                  React.createElement('p', { style: cs.hint }, draft.format === 'Video' ? 'Paste a YouTube, Vimeo, or hosted video URL.' : 'Link to a hosted paper, deck, or external resource.')
                ),
            errors.source ? React.createElement('p', { style: { ...cs.hint, color: 'var(--critical)' } }, errors.source) : null
          ),

          /* Title */
          React.createElement('div', { style: cs.fieldGroup },
            React.createElement('label', { style: cs.label }, 'Title'),
            React.createElement('input', {
              type: 'text', className: 'oc-field', placeholder: 'e.g. Long-Term Athletic Development in Practice',
              value: draft.title, onChange: (e) => { set({ title: e.target.value }); setErrors((er) => ({ ...er, title: undefined })); },
              style: errors.title ? { borderColor: 'var(--critical)', boxShadow: '0 0 0 3px rgba(216,66,27,0.18)' } : null
            }),
            errors.title ? React.createElement('p', { style: { ...cs.hint, color: 'var(--critical)' } }, 'A title is required.') : null
          ),

          /* Category + Type label (two-up) */
          React.createElement('div', { style: { ...cs.fieldGroup, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' } },
            React.createElement('div', null,
              React.createElement('label', { style: cs.label }, 'Category'),
              React.createElement('select', {
                className: 'oc-field', value: draft.category, onChange: (e) => set({ category: e.target.value })
              }, RD.CATEGORIES.map((c) => React.createElement('option', { key: c, value: c }, c)))
            ),
            React.createElement('div', null,
              React.createElement('label', { style: cs.label }, 'Type label'),
              React.createElement('input', {
                type: 'text', className: 'oc-field', placeholder: 'Research Paper', list: 'type-suggestions',
                value: draft.typeLabel, onChange: (e) => set({ typeLabel: e.target.value })
              }),
              React.createElement('datalist', { id: 'type-suggestions' },
                TYPE_SUGGESTIONS.map((t) => React.createElement('option', { key: t, value: t }))
              )
            )
          ),

          /* Meta + Date (two-up) */
          React.createElement('div', { style: { ...cs.fieldGroup, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' } },
            React.createElement('div', null,
              React.createElement('label', { style: cs.label }, draft.format === 'Video' ? 'Duration' : 'Read time'),
              React.createElement('input', {
                type: 'text', className: 'oc-field', placeholder: draft.format === 'Video' ? '8:40' : '12 min read',
                value: draft.meta, onChange: (e) => set({ meta: e.target.value })
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { style: cs.label }, 'Date label'),
              React.createElement('input', {
                type: 'text', className: 'oc-field', placeholder: RD.formatMonth(Date.now()),
                value: draft.date, onChange: (e) => set({ date: e.target.value })
              })
            )
          ),

          /* Tags */
          React.createElement('div', { style: cs.fieldGroup },
            React.createElement('label', { style: cs.label }, 'Tags'),
            React.createElement(TagInput, { tags: draft.tags, onChange: (t) => set({ tags: t }) })
          ),

          /* Summary */
          React.createElement('div', { style: cs.fieldGroup },
            React.createElement('label', { style: cs.label }, 'Summary ', React.createElement('span', { style: { textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)', fontWeight: 'var(--weight-regular)' } }, '· optional')),
            React.createElement('textarea', {
              className: 'oc-field', placeholder: 'One or two sentences shown on the card.',
              value: draft.summary, onChange: (e) => set({ summary: e.target.value })
            })
          ),

          /* Publisher */
          React.createElement('div', { style: cs.fieldGroup },
            React.createElement('label', { style: cs.label }, 'Publisher ', React.createElement('span', { style: { textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)', fontWeight: 'var(--weight-regular)' } }, '· optional')),
            React.createElement('input', {
              type: 'text', className: 'oc-field', placeholder: 'e.g. Aspetar, BJSM, FIFA Medical',
              value: draft.publisherName, onChange: (e) => set({ publisherName: e.target.value }),
              style: { marginBottom: 'var(--space-3)' }
            }),
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' } },
              React.createElement('span', { style: { ...cs.label, marginBottom: 0 } }, 'Publisher logo'),
              React.createElement('div', { style: { display: 'inline-flex', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-pill)', padding: 3, gap: 2 } },
                ['none', 'url', 'file'].map((m) =>
                  React.createElement('button', {
                    key: m, type: 'button', onClick: () => set({ publisherLogoMode: m }),
                    style: {
                      fontFamily: 'var(--font-label)', fontWeight: 'var(--weight-medium)', fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '6px 12px', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer',
                      background: draft.publisherLogoMode === m ? 'var(--surface-card)' : 'transparent',
                      color: draft.publisherLogoMode === m ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      boxShadow: draft.publisherLogoMode === m ? 'var(--shadow-xs)' : 'none',
                      transition: 'all var(--dur-fast) var(--ease-standard)'
                    }
                  }, m === 'none' ? 'None' : m === 'url' ? 'Link' : 'Upload')
                )
              )
            ),
            draft.publisherLogoMode === 'url'
              ? React.createElement('input', {
                  type: 'url', className: 'oc-field', placeholder: 'https://…/logo.png',
                  value: draft.publisherLogoUrl, onChange: (e) => set({ publisherLogoUrl: e.target.value })
                })
              : draft.publisherLogoMode === 'file'
              ? React.createElement('div', null,
                  React.createElement('input', {
                    type: 'file', accept: 'image/*', className: 'oc-field',
                    onChange: (e) => set({ publisherLogoFile: e.target.files[0] || null }),
                    style: { cursor: 'pointer' }
                  }),
                  draft.publisherLogoFile
                    ? React.createElement('p', { style: cs.hint }, draft.publisherLogoFile.name)
                    : null
                )
              : null
          ),

          /* Submit */
          React.createElement('div', { style: { marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)' } },
            React.createElement(Button, { variant: 'primary', size: 'lg', onClick: publish, disabled: busy },
              busy ? 'Publishing…' : 'Publish to hub'
            ),
            React.createElement(Button, { variant: 'ghost', size: 'lg', onClick: () => { setDraft(BLANK); setFile(null); setErrors({}); } }, 'Reset')
          )
        ),

        /* ── RIGHT: preview + manage (sticky) ── */
        React.createElement('div', { style: { position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' } },
          React.createElement('div', null,
            React.createElement('label', { style: { ...cs.label, marginBottom: 'var(--space-3)' } }, 'Live preview'),
            React.createElement('div', { style: { background: 'var(--graphite-900)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' } },
              React.createElement(PreviewCard, { draft })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { ...cs.label, marginBottom: 'var(--space-3)', display: 'flex', justifyContent: 'space-between' } },
              React.createElement('span', null, 'Published'),
              React.createElement('span', { style: { color: 'var(--text-tertiary)' } }, items.length + ' item' + (items.length === 1 ? '' : 's'))
            ),
            React.createElement(PublishedList, { items, onDelete: remove })
          )
        )
      )
    ),

    React.createElement(Toast, { message: toast, onDone: () => setToast('') })
  );
}

/* ════════════════════════════════════════════════════════════════
   ROOT — gate
   ════════════════════════════════════════════════════════════════ */
function ResearchConsole() {
  const [unlocked, setUnlocked] = React.useState(() => {
    try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; }
  });

  if (!unlocked) return React.createElement(LockScreen, { onUnlock: () => setUnlocked(true) });
  return React.createElement(Console, {
    onLock: () => { try { sessionStorage.removeItem(UNLOCK_KEY); } catch (e) {} setUnlocked(false); }
  });
}

window.ResearchConsole = ResearchConsole;
