import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  }

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Ganzkörper Split · 3 Tage</div>
        <h1>Pull / Leg / Push</h1>
        <p className="sub">Login per Magic Link — nur für freigeschaltete E-Mails.</p>
      </header>

      <form className="card" onSubmit={handleSubmit} style={{ marginTop: 24 }}>
        <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>
          E-Mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          style={{
            width: '100%', background: '#141317', border: '1px solid var(--line)', color: 'var(--text)',
            borderRadius: 6, padding: '10px 12px', fontFamily: 'Inter, sans-serif', fontSize: 14, marginBottom: 12,
          }}
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            width: '100%', background: 'var(--gold)', border: 'none', color: '#1a1608', fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', fontSize: 13, padding: '13px 0',
            borderRadius: 8, cursor: 'pointer',
          }}
        >
          {status === 'sending' ? 'Sende Link…' : 'Magic Link senden'}
        </button>

        {status === 'sent' && (
          <p style={{ color: 'var(--leg)', fontSize: 13, marginTop: 12 }}>
            Link verschickt — Postfach checken (auch Spam-Ordner).
          </p>
        )}
        {status === 'error' && (
          <p style={{ color: 'var(--push)', fontSize: 13, marginTop: 12 }}>
            {errorMsg || 'Fehler beim Senden.'}
          </p>
        )}
      </form>
    </div>
  );
}
