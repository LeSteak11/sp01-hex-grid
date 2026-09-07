import type { CSSProperties } from 'react';

export const ink = {
  primary: 1,
  secondary: 0.62,
  tertiary: 0.42,
  quiet: 0.3,
} as const;

export const type = {
  display: {
    fontSize: 34,
    fontWeight: 600,
    letterSpacing: '-0.03em',
    lineHeight: 1.02,
  },
  metric: {
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  body: {
    fontSize: 13,
    fontWeight: 400,
    letterSpacing: '-0.005em',
    lineHeight: 1.5,
  },
  micro: {
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: '0em',
    lineHeight: 1.55,
  },
  label: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.11em',
    textTransform: 'uppercase',
    lineHeight: 1,
  },
} as const satisfies Record<string, CSSProperties>;