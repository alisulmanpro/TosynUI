import type { Metadata } from 'next';
import './globals.css';
import { docsUrl } from './site';

const title = 'Tosyn intent language reference';
const description =
  'Elements and attributes of the Tosyn intent language, generated from @tosynui/spec.';

export const metadata: Metadata = {
  metadataBase: new URL(docsUrl),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: { title, description, url: '/', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
