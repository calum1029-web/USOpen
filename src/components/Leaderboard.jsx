import { useMemo } from 'react';
import {
  calculateParticipantScore,
  rankParticipants,
  formatScore,
  scoreColor,
} from '../lib/scoring.js';

export default function Leaderboard({ picks, leaderboard, tournament }) {
  const ranked = useMemo(() => {
    if (!picks.length) return [];
    const withScores = picks.map(pick => {
      const golfers = [pick.golfer1, pick.golfer2, pick.golfer3, pick.golfer4];
      const { scores, total } = calculateParticipantScore(golfers, leaderboard);
      return { ...pick, golferScores: scores, total };
    });
    withScores.sort((a, b) => a.total - b.total);
    return rankParticipants(withScores);
  }, [picks, leaderboard]);

  const preTournament = leaderboard.length === 0;

  if (!picks.length) {
    return (
      <div className="text-center py-20 text-white/40">
        <p className="font-serif text-usopen-gold text-2xl mb-3">No Picks Yet</p>
        <p className="text-sm">Be the first to submit your picks!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div className="text-center mb-6">
        {tournament?.name && (
          <p className="text-usopen-gold/60 text-xs tracking-widest uppercase mb-1">
            {tournament.name}
          </p>
        )}
        <h2 className="font-serif text-2xl text-usopen-gold">Pool Standings</h2>
      </div>

      {preTournament && (
        <div className="text-center mb-6 py-3 px-4 bg-white/5 border border-white/10 rounded-lg text-white/40 text-sm">
          Tournament begins June 18 &mdash; scores will appear once play starts
        </div>
      )}

      {/* ── Desktop table (lg+) ── */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-usopen-navy/70 border-b border-usopen-gold/30">
              <th className="py-3 px-4 text-left text-usopen-gold font-semibold w-12">#</th>
              <th className="py-3 px-4 text-left text-usopen-gold font-semibold">Participant</th>
              {['Pick 1', 'Pick 2', 'Pick 3', 'Pick 4'].map(p => (
                <th key={p} className="py-3 px-3 text-center text-usopen-gold font-semibold">{p}</th>
              ))}
              <th className="py-3 px-4 text-right text-usopen-gold font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((p, i) => (
              <tr
                key={p.id}
                className={`border-b border-white/5 transition-colors ${
                  i === 0 && !preTournament ? 'bg-usopen-gold/10' : 'hover:bg-white/5'
                }`}
              >
                <td className="py-4 px-4">
                  <span className={`font-bold text-base ${i === 0 && !preTournament ? 'text-usopen-gold' : 'text-white/40'}`}>
                    {p.tied ? 'T' : ''}{p.rank}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${i === 0 && !preTournament ? 'text-usopen-gold' : 'text-white'}`}>
                      {p.participant_name}
                    </span>
                    {i === 0 && !preTournament && (
                      <span className="text-xs bg-usopen-gold/20 text-usopen-gold px-2 py-0.5 rounded-full font-medium">
                        Leader
                      </span>
                    )}
                  </div>
                </td>

                {p.golferScores.map((gs, j) => (
                  <td
                    key={j}
                    className={`py-4 px-3 text-center ${!gs.counts && !preTournament ? 'opacity-40' : ''}`}
                  >
                    <div className="text-xs text-white/55 mb-0.5 truncate max-w-[120px] mx-auto">
                      {abbreviateName(gs.name)}
                    </div>
                    <div className={`font-bold text-sm ${
                      preTournament || gs.notStarted ? 'text-white/30' : scoreColor(gs.score, gs.isMissedCut)
                    }`}>
                      {preTournament || gs.notStarted ? '-' : gs.display}
                    </div>
                    {!preTournament && gs.thru !== null && !gs.isMissedCut && (
                      <div className="text-xs text-white/25 mt-0.5">{thruLabel(gs)}</div>
                    )}
                    {!preTournament && !gs.counts && (
                      <div className="text-xs text-white/25">dropped</div>
                    )}
                  </td>
                ))}

                <td className="py-4 px-4 text-right">
                  <span className={`text-lg font-bold ${
                    preTournament ? 'text-white/25' : i === 0 ? 'text-usopen-gold' : scoreColor(p.total)
                  }`}>
                    {preTournament ? '-' : formatScore(p.total)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards (< lg) ── */}
      <div className="lg:hidden space-y-3">
        {ranked.map((p, i) => (
          <div
            key={p.id}
            className={`rounded-xl p-4 border ${
              i === 0 && !preTournament
                ? 'bg-usopen-gold/10 border-usopen-gold/40'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${i === 0 && !preTournament ? 'text-usopen-gold' : 'text-white/40'}`}>
                  {p.tied ? 'T' : ''}{p.rank}
                </span>
                <div>
                  <span className={`font-semibold ${i === 0 && !preTournament ? 'text-usopen-gold' : 'text-white'}`}>
                    {p.participant_name}
                  </span>
                  {i === 0 && !preTournament && (
                    <span className="ml-2 text-xs bg-usopen-gold/20 text-usopen-gold px-2 py-0.5 rounded-full">
                      Leader
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-xl font-bold ${
                preTournament ? 'text-white/25' : i === 0 ? 'text-usopen-gold' : scoreColor(p.total)
              }`}>
                {preTournament ? '-' : formatScore(p.total)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {p.golferScores.map((gs, j) => (
                <div
                  key={j}
                  className={`rounded-lg p-2.5 ${gs.counts || preTournament ? 'bg-white/10' : 'bg-white/5 opacity-50'}`}
                >
                  <div className="text-white/55 text-xs truncate mb-1">{gs.name}</div>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className={`font-bold text-sm ${
                      preTournament || gs.notStarted ? 'text-white/30' : scoreColor(gs.score, gs.isMissedCut)
                    }`}>
                      {preTournament || gs.notStarted ? '-' : gs.display}
                    </span>
                    {!gs.counts && !preTournament && (
                      <span className="text-xs text-white/25">(dropped)</span>
                    )}
                  </div>
                  {!preTournament && gs.thru !== null && !gs.isMissedCut && (
                    <div className="text-xs text-white/25 mt-0.5">{thruLabel(gs)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/25 text-center mt-8">
        Best 3 of 4 golfer scores count &middot; Missed cut = +20 &middot; Lower score wins
      </p>
    </div>
  );
}

function abbreviateName(name) {
  const parts = name.trim().split(' ');
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

function thruLabel(gs) {
  const lastRound = gs.rounds?.find(r => !r.complete) ?? gs.rounds?.[gs.rounds.length - 1];
  if (!lastRound) return '';
  if (lastRound.complete) return 'F';
  if (gs.thru != null) return `Thru ${gs.thru}`;
  return '';
}
