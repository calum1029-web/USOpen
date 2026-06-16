// ESPN Golf API proxy — free, no key required.
// Returns live US Open leaderboard normalised to our app's format.
const ESPN_URL =
  'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  let raw;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(ESPN_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; USOpenPool/1.0)',
      },
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      console.error(`ESPN API ${upstream.status}`);
      return res.status(502).json({ error: `ESPN API returned ${upstream.status}.` });
    }

    raw = await upstream.json();
  } catch (err) {
    console.error('Fetch error:', err.name, err.message);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'ESPN API timed out. Try again shortly.' });
    }
    return res.status(502).json({ error: 'Failed to reach ESPN API.' });
  }

  // Find the US Open — ESPN returns whatever event is current
  const event = raw.events?.find(e => {
    const name = e.name?.toLowerCase() ?? '';
    return name.includes('u.s. open') || name.includes('us open') || name.includes('u.s open');
  });

  if (!event) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json({ tournament: { name: 'U.S. Open Championship' }, leaderboard: [] });
  }

  const tournament = {
    id: event.id,
    name: event.name,
    status: event.status?.type?.description ?? '',
  };

  const competition = event.competitions?.[0];
  const competitors = competition?.competitors ?? [];

  const leaderboard = competitors
    .map(c => {
      const name = c.athlete?.displayName ?? 'Unknown';

      const scoreToPar = c.statistics?.find(s => s.name === 'scoreToPar');
      const score = scoreToPar
        ? parseScore(scoreToPar.displayValue)
        : parseScore(c.score) ?? 0;

      const positionStat = c.statistics?.find(s => s.name === 'position');
      const rawPosition = positionStat?.displayValue ?? c.order;
      const tied = typeof rawPosition === 'string' && rawPosition.startsWith('T');
      const position = tied
        ? parseInt(rawPosition.slice(1), 10)
        : parseInt(rawPosition, 10) || c.order;

      const statusName = c.status?.type?.name ?? '';
      let status = 'active';
      if (statusName.includes('MISSED_CUT')) status = 'cut';
      else if (statusName.includes('WITHDRAWN')) status = 'wd';
      else if (statusName.includes('DISQUALIFIED')) status = 'dq';

      const thruStat = c.statistics?.find(s => s.name === 'thru');
      const thruRaw = thruStat?.displayValue;
      const thru =
        thruRaw === 'F' ? 18
        : thruRaw === '--' || thruRaw == null ? null
        : parseInt(thruRaw, 10) || null;

      const rounds = (c.linescores ?? []).map((ls, i) => ({
        sequence: i + 1,
        score: parseScore(ls.displayValue),
        strokes: ls.value,
        thru: 18,
        complete: true,
      }));

      return { id: c.athlete?.id ?? String(c.order), name, position, tied, score, status, thru, rounds };
    })
    .sort((a, b) => a.position - b.position);

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  return res.json({ tournament, leaderboard });
}

function parseScore(raw) {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === 'E' || trimmed === '--' || trimmed === '') return 0;
    const n = parseInt(trimmed, 10);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}
