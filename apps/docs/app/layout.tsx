import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tosyn intent language reference',
  description:
    'Elements and attributes of the Tosyn intent language, generated from @tosynui/spec.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
