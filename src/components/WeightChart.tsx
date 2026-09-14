import { useState } from 'react';
import type { HistoryPoint } from '../types';

interface Props {
  points: HistoryPoint[];
  unit?: string;
}

const W = 600;
const H = 220;
const PAD_L = 44;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 28;

export function WeightChart({ points, unit = 'kg' }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (points.length === 0) {
    return <div className="spark-empty">Noch keine Historie für diese Übung.</div>;
  }
  if (points.length === 1) {
    return (
      <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-dim)', fontSize: 13 }}>
        Erst 1 Eintrag ({points[0].max_weight}{unit}, {points[0].date}) — Chart braucht mind. 2 Einheiten.
      </div>
    );
  }

  const values = points.map((p) => p.max_weight);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const yPad = range * 0.15;
  const yMin = min - yPad;
  const yMax = max + yPad;

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const stepX = plotW / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = PAD_L + i * stepX;
    const y = PAD_T + plotH - ((p.max_weight - yMin) / (yMax - yMin)) * plotH;
    return { x, y, ...p };
  });

  const linePath = coords.map((c, i) => (i === 0 ? 'M' : 'L') + c.x.toFixed(1) + ',' + c.y.toFixed(1)).join(' ');

  const gridLines = 4;
  const gridYs = Array.from({ length: gridLines + 1 }, (_, i) => PAD_T + (plotH / gridLines) * i);
  const gridValues = gridYs.map((y) => yMax - ((y - PAD_T) / plotH) * (yMax - yMin));

  const tickEvery = Math.max(1, Math.ceil(points.length / 6));

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    let closest = 0;
    let closestDist = Infinity;
    coords.forEach((c, i) => {
      const d = Math.abs(c.x - mx);
      if (d < closestDist) { closestDist = d; closest = i; }
    });
    setHoverIdx(closest);
  }

  const hovered = hoverIdx != null ? coords[hoverIdx] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
        style={{ overflow: 'visible', cursor: 'crosshair' }}
      >
        {gridYs.map((y, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize={10} fill="var(--text-dim)" fontFamily="JetBrains Mono, monospace">
              {Math.round(gridValues[i])}
            </text>
          </g>
        ))}

        {coords.map((c, i) =>
          i % tickEvery === 0 ? (
            <text key={i} x={c.x} y={H - 8} textAnchor="middle" fontSize={9} fill="var(--text-dim)" fontFamily="JetBrains Mono, monospace">
              {c.date.slice(5)}
            </text>
          ) : null,
        )}

        <path d={linePath} fill="none" stroke="var(--gold)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 3} fill="var(--gold)" />
        ))}

        {hovered && (
          <line x1={hovered.x} x2={hovered.x} y1={PAD_T} y2={PAD_T + plotH} stroke="var(--steel)" strokeWidth={1} strokeDasharray="3,3" />
        )}
      </svg>

      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: `${(hovered.x / W) * 100}%`,
            top: 0,
            transform: hovered.x > W * 0.7 ? 'translateX(-100%)' : 'translateX(8px)',
            background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 6,
            padding: '6px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: 'var(--text)', pointerEvents: 'none', whiteSpace: 'nowrap',
          }}
        >
          <div style={{ color: 'var(--text-dim)' }}>{hovered.date}</div>
          <div><b>{hovered.max_weight}{unit}</b></div>
        </div>
      )}
    </div>
  );
}
