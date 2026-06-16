import { formatScore, scoreColor } from '../lib/scoring.js';

export default function PlayerScoresPanel({ leaderboard }) {
  if (!leaderboard.length) {
    return (
      <div className="text-center py-20 text-white/40">
        <p className="font-serif text-usopen-gold text-2xl mb-3">Scores Unavailable</p>
        <p className="text-sm">Live scores will appear here once the tournament begins.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl text-usopen-gold">Field Scores</h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-usopen-navy/70 border-b border-usopen-gold/30">
              <th className="py-3 px-4 text-left text-usopen-gold font-semibold w-12">Pos</th>
              <th className="py-3 px-4 text-left text-usopen-gold font-semibold">Player</th>
              <th className="py-3 px-3 text-center text-usopen-gold font-semibold">Score</th>
              <th className="py-3 px-3 text-center text-usopen-gold font-semibold">Thru</th>
              <th className="py-3 px-3 text-center text-usopen-gold font-semibold">R1</th>
              <th className="py-3 px-3 text-center text-usopen-gold font-semibold">R2</th>
              <th className="py-3 px-3 text-center text-usopen-gold font-semibold">R3</th>
              <th className="py-3 px-3 text-center text-usopen-gold font-semibold">R4</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((p, i) => {
              const missed = p.status === 'cut' || p.status === 'mc';
              const wd = p.status === 'wd' || p.status === 'dq';
              return (
                <tr
                  key={p.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    missed || wd ? 'opacity-50' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-white/50">
                    {p.tied ? 'T' : ''}{p.position}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">
                    {p.name}
                    {missed && <span className="ml-2 text-xs text-red-400">MC</span>}
                    {wd && <span className="ml-2 text-xs text-red-400 uppercase">{p.status}</span>}
                  </td>
                  <td className={`py-3 px-3 text-center font-bold ${scoreColor(p.score, missed)}`}>
                    {formatScore(p.score)}
                  </td>
                  <td className="py-3 px-3 text-center text-white/40 text-xs">
                    {missed ? 'MC' : p.thru === 18 ? 'F' : p.thru != null ? p.thru : '-'}
                  </td>
                  {[0, 1, 2, 3].map(r => (
                    <td key={r} className="py-3 px-3 text-center text-white/50 text-xs">
                      {p.rounds?.[r]?.strokes ?? '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
