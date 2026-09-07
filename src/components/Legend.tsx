import { COLOR_RANGE, toCss } from '../lib/color';

const STEP = 100 / COLOR_RANGE.length;

export default function Legend() {
  return (
    <div
      style={{
        position: 'fixed',
        left: 28,
        bottom: 28,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          opacity: 0.45,
          marginBottom: 8,
        }}
      >
        Access score
      </div>

      <div style={{ display: 'flex' }}>
        {COLOR_RANGE.map((rgb, i) => (
          <div key={i} style={{ width: 44 }}>
            <div style={{ height: 8, background: toCss(rgb) }} />
            <div
              style={{
                fontSize: 11,
                marginTop: 6,
                opacity: 0.6,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Math.round(i * STEP)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}