import { ImageResponse } from 'next/og';
import { SYMBOL_PATH } from '@/components/Logo';

export const alt = 'Audit Bench Ai — Build fast. Check what ships.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Brand cover: copy on flat black, the "Dusk" mesh (purple dominant, black
// falloff, warm edge) on the right. Approximated with layered radial
// gradients because the image renderer can't decode the WebP mesh file.
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#000000' }}>
        <div
          style={{
            width: 600,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 56px',
          }}
        >
          <svg width="76" height="70" viewBox="0 0 121.05 111.94">
            <path d={SYMBOL_PATH} fill="#ffffff" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', color: '#ffffff' }}>
            <div style={{ fontSize: 76, fontWeight: 300, lineHeight: 1.02, letterSpacing: -3 }}>Build fast.</div>
            <div style={{ fontSize: 76, fontWeight: 300, lineHeight: 1.02, letterSpacing: -3 }}>Check what ships.</div>
            <div style={{ marginTop: 28, fontSize: 28, color: '#adadad' }}>AI code review for people building with AI.</div>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            margin: 12,
            borderRadius: 18,
            background:
              'radial-gradient(circle at 85% 95%, #ffe36a 0%, rgba(255,227,106,0) 35%), radial-gradient(circle at 95% 70%, #ff783b 0%, rgba(255,120,59,0) 50%), radial-gradient(circle at 10% 95%, #000000 0%, rgba(0,0,0,0) 55%), #7546f4',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
