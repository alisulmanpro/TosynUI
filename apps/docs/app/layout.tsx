import type { Metadata } from 'next';
import '@tosynui/core/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'TosynUI setup documentation',
  description: 'Setup demonstration documentation for the TosynUI repository.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
