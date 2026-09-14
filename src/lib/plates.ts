// Portiert 1:1 aus trainingsplan.html (calcPlates / platesHTML)
export const BAR_WEIGHT = 20;
export const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export function calcPlates(targetWeight: number): number[] | null {
  let remaining = (targetWeight - BAR_WEIGHT) / 2;
  if (remaining <= 0) return null;
  const used: number[] = [];
  for (const p of PLATES) {
    while (remaining >= p - 0.001) {
      used.push(p);
      remaining -= p;
    }
  }
  return used;
}

export function platesLabel(weight: number | ''): string {
  const w = typeof weight === 'number' ? weight : parseFloat(weight);
  if (!w || isNaN(w) || w < 0) return 'Gewicht eingeben, um Scheiben zu berechnen.';
  const plates = calcPlates(w);
  if (!plates) return `Unter Stangengewicht (${BAR_WEIGHT}kg).`;
  if (plates.length === 0) return `Nur die Stange (${BAR_WEIGHT}kg), keine Scheiben.`;
  return `Pro Seite: ${plates.join(' + ')} kg (Stange ${BAR_WEIGHT}kg)`;
}
