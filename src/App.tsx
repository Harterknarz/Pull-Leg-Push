import { useState } from 'react';
import { DAY_LABEL } from './data/plan';
import type { Day } from './types';
import { DayPanel } from './components/DayPanel';
import { BodyweightTab } from './components/BodyweightTab';
import { PartnerView } from './components/PartnerView';
import { HistoryTab } from './components/HistoryTab';
import { AuthProvider, useAuth } from './lib/auth';
import { Login } from './components/Login';
import { supabase } from './lib/supabase';

type Tab = Day | 'body' | 'history' | 'partner';

function TrainingApp() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('mon');

  if (loading) {
    return <div className="wrap"><p className="sub">Lädt…</p></div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Ganzkörper Split · 3 Tage</div>
        <h1>Pull / Leg / Push</h1>
        <div className="sub" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Eingeloggt als {session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              background: 'transparent', border: '1px solid var(--line)', color: 'var(--text-dim)',
              borderRadius: 6, padding: '5px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
              cursor: 'pointer', textTransform: 'uppercase',
            }}
          >
            Logout
          </button>
        </div>
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
        <button className={`tab day-partner ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          <span className="day">&nbsp;</span>Verlauf
        </button>
        <button className={`tab day-partner ${tab === 'partner' ? 'active' : ''}`} onClick={() => setTab('partner')}>
          <span className="day">&nbsp;</span>Partner
        </button>
      </nav>

      {tab === 'mon' || tab === 'wed' || tab === 'fri' ? <DayPanel day={tab} key={tab} /> : null}
      {tab === 'body' && <BodyweightTab />}
      {tab === 'history' && <HistoryTab />}
      {tab === 'partner' && <PartnerView />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TrainingApp />
    </AuthProvider>
  );
}

export default App;
