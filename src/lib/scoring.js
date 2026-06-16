const MISSED_CUT_SCORE = 20;
const MISSED_CUT_STATUSES = new Set(['cut', 'mc', 'wd', 'dq', 'dns']);

export function formatScore(score) {
  if (score === null || score === undefined) return '-';
  if (score === 0) return 'E';
  return score > 0 ? `+${score}` : `${score}`;
}

export function scoreColor(score, isMissedCut = false) {
  if (isMissedCut) return 'text-red-400';
  if (score < 0) return 'text-green-400';
  if (score > 0) return 'text-red-300';
  return 'text-white';
}

export function normalizePlayerName(name) {
  return (name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findPlayerInLeaderboard(golferName, leaderboard) {
  if (!leaderboard?.length) return null;
  const target = normalizePlayerName(golferName);

  const exact = leaderboard.find(p => normalizePlayerName(p.name) === target);
  if (exact) return exact;

  const lastName = target.split(' ').slice(-1)[0];
  return leaderboard.find(p => normalizePlayerName(p.name).endsWith(lastName)) ?? null;
}

export function isMissedCut(player) {
  if (!player) return false;
  return MISSED_CUT_STATUSES.has(player.status?.toLowerCase() ?? '');
}

export function calculateParticipantScore(golfers, leaderboard) {
  const scores = golfers.map(golferName => {
    const player = findPlayerInLeaderboard(golferName, leaderboard);
    const missed = isMissedCut(player);
    const notStarted = !player && leaderboard.length > 0 ? true : !player;

    let scoreValue = 0;
    let display = '-';

    if (missed) {
      scoreValue = MISSED_CUT_SCORE;
      display = 'MC';
    } else if (player) {
      scoreValue = typeof player.score === 'number' ? player.score : 0;
      display = formatScore(scoreValue);
    }

    return {
      name: golferName,
      score: scoreValue,
      display,
      position: player?.position ?? '-',
      status: player?.status ?? (notStarted ? 'pre' : 'active'),
      thru: player?.thru ?? null,
      rounds: player?.rounds ?? [],
      isMissedCut: missed,
      notStarted,
      counts: false,
    };
  });

  const indexed = scores.map((s, i) => ({ score: s.score, idx: i }));
  indexed.sort((a, b) => a.score - b.score);
  const countingSet = new Set(indexed.slice(0, 3).map(s => s.idx));
  const total = indexed.slice(0, 3).reduce((sum, s) => sum + s.score, 0);

  return {
    scores: scores.map((s, i) => ({ ...s, counts: countingSet.has(i) })),
    total,
  };
}

export function rankParticipants(sorted) {
  let rank = 1;
  return sorted.map((p, i) => {
    if (i > 0 && p.total !== sorted[i - 1].total) rank = i + 1;
    const prevSame = i > 0 && p.total === sorted[i - 1].total;
    const nextSame = i < sorted.length - 1 && p.total === sorted[i + 1].total;
    return { ...p, rank, tied: prevSame || nextSame };
  });
}
