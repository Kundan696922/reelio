export function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'TBA';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRating(vote) {
  if (!vote) return '—';
  return vote.toFixed(1);
}

export function genreNames(genreIds = [], genreMap = {}) {
  return genreIds
    .map((id) => genreMap[id])
    .filter(Boolean)
    .slice(0, 3);
}
