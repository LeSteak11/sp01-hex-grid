import type { HexCell } from '../lib/grid';

type Props = {
  cell: HexCell | null;
  x: number;
  y: number;
};

const EDGE_PAD = 16;
const CARD_W = 200;

export default function Tooltip({ cell, x, y }: Props) {
  const flip = x + CARD_W + EDGE_PAD * 2 > window.innerWidth;

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        transform: `translate(${flip ? `calc(-100% - ${EDGE_PAD}px)` : `${EDGE_PAD}px`}, -50%)`,
        width: CARD_W,
        padding: '12px 14px',
        background: 'rgba(12, 13, 18, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: 8,
        color: '#e8e9ee',
        pointerEvents: 'none',
        opacity: cell ? 1 : 0,
        transition: 'opacity 180ms ease',
        zIndex: 10,
      }}
    >
      {cell && (
        <>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {Math.round(cell.score)}
          </div>
          <div style={{ fontSize: 10, opacity: 0.45, letterSpacing: '0.09em', textTransform: 'uppercase', marginTop: 4 }}>
            Access score
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 4, fontSize: 12 }}>
            <Row label="Groceries" value={`${cell.counts.grocery}`} />
            <Row label="Park area" value={`${(cell.parkArea / 1e6).toFixed(2)} km²`} />
            <Row label="Transit" value={`${cell.counts.transit}`} />
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ opacity: 0.5 }}>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}