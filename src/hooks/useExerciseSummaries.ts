import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ExerciseSummary, SetEntry } from '../types';

interface RpcRow {
  exercise_id: string;
  latest_sets: { set_index: number; weight: number | null; reps: number | null; rpe: number | null }[];
  history: { date: string; max_weight: number }[];
  pr_weight: number | null;
}

export function useExerciseSummaries(userId: string, exerciseIds: string[]) {
  const [summaries, setSummaries] = useState<Record<string, ExerciseSummary>>({});
  const [loading, setLoading] = useState(true);

  const key = exerciseIds.slice().sort().join(',');

  const reload = useCallback(async () => {
    if (exerciseIds.length === 0) {
      setSummaries({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc('get_exercise_summaries', {
      p_user_id: userId,
      p_exercise_ids: exerciseIds,
    });
    if (!error && data) {
      const map: Record<string, ExerciseSummary> = {};
      for (const row of data as RpcRow[]) {
        const latestSets = row.latest_sets.length
          ? row.latest_sets
              .sort((a, b) => a.set_index - b.set_index)
              .map((s): SetEntry => ({ weight: s.weight ?? '', reps: s.reps ?? '', rpe: s.rpe ?? '' }))
          : null;
        map[row.exercise_id] = {
          exerciseId: row.exercise_id,
          latestSets,
          history: row.history,
          prWeight: row.pr_weight,
        };
      }
      setSummaries(map);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, key]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { summaries, loading, reload };
}
