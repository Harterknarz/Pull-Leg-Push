import { useState } from 'react';
import { DAY_LABEL } from './data/plan';
import type { Day } from './types';
import { DayPanel } from './components/DayPanel';

type Tab = Day | 'body' | 'partner';

function App() {
  const [tab, setTab] = useState<Tab>('mon');

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Ganzkörper Split · 3 Tage</div>
        <h1>Pull / Leg / Push</h1>
        <p className="sub">Montag Pull · Mittwoch Leg · Freitag Push</p>
      </header>

      <nav className="tabs">
        {(['mon', 'wed', 'fri'] as Day[]).map((d) => (
          <button
            key={d}
            className={`tab day-${d} ${tab === d ? 'active' : ''}`}
            onClick={() => setTab(d)}
          >
            <span className="day">{DAY_LABEL[d].weekday}</span>
            {DAY_LABEL[d].name}
          </button>
        ))}
        <button className={`tab day-body ${tab === 'body' ? 'active' : ''}`} onClick={() => setTab('body')}>
          <span className="day">&nbsp;</span>Body
        </button>
        <button className={`tab day-partner ${tab === 'partner' ? 'active' : ''}`} onClick={() => setTab('partner')}>
          <span className="day">&nbsp;</span>Partner
        </button>
      </nav>

      {tab === 'mon' || tab === 'wed' || tab === 'fri' ? <DayPanel day={tab} /> : null}
      {tab === 'body' && <div className="card">Körpergewicht-Tracking folgt.</div>}
      {tab === 'partner' && <div className="card">Partner-Ansicht (nur lesend) folgt.</div>}

      <p className="note">
        Prototyp wird schrittweise auf Supabase migriert — Übungen, Sätze, RPE, Notizen &amp; Verlauf werden geteilt
        gespeichert, sobald Auth + Logging angebunden sind.
      </p>
    </div>
  );
}

export default App;
