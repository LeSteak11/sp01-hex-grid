import { type as t, ink } from '../lib/type';

export default function Header() {
  return (
    <div
      style={{
        position: 'fixed',
        left: 28,
        top: 28,
        maxWidth: 380,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div style={{ ...t.label, letterSpacing: '0.14em', opacity: ink.tertiary }}>
        San Francisco
      </div>

      <h1 style={{ ...t.display, margin: '8px 0 0' }}>
        Within Walking Distance
      </h1>

      <p style={{ ...t.body, margin: '12px 0 0', opacity: ink.secondary }}>
        What every block in San Francisco can reach on foot: groceries,
        parks, and transit, scored 0 to 100.
      </p>

      <p
        style={{
          ...t.micro,
          margin: '16px 0 0',
          opacity: ink.quiet,
          borderLeft: '1px solid rgba(255,255,255,0.13)',
          paddingLeft: 10,
        }}
      >
        200m hex grid. Counts amenities within a 1200m{' '}
        <strong style={{ fontWeight: 500 }}>straight-line</strong> radius — not a
        walking route. San Francisco's hills are not accounted for.
      </p>
    </div>
  );
}