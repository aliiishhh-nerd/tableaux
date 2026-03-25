export function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function fmtDateLong(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function isEventEnded(event) {
  if (event.isEnded) return true;
  const evtDate = new Date(`${event.date}T${event.time || '23:59'}:00`);
  return evtDate < new Date();
}

export function getEventYear(event) {
  return new Date(event.date + 'T12:00:00').getFullYear();
}

export function getEventMonthsAgo(event) {
  const evtDate = new Date(event.date + 'T12:00:00');
  const now = new Date();
  const months = (now.getFullYear() - evtDate.getFullYear()) * 12 + (now.getMonth() - evtDate.getMonth());
  return months;
}

export function avatarColor(str) {
  const colors = ['indigo', 'coral', 'amber', 'teal', 'sage', 'gold'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
