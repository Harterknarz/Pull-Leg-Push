import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
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

interface Props {
  userId: string;
  limit?: number;
}

export function SessionList({ userId, limit = 8 }: Props) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('workout_sessions')
        .select('id, day, session_date, notes, workout_sets(exercise_name, set_index, weight, reps, rpe)')
        .eq('user_id', userId)
        .order('session_date', { ascending: false })
        .limit(limit);
      setSessions((data as SessionRow[]) ?? []);
      setLoading(false);
    })();
  }, [userId, limit]);

  if (loading) return <div className="card">Lädt…</div>;
  if (sessions.length === 0) return <div className="card">Noch keine Einheiten geloggt.</div>;

  return (
    <>
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
    </>
  );
}
