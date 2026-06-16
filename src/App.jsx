import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import PickSubmission from './components/PickSubmission.jsx';
import PlayerScoresPanel from './components/PlayerScoresPanel.jsx';

// Picks lock when the US Open begins: June 18, 2026 at 7 AM ET (11:00 UTC)
const LOCK_TIME = new Date('2026-06-18T11:00:00.000Z');
const REFRESH_MS = 60_000;

export default function App() {
  const [tab, setTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [picks, setPicks] = useState([]);
  const [scoresError, setScoresError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLocked, setIsLocked] = useState(new Date() >= LOCK_TIME);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/scores');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeaderboard(data.leaderboard ?? []);
      setTournament(data.tournament ?? null);
      setLastUpdated(new Date());
      setScoresError(null);
    } catch (err) {
      setScoresError(err.message);
    }
  }, []);

  const fetchPicks = useCallback(async () => {
    try {
      const res = await fetch('/api/picks');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPicks(data.picks ?? []);
    } catch (err) {
      console.error('Failed to fetch picks:', err);
    }
  }, []);

  useEffect(() => {
    fetchScores();
    fetchPicks();
    const interval = setInterval(fetchScores, REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchScores, fetchPicks]);

  useEffect(() => {
    const tick = setInterval(() => setIsLocked(new Date() >= LOCK_TIME), 1000);
    return () => clearInterval(tick);
  }, []);

  const tabs = [
    { id: 'leaderboard', label: 'Pool Leaderboard' },
    { id: 'submit', label: isLocked ? 'Picks Locked' : 'Submit Picks' },
    { id: 'field', label: 'Field Scores' },
  ];

  return (
    <div className="min-h-screen bg-usopen-dark">
      <Header />

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-20 bg-usopen-navy border-b border-usopen-gold/30 shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex overflow-x-auto scrollbar-none">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`shrink-0 px-5 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                  tab === id
                    ? 'text-usopen-gold border-b-2 border-usopen-gold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {lastUpdated && tab !== 'submit' && (
        <div className="text-center py-1.5 text-xs text-white/30 bg-black/20 border-b border-white/5">
          Scores as of {lastUpdated.toLocaleTimeString()} &middot; auto-refreshes every 60s
        </div>
      )}

      {scoresError && tab !== 'submit' && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
            Could not load live scores: {scoresError}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {tab === 'leaderboard' && (
          <Leaderboard picks={picks} leaderboard={leaderboard} tournament={tournament} />
        )}
        {tab === 'submit' && (
          <PickSubmission isLocked={isLocked} lockTime={LOCK_TIME} onPicksSubmitted={fetchPicks} />
        )}
        {tab === 'field' && (
          <PlayerScoresPanel leaderboard={leaderboard} />
        )}
      </main>
    </div>
  );
}
