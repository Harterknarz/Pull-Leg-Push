import { useEffect, useMemo, useState } from 'react';
import type { Day, ExerciseDef, SetEntry } from '../types';
import { CUSTOM_VALUE, DELOAD_THRESHOLD, PLAN } from '../data/plan';
import { useAuth } from '../lib/auth';
import { useDayMeta } from '../hooks/useDayMeta';
import { useExerciseSummaries } from '../hooks/useExerciseSummaries';
import { ExerciseCard, emptySets } from './ExerciseCard';
import { supabase } from '../lib/supabase';

interface Props {
  day: Day;
}

interface SlotView {
  slotId: string;
  isRotation: boolean;
  pool: ExerciseDef[];
  selectedId: string;
  exercise: ExerciseDef;
}

function resolveSlot(day: Day, slotId: string, isRotation: boolean, savedPick: string | undefined, customName: string): SlotView {
  const pool = isRotation ? PLAN[day].rotationPool : PLAN[day].fixedSlots.find((s) => s.id === slotId)!.pool;
  const selectedId = savedPick || pool[0].id;
  let exercise: ExerciseDef;
  if (selectedId === CUSTOM_VALUE) {
    exercise = { id: `${slotId}_custom`, name: customName || 'Eigene Übung', sets: 3, reps: '8–12' };
  } else {
    exercise = pool.find((e) => e.id === selectedId) ?? pool[0];
  }
  return { slotId, isRotation, pool, selectedId, exercise };
}

export function DayPanel({ day }: Props) {
  const { session } = useAuth();
  const userId = session!.user.id;
  const { meta, persist: persistMeta } = useDayMeta(userId, day);

  const slots: SlotView[] = useMemo(() => {
    const fixed = PLAN[day].fixedSlots.map((s) =>
      resolveSlot(day, s.id, false, meta.slot_picks[s.id], meta.custom_names[s.id] || ''),
    );
    const rotation = Array.from({ length: PLAN[day].rotationSlots }, (_, i) => {
      const slotId = `${day}_r${i}`;
      return resolveSlot(day, slotId, true, meta.slot_picks[slotId], meta.custom_names[slotId] || '');
    });
    return [...fixed, ...rotation];
  }, [day, meta]);

  const exerciseIds = useMemo(() => slots.map((s) => s.exercise.id), [slots]);
  const { summaries, reload: reloadSummaries } = useExerciseSummaries(userId, exerciseIds);

  const [draftSets, setDraftSets] = useState<Record<string, SetEntry[]>>({});
  const [activeIdx, setActiveIdx] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftSets({});
    setActiveIdx({});
    setNotes('');
  }, [day]);

  function getSets(ex: ExerciseDef): SetEntry[] {
    return draftSets[ex.id] ?? emptySets(ex.sets);
  }
  function getActive(exId: string): number {
    return activeIdx[exId] ?? 0;
  }

  async function handleSlotChange(slot: SlotView, newExId: string) {
    const nextPicks = { ...meta.slot_picks, [slot.slotId]: newExId };
    await persistMeta({ slot_picks: nextPicks });
  }
  async function handleCustomNameChange(slot: SlotView, name: string) {
    const nextNames = { ...meta.custom_names, [slot.slotId]: name };
    await persistMeta({ custom_names: nextNames });
  }

  async function handleSave() {
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);

    const loggedExercises = slots
      .map((s) => ({ slot: s, sets: getSets(s.exercise) }))
      .filter(({ sets }) => sets.some((s) => s.weight !== ''));

    if (loggedExercises.length === 0) {
      setSaving(false);
      return;
    }

    const { data: existing } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('day', day)
      .eq('session_date', today)
      .maybeSingle();

    let sessionId = existing?.id as string | undefined;
    if (sessionId) {
      await supabase.from('workout_sessions').update({ notes }).eq('id', sessionId);
      await supabase.from('workout_sets').delete().eq('session_id', sessionId);
    } else {
      const { data: created } = await supabase
        .from('workout_sessions')
        .insert({ user_id: userId, day, session_date: today, notes })
        .select('id')
        .single();
      sessionId = created!.id;
    }

    const rows = loggedExercises.flatMap(({ slot, sets }) =>
      sets.map((s, i) => ({
        session_id: sessionId,
        exercise_id: slot.exercise.id,
        exercise_name: slot.exercise.name,
        set_index: i,
        weight: s.weight === '' ? null : s.weight,
        reps: s.reps === '' ? null : s.reps,
        rpe: s.rpe === '' ? null : s.rpe,
      })),
    );
    await supabase.from('workout_sets').insert(rows);

    for (const { slot, sets } of loggedExercises) {
      const weights = sets.map((s) => s.weight).filter((w): w is number => w !== '');
      if (weights.length === 0) continue;
      const maxWeight = Math.max(...weights);
      const prevPr = summaries[slot.exercise.id]?.prWeight ?? 0;
      if (maxWeight > prevPr) {
        await supabase.from('personal_records').upsert({
          user_id: userId, exercise_id: slot.exercise.id, weight: maxWeight, achieved_at: today,
        });
      }
    }

    await persistMeta({ session_count: (meta.session_count || 0) + 1 });
    await reloadSummaries();
    setDraftSets({});
    setSaving(false);
  }

  function handleReset() {
    setDraftSets({});
    setActiveIdx({});
  }

  async function handleDeloadAck() {
    await persistMeta({ session_count: 0 });
  }

  const showDeload = (meta.session_count || 0) >= DELOAD_THRESHOLD;

  return (
    <section className="day-panel">
      <div className={`plate-strip ${day}`} />

      {showDeload && (
        <div className="deload-banner" style={deloadStyle}>
          <span>{meta.session_count} Einheiten ohne Deload — Zeit für eine leichtere Woche (z.B. -40% Gewicht, gleiche Sätze).</span>
          <button onClick={handleDeloadAck} style={deloadBtnStyle}>Deload erledigt</button>
        </div>
      )}

      <div className="section-label">Feste Übungen</div>
      {slots.filter((s) => !s.isRotation).map((slot) => (
        <ExerciseCard
          key={slot.slotId}
          day={day}
          isRotation={false}
          pool={slot.pool}
          selectedId={slot.selectedId}
          customName={meta.custom_names[slot.slotId] || ''}
          onSelectChange={(id) => handleSlotChange(slot, id)}
          onCustomNameChange={(name) => handleCustomNameChange(slot, name)}
          exercise={slot.exercise}
          sets={getSets(slot.exercise)}
          activeIdx={getActive(slot.exercise.id)}
          onSetsChange={(sets) => setDraftSets((d) => ({ ...d, [slot.exercise.id]: sets }))}
          onActiveChange={(idx) => setActiveIdx((a) => ({ ...a, [slot.exercise.id]: idx }))}
          summary={summaries[slot.exercise.id]}
        />
      ))}

      <div className="section-label">Rotation (Abwechslung)</div>
      {slots.filter((s) => s.isRotation).map((slot) => (
        <ExerciseCard
          key={slot.slotId}
          day={day}
          isRotation={true}
          pool={slot.pool}
          selectedId={slot.selectedId}
          customName={meta.custom_names[slot.slotId] || ''}
          onSelectChange={(id) => handleSlotChange(slot, id)}
          onCustomNameChange={(name) => handleCustomNameChange(slot, name)}
          exercise={slot.exercise}
          sets={getSets(slot.exercise)}
          activeIdx={getActive(slot.exercise.id)}
          onSetsChange={(sets) => setDraftSets((d) => ({ ...d, [slot.exercise.id]: sets }))}
          onActiveChange={(idx) => setActiveIdx((a) => ({ ...a, [slot.exercise.id]: idx }))}
          summary={summaries[slot.exercise.id]}
        />
      ))}

      <textarea
        className="notes"
        placeholder="Notizen zur Einheit (z.B. Schulter zwickte, Form gut...)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={notesStyle}
      />

      <div className="footer-actions" style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={handleReset} style={btnStyle}>Werte zurücksetzen</button>
        <button onClick={handleSave} disabled={saving} style={{ ...btnStyle, ...primaryBtnStyle(day) }}>
          {saving ? 'Speichert…' : 'Einheit speichern'}
        </button>
      </div>

      <p className="note" style={{ fontSize: 11 }}>
        Änderungen an Übungsauswahl werden sofort gespeichert. Sätze/Gewichte erst beim Klick auf "Einheit speichern".
      </p>
    </section>
  );
}

const deloadStyle: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10,
  background: 'rgba(217,164,65,0.1)', border: '1px solid rgba(217,164,65,0.4)', color: 'var(--gold)',
  fontSize: 13, padding: '12px 14px', borderRadius: 8, marginBottom: 14, lineHeight: 1.4,
};
const deloadBtnStyle: React.CSSProperties = {
  background: 'transparent', border: '1px solid rgba(217,164,65,0.5)', color: 'var(--gold)',
  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, textTransform: 'uppercase', padding: '9px 14px',
  borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap',
};
const notesStyle: React.CSSProperties = {
  width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--text)',
  borderRadius: 8, padding: 12, fontFamily: 'Inter, sans-serif', fontSize: 13.5, resize: 'vertical',
  minHeight: 64, marginTop: 14,
};
const btnStyle: React.CSSProperties = {
  flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, letterSpacing: '0.05em',
  textTransform: 'uppercase', padding: '15px 12px', borderRadius: 8, border: '1px solid var(--line)',
  background: 'var(--panel)', color: 'var(--text-dim)', cursor: 'pointer',
};
function primaryBtnStyle(day: Day): React.CSSProperties {
  const bg = day === 'mon' ? 'var(--push)' : day === 'wed' ? 'var(--leg)' : 'var(--pull)';
  return { background: bg, color: '#0e0d10', fontWeight: 700, border: 'none' };
}
