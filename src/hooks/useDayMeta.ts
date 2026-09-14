import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Day, DayMeta } from '../types';

function emptyMeta(userId: string, day: Day): DayMeta {
  return { user_id: userId, day, slot_picks: {}, custom_names: {}, session_count: 0 };
}

export function useDayMeta(userId: string, day: Day) {
  const [meta, setMeta] = useState<DayMeta>(() => emptyMeta(userId, day));
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('day_meta')
      .select('*')
      .eq('user_id', userId)
      .eq('day', day)
      .maybeSingle();
    setMeta(data ? (data as DayMeta) : emptyMeta(userId, day));
    setLoading(false);
  }, [userId, day]);

  useEffect(() => {
    reload();
  }, [reload]);

  const persist = useCallback(
    async (patch: Partial<Pick<DayMeta, 'slot_picks' | 'custom_names' | 'session_count'>>) => {
      const next = { ...meta, ...patch };
      setMeta(next);
      await supabase.from('day_meta').upsert(next);
    },
    [meta, userId, day],
  );

  return { meta, loading, persist, reload };
}
