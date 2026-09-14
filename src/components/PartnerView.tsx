import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { DAY_LABEL } from '../data/plan';
import type { Day } from '../types';

interface SetRow {
  exercise_name: string;
  set_index: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
}

interface SessionRow {
  id: string;
  day: Day;
  session_date: string;
  notes: string | null;
  workout_sets: SetRow[];
}

interface PrRow {
  exercise_id: string;
  weight: number;
  achieved_at: string;
}

export function PartnerView() {
  const { session } = useAuth();
  const userId = session!.user.id;
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [prs, setPrs] = useState<PrRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: partner } = await supabase
        .from('profiles')
        .select('id, display_name')
        .neq('id', userId)
        .maybeSingle();

      if (!partner) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPartnerId(partner.id);
      setPartnerName(partner.display_name);

      const [{ data: sess }, { data: prData }] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id, day, session_date, notes, workout_sets(exercise_name, set_index, weight, reps, rpe)')
          .eq('user_id', partner.id)
          .order('session_date', { ascending: false })
          .limit(8),
        supabase
          .from('personal_records')
          .select('exercise_id, weight, achieved_at')
          .eq('user_id', partner.id)
          .order('achieved_at', { ascending: false })
          .limit(10),
      ]);
      setSessions((sess as SessionRow[]) ?? []);
      setPrs((prData as PrRow[]) ?? []);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <div className="card">Lädt…</div>;
  if (notFound || !partnerId) {
    return <div className="card">Dein Trainingspartner hat sich noch nicht eingeloggt — sobald er/sie sich einmal einloggt, siehst du hier den Verlauf.</div>;
  }

  return (
    <section className="day-panel">
      <div className="section-label">{partnerName} · Letzte Einheiten</div>
      {sessions.length === 0 && <div className="card">Noch keine Einheiten geloggt.</div>}
      {sessions.map((s) => {
        const byExercise = new Map<string, SetRow[]>();
        for (const row of s.workout_sets) {
          const list = byExercise.get(row.exercise_name) ?? [];
          list.push(row);
          byExercise.set(row.exercise_name, list);
        }
        return (
          <div className="card" key={s.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{DAY_LABEL[s.day].name}</strong>
              <span style={{ color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{s.session_date}</span>
            </div>
            {[...byExercise.entries()].map(([name, sets]) => (
              <div key={name} style={{ fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-dim)' }}>{name}:</span>{' '}
                {sets
                  .sort((a, b) => a.set_index - b.set_index)
                  .filter((s) => s.weight != null)
                  .map((s) => `${s.weight}kg×${s.reps ?? '?'}`)
                  .join(', ')}
              </div>
            ))}
            {s.notes && <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>{s.notes}</div>}
          </div>
        );
      })}

      <div className="section-label">Persönliche Bestleistungen</div>
      {prs.length === 0 ? (
        <div className="card">Noch keine PRs.</div>
      ) : (
        <div className="card">
          {prs.map((pr) => (
            <div key={pr.exercise_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <span>{pr.exercise_id}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>🏆 {pr.weight}kg</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
