export default function Header() {
  return (
    <div
      style={{
        position: 'fixed',
        left: 28,
        top: 28,
        maxWidth: 380,
        fontFamily: 'system-ui, sans-serif',
        color: '#e8e9ee',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.4,
        }}
      >
        San Francisco
      </div>

      <h1
        style={{
          margin: '6px 0 0',
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '-0.025em',
          lineHeight: 1.05,
        }}
      >
        Within Walking Distance
      </h1>

      <p
        style={{
          margin: '10px 0 0',
          fontSize: 13,
          lineHeight: 1.5,
          opacity: 0.62,
        }}
      >
        What every block in San Francisco can reach on foot: groceries,
        parks, and transit, scored 0 to 100.
      </p>

      <p
        style={{
          margin: '14px 0 0',
          fontSize: 11,
          lineHeight: 1.55,
          opacity: 0.36,
          borderLeft: '1px solid rgba(255,255,255,0.13)',
          paddingLeft: 10,
        }}
      >
        Counts amenities within a 1200m <strong style={{ fontWeight: 500 }}>straight-line</strong> radius —
        not a walking route. San Francisco's hills are not accounted for.
      </p>
    </div>
  );
}