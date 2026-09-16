import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { SessionList } from './SessionList';
import { WeightChart } from './WeightChart';
import type { HistoryPoint } from '../types';

interface ExerciseOption {
  exercise_id: string;
  exercise_name: string;
}

export function HistoryTab() {
  const { session } = useAuth();
  const userId = session!.user.id;

  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc('get_logged_exercises', { p_user_id: userId });
      const rows = (data as ExerciseOption[]) ?? [];
      setExercises(rows);
      if (rows.length > 0) setSelected(rows[0].exercise_id);
    })();
  }, [userId]);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      setLoadingChart(true);
      const { data } = await supabase.rpc('get_exercise_history', { p_user_id: userId, p_exercise_id: selected });
      setHistory((data as { session_date: string; max_weight: number }[] ?? []).map((r) => ({ date: r.session_date, max_weight: r.max_weight })));
      setLoadingChart(false);
    })();
  }, [userId, selected]);

  return (
    <section className="day-panel">
      <div className="section-label">Gewichtsverlauf</div>

      {exercises.length === 0 ? (
        <div className="card">Noch keine Übung geloggt — sobald du eine Einheit speicherst, kannst du hier den Fortschritt sehen.</div>
      ) : (
        <div className="card">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{
              width: '100%', background: '#141317', color: 'var(--text)', border: '1px solid var(--line)',
              borderRadius: 6, padding: '9px 10px', fontFamily: 'Inter, sans-serif', fontSize: 13.5, marginBottom: 14,
            }}
          >
            {exercises.map((ex) => (
              <option key={ex.exercise_id} value={ex.exercise_id}>{ex.exercise_name}</option>
            ))}
          </select>
          {loadingChart ? <div className="spark-empty">Lädt…</div> : <WeightChart points={history} />}
        </div>
      )}

      <div className="section-label">Meine letzten Einheiten</div>
      <SessionList userId={userId} limit={10} allowDelete />
    </section>
  );
}
