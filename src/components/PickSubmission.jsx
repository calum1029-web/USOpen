import { useState, useEffect } from 'react';
import { USOPEN_FIELD } from '../lib/golfers.js';

export default function PickSubmission({ isLocked, lockTime, onPicksSubmitted }) {
  const [name, setName] = useState('');
  const [golfers, setGolfers] = useState(['', '', '', '']);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteName, setDeleteName] = useState('');
  const [deleteStatus, setDeleteStatus] = useState(null);

  useEffect(() => {
    if (isLocked) return;
    const tick = () => {
      const diff = lockTime - new Date();
      if (diff <= 0) { setCountdown('Picks are now locked'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setCountdown(
        h > 0
          ? `${h}h ${m}m ${s}s until picks lock`
          : m > 0
          ? `${m}m ${s}s until picks lock`
          : `${s}s until picks lock`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isLocked, lockTime]);

  const setGolfer = (i, val) => setGolfers(prev => prev.map((g, j) => j === i ? val : g));

  const available = (idx) =>
    USOPEN_FIELD.filter(g => !golfers.some((sel, i) => i !== idx && sel === g));

  const handleSubmit = async e => {
    e.preventDefault();
    if (golfers.some(g => !g)) {
      setStatus({ ok: false, msg: 'Please select all 4 golfers.' });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_name: name, golfer1: golfers[0], golfer2: golfers[1], golfer3: golfers[2], golfer4: golfers[3] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Unknown error');
      setStatus({ ok: true, msg: `Picks saved for ${name}!` });
      onPicksSubmitted();
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async e => {
    e.preventDefault();
    if (!deleteName.trim()) return;
    setDeleteStatus(null);
    try {
      const res = await fetch('/api/picks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_name: deleteName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Unknown error');
      setDeleteStatus({ ok: true, msg: `Entry for "${deleteName.trim()}" removed.` });
      setDeleteName('');
      onPicksSubmitted();
    } catch (err) {
      setDeleteStatus({ ok: false, msg: err.message });
    }
  };

  if (isLocked) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="font-serif text-2xl text-usopen-gold mb-3">Picks Are Locked</h2>
        <p className="text-white/50 text-sm">
          The US Open has begun. No more entries can be submitted or removed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-usopen-gold mb-2">Submit Your Picks</h2>
        {countdown && (
          <p className="text-usopen-silver/60 text-xs tracking-wide">{countdown}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white/5 border border-white/10 rounded-2xl p-6">
        {/* Name */}
        <div>
          <label className="block text-xs text-usopen-gold/70 uppercase tracking-wider mb-1.5">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-usopen-gold/50 focus:bg-white/15 transition-colors"
          />
        </div>

        {/* Golfer picks */}
        {[0, 1, 2, 3].map(i => (
          <div key={i}>
            <label className="block text-xs text-usopen-gold/70 uppercase tracking-wider mb-1.5">
              Pick {i + 1}
            </label>
            <select
              value={golfers[i]}
              onChange={e => setGolfer(i, e.target.value)}
              required
              className="w-full bg-usopen-dark border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-usopen-gold/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="">— Select a golfer —</option>
              {available(i).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        ))}

        {status && (
          <div className={`text-sm text-center py-2 px-3 rounded-lg ${
            status.ok ? 'bg-green-900/30 text-green-300 border border-green-500/30' : 'bg-red-900/30 text-red-300 border border-red-500/30'
          }`}>
            {status.msg}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-usopen-gold text-usopen-dark font-bold text-sm tracking-wide hover:bg-usopen-gold/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving…' : 'Submit Picks'}
        </button>
      </form>

      {/* Remove entry section */}
      <div className="mt-6">
        <button
          onClick={() => setShowDelete(v => !v)}
          className="w-full text-xs text-white/30 hover:text-white/50 transition-colors py-2"
        >
          {showDelete ? '▲ Hide' : '▼ Remove my entry'}
        </button>

        {showDelete && (
          <form onSubmit={handleDelete} className="mt-3 space-y-3 bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40">Enter the name you used when submitting picks to remove your entry.</p>
            <input
              type="text"
              value={deleteName}
              onChange={e => setDeleteName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-red-400/50 transition-colors text-sm"
            />
            {deleteStatus && (
              <div className={`text-xs text-center py-1.5 px-3 rounded-lg ${
                deleteStatus.ok ? 'bg-green-900/30 text-green-300 border border-green-500/30' : 'bg-red-900/30 text-red-300 border border-red-500/30'
              }`}>
                {deleteStatus.msg}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-red-900/40 text-red-300 border border-red-500/30 text-sm font-medium hover:bg-red-900/60 transition-colors"
            >
              Remove Entry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
