import { useState } from 'react';
import { useNarrow } from '../hooks/useNarrow';

export default function About() {
  const [open, setOpen] = useState(false);
    const narrow = useNarrow();

  return (
    <div
      style={{
        position: 'fixed',
        right: narrow ? 16 : 28,
        left: narrow ? 16 : undefined,
        bottom: narrow ? 20 : 28,
        width: narrow ? undefined : 300,
        zIndex: 6,
        textAlign: 'right',
      }}
    >
      <div
        style={{
          maxHeight: open ? 320 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 320ms ease, opacity 220ms ease',
          textAlign: 'left',
          marginBottom: open ? 10 : 0,
        }}
      >
        <div
          style={{
            background: 'rgba(12, 13, 18, 0.92)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 8,
            padding: '14px 16px',
            fontSize: 11,
            lineHeight: 1.6,
            opacity: 0.72,
          }}
        >
          <Section title="Sources">
            OpenStreetMap via Overpass API, fetched once and served static.
            City boundary from OSM relation 111968. Basemap by MapTiler.
          </Section>

          <Section title="Scoring">
            Each category is divided by a saturation cap, clamped to 1, then
            averaged. Caps: 20 groceries, 0.4 km² of park, 145 transit stops.
            Fixed caps rather than percentiles, so a score means the same thing
            regardless of the bounding box.
          </Section>

          <Section title="Known limitations" last>
            Distance is straight-line, so hills and freeways are invisible.
            The county boundary includes water, so a few offshore cells
            survive. Caps are judgment calls, not derived from survey data.
          </Section>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: '#e8e9ee',
          opacity: 0.45,
          fontFamily: 'inherit',
          fontSize: 10,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        {open ? 'Close' : 'About the data'}
      </button>
    </div>
  );
}

function Section({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div style={{ marginBottom: last ? 0 : 12 }}>
      <div
        style={{
          fontSize: 9,
          letterSpacing: '0.11em',
          textTransform: 'uppercase',
          opacity: 0.5,
          marginBottom: 3,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}