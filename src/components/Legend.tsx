import { RAMP_CSS } from '../lib/color';
import { type as t, ink } from '../lib/type';
import { useNarrow } from '../hooks/useNarrow';

const TICKS = [0, 25, 50, 75, 100];
export default function Legend() {
  const narrow = useNarrow();

  return (
    <div
      style={{
        position: 'fixed',
        left: narrow ? 16 : 28,
        bottom: narrow ? 68 : 44,
        width: narrow ? 'calc(100vw - 32px)' : 264,
        maxWidth: 264,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div style={{ ...t.label, opacity: ink.tertiary, marginBottom: 10 }}>
        Access score
      </div>

      <div style={{ height: 6, borderRadius: 3, background: RAMP_CSS }} />

      <div
        style={{
          ...t.micro,
          marginTop: 7,
          opacity: ink.quiet,
          display: 'flex',
          justifyContent: 'space-between',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {TICKS.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}
