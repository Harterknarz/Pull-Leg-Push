import type { Day } from '../types';
import { PLAN } from '../data/plan';

interface Props {
  day: Day;
}

// Grundgerüst: zeigt Struktur aus PLAN. Logging/Sätze/Persistenz folgt im nächsten Schritt.
export function DayPanel({ day }: Props) {
  const plan = PLAN[day];

  return (
    <section className="day-panel">
      <div className={`plate-strip ${day}`} />

      <div className="section-label">Feste Übungen</div>
      {plan.fixedSlots.map((slot) => (
        <div className="card" key={slot.id}>
          <strong>{slot.pool[0].name}</strong>
          <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
            {slot.pool.length} Varianten zur Auswahl · Ziel {slot.pool[0].sets} × {slot.pool[0].reps}
          </div>
        </div>
      ))}

      <div className="section-label">Rotation (Abwechslung)</div>
      {Array.from({ length: plan.rotationSlots }).map((_, i) => (
        <div className="card rotation" key={`${day}_r${i}`}>
          <strong>{plan.rotationPool[0].name}</strong>
          <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
            {plan.rotationPool.length} Varianten im Pool
          </div>
        </div>
      ))}
    </section>
  );
}
