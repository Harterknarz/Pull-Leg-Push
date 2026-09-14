import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { SessionList } from './SessionList';

interface PrRow {
  exercise_id: string;
  weight: number;
  achieved_at: string;
}

export function PartnerView() {
  const { session } = useAuth();
  const userId = session!.user.id;
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [prs, setPrs] = useState<PrRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: partner } = await supabase
        .from('profiles')
        .select('id, display_name')
        .neq('id', userId)
        .maybeSingle();

      if (!partner) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPartnerId(partner.id);
      setPartnerName(partner.display_name);

      const { data: prData } = await supabase
        .from('personal_records')
        .select('exercise_id, weight, achieved_at')
        .eq('user_id', partner.id)
        .order('achieved_at', { ascending: false })
        .limit(10);
      setPrs((prData as PrRow[]) ?? []);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <div className="card">Lädt…</div>;
  if (notFound || !partnerId) {
    return <div className="card">Dein Trainingspartner hat sich noch nicht eingeloggt — sobald er/sie sich einmal einloggt, siehst du hier den Verlauf.</div>;
  }

  return (
    <section className="day-panel">
      <div className="section-label">{partnerName} · Letzte Einheiten</div>
      <SessionList userId={partnerId} limit={8} />

      <div className="section-label">Persönliche Bestleistungen</div>
      {prs.length === 0 ? (
        <div className="card">Noch keine PRs.</div>
      ) : (
        <div className="card">
          {prs.map((pr) => (
            <div key={pr.exercise_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <span>{pr.exercise_id}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>🏆 {pr.weight}kg</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
