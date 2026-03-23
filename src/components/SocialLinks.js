import React from 'react';

const SOCIALS = [
  { key: 'instagram', label: 'Instagram', icon: '📸', prefix: 'https://instagram.com/', placeholder: 'username', color: '#E1306C' },
  { key: 'tiktok',    label: 'TikTok',    icon: '🎵', prefix: 'https://tiktok.com/@',  placeholder: 'username', color: '#000000' },
  { key: 'twitter',   label: 'X / Twitter', icon: '✖', prefix: 'https://x.com/',       placeholder: 'username', color: '#1DA1F2' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: '💼', prefix: 'https://linkedin.com/in/', placeholder: 'username', color: '#0077B5' },
];

function buildUrl(key, value) {
  if (!value) return null;
  // If already a full URL, use as-is
  if (value.startsWith('http')) return value;
  const s = SOCIALS.find(s => s.key === key);
  return s ? s.prefix + value.replace('@', '') : null;
}

// ── Display: social icon buttons ─────────────────────────────────────────────
export function SocialIconRow({ socials = {}, website = '' }) {
  const hasAny = website || Object.values(socials).some(v => v);
  if (!hasAny) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
      {website && (
        <a href={website.startsWith('http') ? website : 'https://' + website}
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: 'var(--page)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--indigo)', textDecoration: 'none', transition: 'all .18s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
          🌐 Website
        </a>
      )}
      {SOCIALS.map(s => {
        const val = socials[s.key];
        if (!val) return null;
        const url = buildUrl(s.key, val);
        return (
          <a key={s.key} href={url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: 'var(--page)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--ink2)', textDecoration: 'none', transition: 'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.color = s.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink2)'; }}>
            <span style={{ fontSize: 13 }}>{s.icon}</span>
            {val.replace('@', '')}
          </a>
        );
      })}
    </div>
  );
}

// ── Edit: social fields inside profile modal ──────────────────────────────────
export function SocialFieldsEditor({ socials = {}, website = '', onChangeSocial, onChangeWebsite }) {
  return (
    <div>
      <div className="form-group">
        <label className="form-label">Website URL</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🌐</span>
          <input
            className="form-input"
            placeholder="yourwebsite.com"
            value={website}
            onChange={e => onChangeWebsite(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Social Links</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SOCIALS.map(s => (
            <div key={s.key} style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>{s.icon}</span>
              <input
                className="form-input"
                placeholder={s.label + ' — ' + s.placeholder}
                value={socials[s.key] || ''}
                onChange={e => onChangeSocial(s.key, e.target.value)}
                style={{ paddingLeft: 34 }}
              />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 6 }}>Enter just your username — no need for the full URL.</div>
      </div>
    </div>
  );
}
