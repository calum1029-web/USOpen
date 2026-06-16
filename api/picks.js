import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Picks lock when the US Open begins: June 18, 2026 at 7 AM ET (11:00 UTC)
const LOCK_TIME = new Date('2026-06-18T11:00:00.000Z');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('usopen_picks')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ picks: data });
  }

  if (req.method === 'POST') {
    if (new Date() >= LOCK_TIME) {
      return res.status(403).json({ error: 'Picks are locked — the tournament has begun.' });
    }

    const { participant_name, golfer1, golfer2, golfer3, golfer4 } = req.body ?? {};
    if (!participant_name?.trim() || !golfer1 || !golfer2 || !golfer3 || !golfer4) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const { data, error } = await supabase
      .from('usopen_picks')
      .upsert(
        { participant_name: participant_name.trim(), golfer1, golfer2, golfer3, golfer4 },
        { onConflict: 'participant_name' }
      )
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ pick: data });
  }

  if (req.method === 'DELETE') {
    if (new Date() >= LOCK_TIME) {
      return res.status(403).json({ error: 'Picks are locked — cannot remove entries.' });
    }

    const { participant_name } = req.body ?? {};
    if (!participant_name?.trim()) {
      return res.status(400).json({ error: 'participant_name is required.' });
    }

    const { error } = await supabase
      .from('usopen_picks')
      .delete()
      .eq('participant_name', participant_name.trim());

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
