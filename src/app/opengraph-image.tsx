import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION } from '@/lib/seo';

export const alt = 'audit/bench — AI code review before it ships';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#10141c',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: '50%',
            marginLeft: -300,
            width: 600,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(43,91,227,0.35) 0%, rgba(43,91,227,0) 70%)',
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ height: 12, width: 12, borderRadius: 999, background: '#c92a3d' }} />
          <span style={{ height: 12, width: 12, borderRadius: 999, background: '#d97706' }} />
          <span style={{ height: 12, width: 12, borderRadius: 999, background: '#1f7a4d' }} />
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 96,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: '#E8ECF4',
            letterSpacing: -2,
          }}
        >
          audit<span style={{ color: '#2b5be3' }}>/</span>bench
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 24,
            maxWidth: 820,
            textAlign: 'center',
            fontSize: 30,
            lineHeight: 1.4,
            color: '#8b96ab',
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    { ...size },
  );
}
