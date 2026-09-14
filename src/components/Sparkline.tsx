// Portiert 1:1 aus trainingsplan.html (sparklineSVG)
interface Props {
  points: number[];
  colorVar: string;
}

export function Sparkline({ points, colorVar }: Props) {
  if (points.length < 2) {
    return <div className="spark-empty">Noch keine Historie — nach dem ersten Speichern siehst du hier den Verlauf.</div>;
  }
  const w = 260, h = 44, pad = 4;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (points.length - 1);
  const coords = points.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = coords.map((c, i) => (i === 0 ? 'M' : 'L') + c[0].toFixed(1) + ',' + c[1].toFixed(1)).join(' ');
  const [lx, ly] = coords[coords.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <path d={path} fill="none" stroke={`var(${colorVar})`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={3} fill={`var(${colorVar})`} />
    </svg>
  );
}
