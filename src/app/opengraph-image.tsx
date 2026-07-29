import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION } from '@/lib/seo';

export const alt = 'Audit Bench Ai — AI code review before it ships';
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 28 }}>
          <svg width="72" height="72" viewBox="0 0 24 24">
            <path d="M12 3.5l7 2.6v5.4c0 4.5-3 8.2-7 9-4-.8-7-4.5-7-9V6.1l7-2.6z" fill="#2b5be3" />
            <path d="M4.3 9.6L19.7 14.4" stroke="#E8ECF4" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="19.7" cy="14.4" r="1.2" fill="#E8ECF4" />
          </svg>
          <div
            style={{
              display: 'flex',
              gap: 20,
              fontSize: 80,
              fontWeight: 700,
              fontFamily: 'monospace',
              color: '#E8ECF4',
              letterSpacing: -2,
            }}
          >
            <span>Audit Bench</span>
            <span style={{ color: '#2b5be3' }}>Ai</span>
          </div>
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
