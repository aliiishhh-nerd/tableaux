import React from 'react';
import { fmtDate, tagVis, avColor } from '../data/utils';

export default function EventCard({ event: e, onClick }) {
  const att = e.guests.filter(g => g.s === 'approved').length;
  const pct = Math.round((att / e.cap) * 100);
  const progColor = pct > 80 ? 'var(--coral)' : pct > 50 ? 'var(--amber)' : 'var(--indigo)';

  return (
    <div className="ev-card" onClick={onClick}>
      <div className="ev-img">
        {e.img
          ? <img src={e.img} alt={e.title} loading="lazy" />
          : <div className="ev-img-placeholder" style={{ background: e.invBg || '#6C5DD3' }}>🍽</div>
        }
        <div className="ev-img-overlay" />
        <div className="ev-type-tag">{e.type}</div>
      </div>

      <div className="ev-body">
        <div className="ev-title">{e.title}</div>
        <div className="ev-meta">
          <div className="ev-meta-row"><span style={{ fontSize: 12 }}>📅</span>{fmtDate(e.date)} · {e.time}</div>
          <div className="ev-meta-row"><span style={{ fontSize: 12 }}>📍</span>{e.loc}</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)' }}>{att} / {e.cap} guests</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)' }}>{pct}%</span>
          </div>
          <div className="prog-wrap">
            <div className="prog-fill" style={{ width: `${pct}%`, background: progColor }} />
          </div>
        </div>
      </div>

      <div className="ev-footer">
        <div className="pips">
          {e.guests.filter(g => g.s === 'approved').slice(0, 4).map((g, i) => (
            <div key={i} className={`pip ${avColor(i)}`}>
              {g.n.split(' ').map(x => x[0]).join('')}
            </div>
          ))}
          <span className="pip-count">{att} attending</span>
        </div>
        <span className={`tag ${tagVis(e.vis)}`}>{e.vis}</span>
      </div>
    </div>
  );
}
