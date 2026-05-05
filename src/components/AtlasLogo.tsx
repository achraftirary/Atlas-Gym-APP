import React from 'react';

interface AtlasLogoProps {
  size?: number;
  accent?: boolean;
  color?: string;
  wordmark?: boolean;
  wordmarkSize?: number;
  dim?: boolean;
  horizontal?: boolean;
  tagline?: boolean;
  style?: React.CSSProperties;
}

// The A mark SVG paths (100×100 viewBox)
// Left leg + right leg + barbell crossbar + barbell plates
const MarkPaths: React.FC<{ accent?: boolean }> = ({ accent }) => (
  <>
    <path d="M 12 92 L 50 6 L 60 6 L 22 92 Z" fill="currentColor" />
    <path d="M 50 6 L 60 6 L 88 92 L 78 92 L 50 28 Z" fill="currentColor" />
    <rect x="32" y="58" width="36" height="10" fill="currentColor" />
    <rect x="25" y="55" width="6" height="16" fill="currentColor" />
    <rect x="69" y="55" width="6" height="16" fill="currentColor" />
    {accent && <path d="M 78 92 L 88 92 L 84 80 L 80 80 Z" fill="#FF3D7F" />}
  </>
);

const AtlasLogo: React.FC<AtlasLogoProps> = ({
  size = 32,
  accent = false,
  color = 'var(--lime)',
  wordmark = false,
  wordmarkSize,
  dim = false,
  horizontal = true,
  tagline = false,
  style,
}) => {
  const wSize = wordmarkSize ?? Math.round(size * 1.15);
  const dimColor = 'rgba(245,241,232,0.38)';

  if (!wordmark) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ color, display: 'block', flexShrink: 0, ...style }}
        aria-label="Atlas Gym logo"
      >
        <MarkPaths accent={accent} />
      </svg>
    );
  }

  if (horizontal) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(size * 0.55), ...style }}>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ color, flexShrink: 0 }} aria-hidden="true">
          <MarkPaths accent={accent} />
        </svg>
        <div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: wSize,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              color: 'var(--text)',
            }}
          >
            ATLAS
            <span style={{ color: dimColor, fontWeight: 500 }}>/</span>
            {tagline ? '' : 'GYM'}
          </div>
          {tagline && (
            <div style={{ fontSize: Math.max(10, Math.round(wSize * 0.28)), color: dimColor, marginTop: 3, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
              GYM · OS
            </div>
          )}
        </div>
      </div>
    );
  }

  // Stacked/centered lockup
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(size * 0.35), ...style }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ color }} aria-hidden="true">
        <MarkPaths accent={accent} />
      </svg>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: wSize,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: 'var(--text)',
        }}
      >
        ATLAS<span style={{ color: dimColor, fontWeight: 500 }}>/</span>GYM
      </div>
    </div>
  );
};

export default AtlasLogo;
