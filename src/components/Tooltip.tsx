import type { HexCell } from '../lib/grid';
import { useNarrow } from '../hooks/useNarrow';

type Props = {
  cell: HexCell | null;
  x: number;
  y: number;
  onClose: () => void;
};

const EDGE_PAD = 16;
const CARD_W = 200;

export default function Tooltip({ cell, x, y, onClose }: Props) {
  const narrow = useNarrow();
  const flip = x + CARD_W + EDGE_PAD * 2 > window.innerWidth;

  return (
    <div
     style={{
        position: 'fixed',
        left: narrow ? 16 : x,
        right: narrow ? 16 : undefined,
        top: narrow ? undefined : y,
        bottom: narrow ? 16 : undefined,
        transform: narrow
          ? undefined
          : `translate(${flip ? `calc(-100% - ${EDGE_PAD}px)` : `${EDGE_PAD}px`}, -50%)`,
        width: narrow ? undefined : CARD_W,
        padding: '12px 14px',
        background: 'rgba(12, 13, 18, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: 8,
        color: '#e8e9ee',
        pointerEvents: narrow ? 'auto' : 'none',
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
                {narrow && (
            <button
              onClick={onClose}
              style={{
                marginTop: 12,
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'inherit',
                opacity: 0.4,
                font: 'inherit',
                fontSize: 10,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
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