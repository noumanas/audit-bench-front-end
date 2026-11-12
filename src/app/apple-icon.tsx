import { ImageResponse } from 'next/og';
import { SYMBOL_PATH } from '@/components/Logo';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Brand app icon: white symbol on flat purple ("white on colour", 5.33:1).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#7546f4',
        }}
      >
        <svg width="104" height="96" viewBox="0 0 121.05 111.94">
          <path d={SYMBOL_PATH} fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
