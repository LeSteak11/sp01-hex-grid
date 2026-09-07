import { type as t, ink } from '../lib/type';

export default function Loader({ done }: { done: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--canvas)',
        display: 'grid',
        placeItems: 'center',
        opacity: done ? 0 : 1,
        pointerEvents: done ? 'none' : 'auto',
        transition: 'opacity 600ms ease',
        zIndex: 20,
      }}
    >
      <div style={{ ...t.label, opacity: ink.quiet }}>
        Building grid
      </div>
    </div>
  );
}