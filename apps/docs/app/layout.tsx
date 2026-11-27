import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import { stylesheet } from '@tosynui/render-html';
import './globals.css';
import { SiteFooter } from './components/SiteFooter';
import { SiteNav } from './components/SiteNav';
import { docsUrl } from './site';

const title = 'Tosyn: an intent language for user interfaces';
const description =
  'Describe what a screen does, not how it looks. Tosyn checks it and renders it for the web and React Native, for people and AI models.';

export const metadata: Metadata = {
  metadataBase: new URL(docsUrl),
  title: { default: title, template: '%s · Tosyn' },
  description,
  alternates: { canonical: '/' },
  openGraph: { title, description, url: '/', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* The Tosyn theme variables and component styles. The site is light, so dark mode is off. */}
        <style dangerouslySetInnerHTML={{ __html: stylesheet() }} />
      </head>
      <body>
        <div className="site" data-tosyn="" data-theme="light">
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <SiteNav />
          <main id="main">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
