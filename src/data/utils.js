export function fmtDate(d) {
  return new Date(d + 'T12:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric',
  });
}

export function tagVis(vis) {
  if (vis === 'Public') return 'tag-teal';
  if (vis === 'Request-only') return 'tag-amber';
  return 'tag-sky';
}

export const AV_COLORS = ['av-indigo', 'av-teal', 'av-coral', 'av-amber', 'av-sky', 'av-pink'];
export function avColor(i) { return AV_COLORS[i % AV_COLORS.length]; }

export function initials(name) {
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

export function nextDate(daysAhead = 14) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}
