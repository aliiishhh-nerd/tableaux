import React, { useState } from 'react';

function pad(n) { return String(n).padStart(2, '0'); }

function toICSDate(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-');
  const [h, min] = (timeStr || '19:00').split(':');
  return y + m + d + 'T' + pad(h) + pad(min) + '00';
}

function escapeICS(str) {
  return (str || '').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function buildICSContent(event) {
  const dtstart = toICSDate(event.date, event.time);
  const [h, m] = (event.time || '19:00').split(':').map(Number);
  const endH = h + 3;
  const dtend = toICSDate(event.date, pad(endH > 23 ? 23 : endH) + ':' + pad(m));
  const uid = 'tableaux-' + event.id + '@tableaux.app';
  const location = event.addr ? event.loc + ', ' + event.addr : event.loc || '';
  const description = (event.desc || '') + (event.addr ? '\\n\\nLocation: ' + event.addr : '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tableaux//Social Dining//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + toICSDate(new Date().toISOString().split('T')[0], new Date().toTimeString().slice(0, 5)),
    'DTSTART:' + dtstart,
    'DTEND:' + dtend,
    'SUMMARY:' + escapeICS(event.title),
    'DESCRIPTION:' + escapeICS(description),
    'LOCATION:' + escapeICS(location),
    'ORGANIZER;CN=' + escapeICS(event.host) + ':MAILTO:host@tableaux.app',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICS(event) {
  const content = buildICSContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(event) {
  const [y, m, d] = event.date.split('-');
  const [h, min] = (event.time || '19:00').split(':').map(Number);
  const endH = h + 3;
  const fmt = (yr, mo, dy, hr, mn) => yr + pad(mo) + pad(dy) + 'T' + pad(hr) + pad(mn) + '00';
  const dates = fmt(y, Number(m), Number(d), h, min) + '/' + fmt(y, Number(m), Number(d), endH > 23 ? 23 : endH, min);
  const location = event.addr ? event.loc + ', ' + event.addr : event.loc || '';
  const params = new URLSearchParams({
    action: 'TEMPLATE', text: event.title, dates,
    details: (event.desc || '') + '\n\nHosted by ' + event.host + '\nJoin at tableaux.app',
    location,
  });
  return 'https://calendar.google.com/calendar/render?' + params.toString();
}

export function outlookCalendarUrl(event) {
  const [y, m, d] = event.date.split('-');
  const [h, min] = (event.time || '19:00').split(':').map(Number);
  const endH = h + 3;
  const startISO = y + '-' + pad(m) + '-' + pad(d) + 'T' + pad(h) + ':' + pad(min) + ':00';
  const endISO   = y + '-' + pad(m) + '-' + pad(d) + 'T' + pad(endH > 23 ? 23 : endH) + ':' + pad(min) + ':00';
  const location = event.addr ? event.loc + ', ' + event.addr : event.loc || '';
  const params = new URLSearchParams({
    path: '/calendar/action/compose', rru: 'addevent',
    startdt: startISO, enddt: endISO,
    subject: event.title,
    body: (event.desc || '') + '\n\nHosted by ' + event.host,
    location,
  });
  return 'https://outlook.live.com/calendar/0/deeplink/compose?' + params.toString();
}

function CalDropItems({ event, onClose }) {
  function handleGoogle() { window.open(googleCalendarUrl(event), '_blank'); onClose?.(); }
  function handleOutlook() { window.open(outlookCalendarUrl(event), '_blank'); onClose?.(); }
  function handleICal() { downloadICS(event); onClose?.(); }
  const items = [
    { icon: '🗓', label: 'Google Calendar',      action: handleGoogle  },
    { icon: '📅', label: 'Apple Calendar (.ics)', action: handleICal   },
    { icon: '📆', label: 'Outlook Calendar',      action: handleOutlook },
  ];
  return (
    <div>
      {items.map(item => (
        <div key={item.label} onClick={item.action}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: 'white' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--page)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CalendarExportButtons({ event, compact = false }) {
  const [open, setOpen] = useState(false);
  if (compact) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button onClick={() => setOpen(v => !v)} className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          📆 Add to Calendar
        </button>
        {open && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r2)', boxShadow: '0 8px 32px rgba(17,20,45,0.12)', zIndex: 50, minWidth: 210, overflow: 'hidden' }}>
            <CalDropItems event={event} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        📆 Add to Calendar
      </div>
      <CalDropItems event={event} />
    </div>
  );
}
