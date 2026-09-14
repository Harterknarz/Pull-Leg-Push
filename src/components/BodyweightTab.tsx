import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Sparkline } from './Sparkline';

interface Entry {
  id: string;
  log_date: string;
  kg: number;
}

export function BodyweightTab() {
  const { session } = useAuth();
  const userId = session!.user.id;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('bodyweight_logs')
      .select('id, log_date, kg')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(30);
    setEntries((data as Entry[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    const kg = Math.max(0, parseFloat(input) || 0);
    if (!kg) return;
    await supabase.from('bodyweight_logs').insert({
      user_id: userId,
      log_date: new Date().toISOString().slice(0, 10),
      kg,
    });
    setInput('');
    await load();
  }

  const sparkPoints = entries.slice(0, 12).reverse().map((e) => e.kg);

  return (
    <section className="day-panel">
      <div className="plate-strip body" />
      <div className="section-label">Körpergewicht loggen</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="number" step={0.1} min={0} placeholder="z.B. 82.4" value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, background: '#141317', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 14 }}
        />
        <button
          onClick={handleAdd}
          style={{ background: 'var(--body-c)', border: 'none', color: '#1a1608', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', padding: '0 16px', borderRadius: 6, cursor: 'pointer' }}
        >
          Eintragen
        </button>
      </div>

      <div className="spark-wrap">
        <Sparkline points={sparkPoints} colorVar="--body-c" />
      </div>

      <div style={{ marginTop: 14 }}>
        {loading ? null : entries.length === 0 ? (
          <div className="bw-empty" style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            Noch keine Einträge. Trag dein aktuelles Gewicht oben ein.
          </div>
        ) : (
          entries.slice(0, 10).map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 2px', borderBottom: '1px solid var(--line)', fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
              <span style={{ color: 'var(--text-dim)' }}>{e.log_date}</span>
              <span>{e.kg} kg</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
