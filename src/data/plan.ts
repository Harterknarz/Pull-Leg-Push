import type { Day, DayPlan } from '../types';

// Portiert 1:1 aus trainingsplan.html (PLAN-Konstante)
// Hinweis: "mon" enthält jetzt den Push-Plan, "fri" den Pull-Plan (Montag/Freitag getauscht).
// Die Exercise-IDs behalten ihr ursprüngliches mon_/fri_-Präfix als reinen Schlüssel — ohne
// Bedeutung für den Wochentag — damit bestehende DB-Einträge (workout_sets, personal_records)
// weiter zu ihren Übungen passen.
export const PLAN: Record<Day, DayPlan> = {
  mon: {
    fixedSlots: [
      { id: 'fri_f1', pool: [
        { id: 'fri_bankdruecken_lh', name: 'Bankdrücken (Langhantel)', sets: 4, reps: '6–8' },
        { id: 'fri_bankdruecken_kh', name: 'Bankdrücken (Kurzhantel)', sets: 4, reps: '8–10' },
        { id: 'fri_smith_bank', name: 'Smith Machine Bankdrücken', sets: 4, reps: '8–10' },
      ]},
      { id: 'fri_f2', pool: [
        { id: 'fri_schulter_lh', name: 'Schulterdrücken (Langhantel)', sets: 4, reps: '8–10' },
        { id: 'fri_schulter_kh', name: 'Schulterdrücken (Kurzhantel)', sets: 4, reps: '8–10' },
        { id: 'fri_schulter_maschine', name: 'Schulterdrücken Maschine', sets: 4, reps: '10–12' },
      ]},
      { id: 'fri_f3', pool: [
        { id: 'fri_dips', name: 'Dips', sets: 3, reps: '10–12' },
        { id: 'fri_butterfly', name: 'Butterfly', sets: 3, reps: '12–15' },
        { id: 'fri_crossover', name: 'Cable Crossover', sets: 3, reps: '12–15' },
      ]},
      { id: 'fri_f4', pool: [
        { id: 'fri_trizeps_kabel', name: 'Trizepsdrücken Kabel', sets: 3, reps: '12–15' },
        { id: 'fri_skullcrusher', name: 'Skull Crushers', sets: 3, reps: '10–12' },
        { id: 'fri_overhead_tri', name: 'Overhead Trizeps Extension', sets: 3, reps: '10–12' },
      ]},
    ],
    rotationSlots: 2,
    rotationPool: [
      { id: 'fri_schraeg', name: 'Schrägbankdrücken', sets: 3, reps: '8–10' },
      { id: 'fri_seitheben', name: 'Seitheben', sets: 3, reps: '12–15' },
      { id: 'fri_french', name: 'Trizeps French Press', sets: 3, reps: '10–12' },
      { id: 'fri_arnold', name: 'Arnold Press', sets: 3, reps: '10–12' },
    ],
  },
  wed: {
    fixedSlots: [
      { id: 'wed_f1', pool: [
        { id: 'wed_beinpresse', name: 'Beinpresse', sets: 4, reps: '10–12' },
        { id: 'wed_hackenschmidt', name: 'Hackenschmidt Kniebeuge', sets: 4, reps: '10–12' },
        { id: 'wed_goblet', name: 'Goblet Squat', sets: 4, reps: '10–12' },
      ]},
      { id: 'wed_f2', pool: [
        { id: 'wed_kniebeuge', name: 'Kniebeuge (Langhantel)', sets: 4, reps: '6–8' },
        { id: 'wed_frontkniebeuge', name: 'Frontkniebeuge', sets: 4, reps: '6–8' },
        { id: 'wed_smith_squat', name: 'Smith Machine Kniebeuge', sets: 4, reps: '8–10' },
      ]},
      { id: 'wed_f3', pool: [
        { id: 'wed_beinbeuger_liegend', name: 'Beinbeuger liegend', sets: 3, reps: '10–12' },
        { id: 'wed_beinbeuger_sitzend', name: 'Beinbeuger sitzend', sets: 3, reps: '10–12' },
        { id: 'wed_nordic', name: 'Nordic Curls', sets: 3, reps: '6–10' },
      ]},
      { id: 'wed_f4', pool: [
        { id: 'wed_wade_stehend', name: 'Wadenheben stehend', sets: 4, reps: '15–20' },
        { id: 'wed_wade_sitzend', name: 'Wadenheben sitzend', sets: 4, reps: '15–20' },
        { id: 'wed_wade_beinpresse', name: 'Wadenheben an der Beinpresse', sets: 4, reps: '15–20' },
      ]},
    ],
    rotationSlots: 2,
    rotationPool: [
      { id: 'wed_ausfall', name: 'Ausfallschritte', sets: 3, reps: '10/Bein' },
      { id: 'wed_bulgarian', name: 'Bulgarian Split Squats', sets: 3, reps: '10/Bein' },
      { id: 'wed_beinstrecker', name: 'Beinstrecker', sets: 3, reps: '12–15' },
      { id: 'wed_hipthrust', name: 'Hip Thrust', sets: 3, reps: '10–12' },
      { id: 'wed_rdl', name: 'Rumänisches Kreuzheben', sets: 3, reps: '8–10' },
    ],
  },
  fri: {
    fixedSlots: [
      { id: 'mon_f1', pool: [
        { id: 'mon_latzug_breit', name: 'Latzug breit', sets: 4, reps: '6–8' },
        { id: 'mon_kreuzheben', name: 'Kreuzheben', sets: 4, reps: '5–6' },
        { id: 'mon_klimmzug_weit', name: 'Klimmzüge weit', sets: 4, reps: 'AMRAP' },
      ]},
      { id: 'mon_f2', pool: [
        { id: 'mon_latzug_eng', name: 'Latzug eng / V-Griff', sets: 3, reps: '10–12' },
        { id: 'mon_kabelzug_eng', name: 'Kabelzug eng, V-Griff', sets: 3, reps: '10–12' },
        { id: 'mon_chinup', name: 'Chin-Ups eng', sets: 3, reps: 'AMRAP' },
      ]},
      { id: 'mon_f3', pool: [
        { id: 'mon_lh_rudern', name: 'Langhantelrudern vorgebeugt', sets: 4, reps: '8–10' },
        { id: 'mon_kabel_rudern_sitz', name: 'Kabelrudern sitzend', sets: 4, reps: '10–12' },
        { id: 'mon_maschine_rudern', name: 'Rudern Maschine', sets: 4, reps: '10–12' },
      ]},
      { id: 'mon_f4', pool: [
        { id: 'mon_facepull', name: 'Facepulls', sets: 3, reps: '15–20' },
        { id: 'mon_reverse_fly', name: 'Reverse Flys', sets: 3, reps: '15–20' },
        { id: 'mon_band_pullapart', name: 'Band Pull-Apart', sets: 3, reps: '20' },
      ]},
    ],
    rotationSlots: 2,
    rotationPool: [
      { id: 'mon_klimmzug', name: 'Klimmzüge', sets: 3, reps: 'AMRAP' },
      { id: 'mon_kabelrudern', name: 'Kabelrudern eng', sets: 3, reps: '10–12' },
      { id: 'mon_tbar', name: 'T-Bar Rudern', sets: 3, reps: '8–10' },
      { id: 'mon_bizeps', name: 'Bizepscurls (SZ/KH)', sets: 3, reps: '10–12' },
      { id: 'mon_hammer', name: 'Hammercurls', sets: 3, reps: '12–15' },
    ],
  },
};

export const DAY_LABEL: Record<Day, { weekday: string; name: string }> = {
  mon: { weekday: 'Montag', name: 'Push' },
  wed: { weekday: 'Mittwoch', name: 'Leg' },
  fri: { weekday: 'Freitag', name: 'Pull' },
};

export const DELOAD_THRESHOLD = 6;
export const CUSTOM_VALUE = '__custom__';

export function findExerciseMeta(day: Day, exId: string) {
  const plan = PLAN[day];
  const allPools = [...plan.fixedSlots.flatMap((s) => s.pool), ...plan.rotationPool];
  const found = allPools.find((e) => e.id === exId);
  if (found) return found;
  if (exId.endsWith('_custom')) {
    return { id: exId, name: 'Eigene Übung', sets: 3, reps: '8–12' };
  }
  return null;
}
