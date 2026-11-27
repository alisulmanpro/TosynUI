import { useId } from 'react';

/** The Tosyn mark: a T with a sparkle. Traced from the final logo, so it needs no font. */
const LEAF =
  'M33.95 93.36C28.64 92.32 27.96 89.97 30.34 80.75C30.58 79.82 31.01 78.06 31.30 76.85C31.93 74.23 32.26 72.92 33.20 69.40C33.85 66.95 34.40 64.81 35.68 59.80C36.42 56.91 37.27 53.38 37.49 52.30C39.23 43.86 40.86 40.90 45.28 38.22C47.67 36.77 47.77 36.76 62.65 36.88C73.80 36.97 73.24 36.94 74.05 37.55C75.08 38.34 75.14 39.37 74.34 42.47C74.03 43.67 73.61 45.35 73.40 46.20C73.08 47.53 72.39 50.19 71.30 54.30C71.15 54.88 70.57 57.11 70.02 59.25C67.62 68.64 67.33 69.66 66.59 71.52C61.89 83.35 52.50 90.95 39.75 93.25C38.51 93.48 34.90 93.54 33.95 93.36ZM1.43 37.20C-1.30 36.63 -0.85 32.33 2.65 25.62C6.53 18.20 14.61 12.72 23.20 11.71C24.57 11.55 56.87 11.52 57.74 11.68C60.44 12.18 60.78 14.57 58.71 18.69C57.63 20.86 56.44 22.45 52.96 26.40C52.40 27.03 51.47 28.11 50.90 28.80C46.52 34.03 43.46 35.76 36.25 37.07C35.24 37.25 2.29 37.38 1.43 37.20Z';
const SPARK =
  'M91.5 0.7Q92.1 13.6 103.7 14.7Q92.1 15.8 91.5 28.7Q90.9 15.8 79.3 14.7Q90.9 13.6 91.5 0.7Z';

export function LogoMark({ height = 30 }: { height?: number }) {
  const id = useId();
  return (
    <svg
      width={Math.round((height * 106) / 96)}
      height={height}
      viewBox="-1 -1 106 96"
      aria-hidden="true"
      focusable="false"
      className="logo-mark"
    >
      <defs>
        <linearGradient
          id={`${id}-a`}
          gradientUnits="userSpaceOnUse"
          x1="80"
          y1="6"
          x2="24"
          y2="96"
        >
          <stop stopColor="#A78BFA" />
          <stop offset=".5" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
      </defs>
      <path d={LEAF} fill={`url(#${id}-a)`} />
      <path d={SPARK} fill="#7C3AED" />
    </svg>
  );
}

/** Mark and wordmark. The page that links it gives the link its accessible name. */
export function Logo({ height = 30 }: { height?: number }) {
  return (
    <span className="logo">
      <LogoMark height={height} />
      <span className="logo-word">Tosyn</span>
    </span>
  );
}
