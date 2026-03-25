import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime } from '../data/utils';
import EventDetailModal from '../components/EventDetailModal';

export default function InvitesPage() {
  const { events, rsvpEvent, addToast } = useApp();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('pending');

  const invites = events.filter(e => e.isInvitedTo);
  const myGuest = (e) => e.guests?.find(g => g.id === 'u1');

  const pending  = invites.filter(e => myGuest(e)?.s === 'pending');
  const accepted = invites.filter(e => myGuest(e)?.s === 'approved');
  const declined = invites.filter(e => myGuest(e)?.s === 'declined');

  const tabs = [
    { key: 'pending',  label: `Pending (${pending.length})` },
    { key: 'accepted', label: `Accepted (${accepted.length})` },
    { key: 'declined', label: `Declined (${declined.length})` },
  ];

  const display = tab === 'pending' ? pending : tab === 'accepted' ? accepted : declined;

  return (
    <main className="page-content">
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {display.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">{tab === 'pending' ? '✉️' : tab === 'accepted' ? '🎉' : '🙈'}</div>
          <div className="empty-title">
            {tab === 'pending' ? 'No pending invitations' : tab === 'accepted' ? 'No accepted invitations yet' : 'No declined invitations'}
          </div>
          <div className="empty-sub">
            {tab === 'pending' ? "You're all caught up." : tab === 'accepted' ? 'Accept an invitation to get started.' : ''}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {display.map(evt => (
          <InviteCard
            key={evt.id}
            event={evt}
            myStatus={myGuest(evt)?.s}
            onView={() => setSelected(evt)}
            onAccept={() => { rsvpEvent(evt.id, 'approved'); addToast("You're going! 🎉", 'success'); }}
            onDecline={() => { rsvpEvent(evt.id, 'declined'); addToast('RSVP declined', ''); }}
          />
        ))}
      </div>

      {selected && (
        <EventDetailModal event={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

function InviteCard({ event, myStatus, onView, onAccept, onDecline }) {
  const cover = event.cover || {};
  const hasImg = cover.type === 'image' || event.img;
  const bgStyle = !hasImg
    ? { background: cover.type === 'gradient' ? cover.value : cover.bg || event.invBg || 'var(--indigo)' }
    : {};

  const approvedCount = event.guests?.filter(g => g.s === 'approved').length || 0;
  const isPotluck = !!event.potluck;
  const myPotluckItems = event.potluck?.items?.filter(it => it.claimedBy === 'u1') || [];

  return (
    <div className="invite-card">
      <div className="invite-banner" style={bgStyle}>
        {hasImg && <img src={cover.value || event.img} alt={event.title} />}
        {!hasImg && cover.type === 'emoji' && (
          <div className="invite-banner-emoji">{cover.emoji}</div>
        )}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end',
          padding: '12px 16px',
          background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 70%)',
        }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            {event.invH || event.title}
          </div>
        </div>
      </div>

      <div className="invite-body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="invite-title">{event.title}</div>
            <div className="invite-meta">
              <span>📅 {fmtDate(event.date)}</span>
              <span>🕖 {fmtTime(event.time)}</span>
              <span>📍 {event.loc}</span>
              <span>👤 Hosted by {event.host}</span>
              <span>👥 {approvedCount} attending</span>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            {myStatus === 'approved' && <span className="chip chip-teal">✓ Going</span>}
            {myStatus === 'declined' && <span className="chip chip-coral">✕ Declined</span>}
            {myStatus === 'pending' && <span className="chip chip-amber">⏳ Pending</span>}
          </div>
        </div>

        {isPotluck && myStatus === 'approved' && (
          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: 'linear-gradient(90deg, var(--amber-light), #FFF9F0)',
            borderRadius: 10, border: '1px solid #FFD080',
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#7A5000', marginBottom: 4 }}>
              🥘 It's a potluck!
            </div>
            {myPotluckItems.length > 0 ? (
              <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                You're bringing: {myPotluckItems.map(it => `${it.emoji} ${it.name}`).join(', ')}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                You haven't claimed a dish yet.{' '}
                <button style={{ background: 'none', border: 'none', color: 'var(--indigo)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }} onClick={onView}>
                  Pick your item →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="invite-actions">
        <button className="btn btn-ghost btn-sm" onClick={onView}>View Details</button>
        {myStatus === 'pending' && (
          <>
            <button className="btn btn-primary btn-sm" onClick={onAccept}>✓ Accept</button>
            <button className="btn btn-ghost btn-sm" onClick={onDecline} style={{ color: 'var(--coral)' }}>✕ Decline</button>
          </>
        )}
        {myStatus === 'approved' && isPotluck && (
          <button className="btn btn-primary btn-sm" onClick={onView}>
            {myPotluckItems.length ? '✏️ Update Dish' : '🥘 Add Your Dish'}
          </button>
        )}
      </div>
    </div>
  );
}
