import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';
import { fmtDate, avColor } from '../data/utils';
import { CalendarExportButtons } from '../data/calendarExport';
import { SocialIconRow, SocialFieldsEditor } from '../components/SocialLinks';

/* ---- MY EVENTS PAGE ---- */
export function EventsPage({ onOpenCreate, onOpenEdit }) {
  const { events } = useApp();
  const [detailEvent, setDetailEvent] = useState(null);
  const mine = events.filter(e => e.mine);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={onOpenCreate}>＋ New Event</button>
      </div>

      {mine.length === 0 ? (
        <div className="card card-p" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🍽</div>
          <div style={{ color: 'var(--ink2)' }}>No events yet. Host your first dinner.</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onOpenCreate}>＋ Host an Event</button>
        </div>
      ) : (
        <div className="ev-grid">
          {mine.map(e => <EventCard key={e.id} event={e} onClick={() => setDetailEvent(e)} />)}
        </div>
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onOpenEdit={id => { setDetailEvent(null); onOpenEdit(id); }}
        />
      )}
    </>
  );
}

/* ---- INVITES PAGE ---- */
export function InvitesPage() {
  const { invites, events, acceptInvite, declineInvite, profile } = useApp();
  const [detailEvent, setDetailEvent] = useState(null);
  const pending = invites.filter(i => i.s === 'pending').length;
  const going = events.filter(e => !e.mine && e.guests.some(g => g.n.startsWith(profile.name.split(' ')[0]) && g.s === 'approved'));

  return (
    <>
      <div className="grid-2">
        <div>
          <div className="card card-p" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Received Invitations</div>
                <div className="card-sub">{pending} pending response</div>
              </div>
            </div>
            {invites.length === 0 && <div style={{ color: 'var(--ink2)', fontSize: 13 }}>No invitations yet.</div>}
            {invites.map((inv, i) => (
              <div key={inv.id} className="p-row">
                <div className="p-left">
                  <div className={`av av-sm ${avColor(i)}`}>{inv.host.split(' ').map(x => x[0]).join('')}</div>
                  <div>
                    <div className="p-name">{inv.ev}</div>
                    <div className="p-sub">from {inv.host} · {fmtDate(inv.date)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {inv.s === 'pending' ? (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => declineInvite(inv.id)}>Decline</button>
                      <button className="btn btn-primary btn-sm" onClick={() => acceptInvite(inv.id)}>Accept</button>
                    </>
                  ) : (
                    <span className="tag tag-teal">✓ Accepted</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card card-p">
            <div className="card-header"><div className="card-title">Going To</div></div>
            {going.length === 0 && <div style={{ color: 'var(--ink2)', fontSize: 13 }}>No upcoming events yet.</div>}
            {going.map(e => (
              <div key={e.id} className="p-row">
                <div className="p-left" style={{ cursor: 'pointer' }} onClick={() => setDetailEvent(e)}>
                  <div className="av av-sm av-teal">{e.type[0]}</div>
                  <div>
                    <div className="p-name">{e.title}</div>
                    <div className="p-sub">📅 {fmtDate(e.date)} · {e.loc}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarExportButtons event={e} compact={true} />
                  <span className="tag tag-teal">Going</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {detailEvent && (
        <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} onOpenEdit={() => {}} />
      )}
    </>
  );
}

/* ---- PROFILE PAGE ---- */
export function ProfilePage() {
  const { events, profile, setProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });

  const hosted = events.filter(e => e.mine).length;

  function saveProfile() {
    setProfile(form);
    setEditing(false);
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="av av-lg av-indigo">{profile.name.split(' ').map(x => x[0]).join('').slice(0,2)}</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>{profile.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 3 }}>📍 {profile.location}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="tag tag-indigo">Host</span>
              <span className="tag tag-sky">Guest</span>
              <span className="tag tag-gray">{profile.privacy}</span>
            </div>
            <SocialIconRow socials={profile.socials || {}} website={profile.website || ''} />
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => { setForm({ ...profile }); setEditing(true); }}>Edit Profile</button>
      </div>

      <div className="card-p">
        <div className="grid-3" style={{ marginBottom: 24 }}>
          {[
            { num: hosted, label: 'Events Hosted', color: 'var(--indigo)' },
            { num: 2, label: 'Events Attended', color: 'var(--teal)' },
            { num: 12, label: 'Connections', color: 'var(--amber)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: 16, background: 'var(--page)', borderRadius: 'var(--r)' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.num}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="sec-label">About</div>
        <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.75, marginBottom: 20 }}>{profile.bio}</p>

        <div className="sec-label">Food Preferences</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {profile.prefs.map(p => <span key={p} className="tag tag-gray">{p}</span>)}
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>Edit Profile</h2>
              <div className="modal-x" onClick={() => setEditing(false)}>✕</div>
            </div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Food Preferences (comma separated)</label><input className="form-input" value={form.prefs.join(', ')} onChange={e => setForm(f => ({ ...f, prefs: e.target.value.split(',').map(x => x.trim()).filter(Boolean) }))} /></div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="form-input" value={form.timezone || 'America/Chicago'} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
                  {['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix','America/Anchorage','Pacific/Honolulu','Europe/London','Europe/Paris','Europe/Berlin','Europe/Rome','Asia/Tokyo','Asia/Shanghai','Asia/Singapore','Asia/Dubai','Australia/Sydney','Pacific/Auckland'].map(tz => {
                    try {
                      const offset = new Intl.DateTimeFormat('en',{timeZone:tz,timeZoneName:'short'}).formatToParts(new Date()).find(p=>p.type==='timeZoneName')?.value||'';
                      const city = tz.split('/').slice(-1)[0].replace('_',' ');
                      return <option key={tz} value={tz}>{city} ({offset})</option>;
                    } catch { return <option key={tz} value={tz}>{tz}</option>; }
                  })}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Privacy</label>
                <div className="pill-row">
                  {['Public', 'Friends-only', 'Private'].map(v => (
                    <div key={v} className={`pill ${form.privacy === v ? 'on' : ''}`} onClick={() => setForm(f => ({ ...f, privacy: v }))}>{v}</div>
                  ))}
                </div>
              </div>
              <div className="divider" />
              <SocialFieldsEditor
                socials={form.socials || {}}
                website={form.website || ''}
                onChangeSocial={(key, val) => setForm(f => ({ ...f, socials: { ...(f.socials || {}), [key]: val } }))}
                onChangeWebsite={val => setForm(f => ({ ...f, website: val }))}
              />
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage;
