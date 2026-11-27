'use client';

import { usePathname } from 'next/navigation';
import { mainLinks, playgroundLink } from '../nav';
import { Logo } from './Logo';

/**
 * The top navigation bar.
 *
 * TOSYN-TODO(module: navigation): plain TS for now. Replace it with the Tosyn navigation element.
 */
export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="nav container" aria-label="Main">
      <a href="/" className="nav-home" aria-label="Tosyn home">
        <Logo height={30} />
      </a>
      <ul className="nav-links">
        {mainLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <a href={playgroundLink.href} className="nav-cta">
        {playgroundLink.label}
      </a>
    </nav>
  );
}
