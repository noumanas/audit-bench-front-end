import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#10141c',
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            fontWeight: 700,
            color: '#2b5be3',
            fontFamily: 'monospace',
          }}
        >
          /
        </div>
      </div>
    ),
    { ...size },
  );
}
