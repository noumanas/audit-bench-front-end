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
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M12 3.5l7 2.6v5.4c0 4.5-3 8.2-7 9-4-.8-7-4.5-7-9V6.1l7-2.6z" fill="#2b5be3" />
          <path d="M4.3 9.6L19.7 14.4" stroke="#E8ECF4" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="19.7" cy="14.4" r="1.5" fill="#E8ECF4" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
