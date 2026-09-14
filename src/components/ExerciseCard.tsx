import { useState } from 'react';
import type { Day, ExerciseDef, ExerciseSummary, SetEntry } from '../types';
import { CUSTOM_VALUE } from '../data/plan';
import { platesLabel } from '../lib/plates';
import { Sparkline } from './Sparkline';

const DAY_COLOR_VAR: Record<Day, string> = { mon: '--pull', wed: '--leg', fri: '--push' };

function emptySets(count: number): SetEntry[] {
  return Array.from({ length: count }, () => ({ weight: '', reps: '', rpe: '' }));
}

interface Props {
  day: Day;
  isRotation: boolean;
  pool: ExerciseDef[];
  selectedId: string;
  customName: string;
  onSelectChange: (exId: string) => void;
  onCustomNameChange: (name: string) => void;
  exercise: ExerciseDef;
  sets: SetEntry[];
  activeIdx: number;
  onSetsChange: (sets: SetEntry[]) => void;
  onActiveChange: (idx: number) => void;
  summary: ExerciseSummary | undefined;
}

export function ExerciseCard({
  day, isRotation, pool, selectedId, customName, onSelectChange, onCustomNameChange,
  exercise, sets, activeIdx, onSetsChange, onActiveChange, summary,
}: Props) {
  const [showPlates, setShowPlates] = useState(false);
  const colorVar = DAY_COLOR_VAR[day];
  const activeSet = sets[activeIdx] ?? { weight: '', reps: '', rpe: '' };
  const lastSet = summary?.latestSets?.[activeIdx] ?? null;

  function updateField(field: keyof SetEntry, raw: string) {
    const next = sets.slice();
    if (raw === '') {
      next[activeIdx] = { ...next[activeIdx], [field]: '' };
    } else if (field === 'rpe') {
      next[activeIdx] = { ...next[activeIdx], rpe: Math.min(10, Math.max(1, parseFloat(raw) || 1)) };
    } else if (field === 'reps') {
      next[activeIdx] = { ...next[activeIdx], reps: Math.max(0, parseInt(raw, 10) || 0) };
    } else {
      next[activeIdx] = { ...next[activeIdx], weight: Math.max(0, parseFloat(raw) || 0) };
    }
    onSetsChange(next);
  }

  const history = (summary?.history ?? []).map((h) => h.max_weight);

  return (
    <div className={`card ${isRotation ? 'rotation' : ''}`}>
      <select
        className="rot-select"
        value={selectedId}
        onChange={(e) => onSelectChange(e.target.value)}
        style={selectStyle}
      >
        {pool.map((ex) => (
          <option key={ex.id} value={ex.id}>{ex.name} — {ex.sets}×{ex.reps}</option>
        ))}
        <option value={CUSTOM_VALUE}>+ Eigene Übung…</option>
      </select>

      {selectedId === CUSTOM_VALUE && (
        <input
          type="text"
          className="custom-name"
          placeholder="Name der Übung…"
          value={customName}
          onChange={(e) => onCustomNameChange(e.target.value)}
          style={inputStyle}
        />
      )}

      <div className="ex-target">Ziel: {exercise.sets} × {exercise.reps}</div>

      <div className="badge-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {lastSet && lastSet.weight !== '' ? (
          <span className="last-badge" style={badgeStyle}>
            Letztes Mal Satz {activeIdx + 1}: <b>{lastSet.weight}kg{lastSet.reps !== '' ? ` × ${lastSet.reps}` : ''}</b>
          </span>
        ) : (
          <span className="last-badge" style={badgeStyle}>Satz {activeIdx + 1}: Erstes Mal</span>
        )}
        {summary?.prWeight != null && (
          <span className="pr-badge" style={prBadgeStyle}>🏆 PR {summary.prWeight}kg</span>
        )}
      </div>

      <div className="set-tabs" style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {sets.map((s, i) => {
          const isActive = i === activeIdx;
          const isFilled = s.weight !== '';
          return (
            <button
              key={i}
              onClick={() => onActiveChange(i)}
              style={{
                width: 40, height: 40, borderRadius: 8, cursor: 'pointer', flexShrink: 0,
                border: isActive ? `2px solid var(${colorVar})` : '1px solid var(--line)',
                background: isActive ? `var(${colorVar})` : 'transparent',
                color: isActive ? '#0e0d10' : isFilled ? 'var(--text)' : 'var(--text-dim)',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: isActive ? 700 : 400,
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="row" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <div className="field">
          <label style={labelStyle}>KG</label>
          <input
            type="number" step={2.5} min={0} inputMode="decimal"
            placeholder={lastSet?.weight ? String(lastSet.weight) : '—'}
            value={activeSet.weight}
            onChange={(e) => updateField('weight', e.target.value)}
            style={numInputStyle}
          />
        </div>
        <div className="field">
          <label style={labelStyle}>Wdh</label>
          <input
            type="number" step={1} min={0} inputMode="numeric"
            placeholder={lastSet?.reps !== '' && lastSet?.reps != null ? String(lastSet.reps) : '—'}
            value={activeSet.reps}
            onChange={(e) => updateField('reps', e.target.value)}
            style={numInputStyle}
          />
        </div>
        <div className="field">
          <label style={labelStyle} title="Rate of Perceived Exertion: 1 (locker) bis 10 (Maximalanstrengung)">RPE</label>
          <input
            type="number" step={0.5} min={1} max={10} inputMode="decimal"
            placeholder="1–10"
            value={activeSet.rpe}
            onChange={(e) => updateField('rpe', e.target.value)}
            style={numInputStyle}
          />
        </div>
        <button
          onClick={() => setShowPlates((v) => !v)}
          title="Plattenrechner"
          style={plateToggleStyle}
        >
          ⚙
        </button>
      </div>

      {showPlates && (
        <div style={plateResultStyle}>{platesLabel(activeSet.weight)}</div>
      )}

      <div className="spark-wrap" style={{ marginTop: 10 }}>
        <Sparkline points={history} colorVar={colorVar} />
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%', background: '#141317', color: 'var(--text)', border: '1px solid var(--line)',
  borderRadius: 6, padding: '9px 10px', fontFamily: 'Inter, sans-serif', fontSize: 13.5, marginBottom: 10,
};
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#141317', border: '1px solid var(--line)', color: 'var(--text)',
  borderRadius: 6, padding: '9px 10px', fontFamily: 'Inter, sans-serif', fontSize: 13.5, marginBottom: 10,
};
const badgeStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-dim)',
  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', padding: '3px 8px',
  borderRadius: 6, whiteSpace: 'nowrap',
};
const prBadgeStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#1a1608', background: 'var(--gold)',
  padding: '3px 8px', borderRadius: 6, fontWeight: 700, whiteSpace: 'nowrap',
};
const labelStyle: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-dim)' };
const numInputStyle: React.CSSProperties = {
  background: '#141317', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 8,
  padding: '11px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 15, width: 76,
};
const plateToggleStyle: React.CSSProperties = {
  background: 'transparent', border: '1px solid var(--line)', color: 'var(--text-dim)', width: 40, height: 40,
  borderRadius: 8, cursor: 'pointer', fontSize: 16, flexShrink: 0,
};
const plateResultStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-dim)', background: '#141317',
  border: '1px solid var(--line)', borderRadius: 6, padding: '8px 10px', marginTop: 8, width: '100%',
};

export { emptySets };
