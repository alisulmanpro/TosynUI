import { plain } from '../marks';
import { footerColumns } from '../nav';
import { Logo } from './Logo';

/**
 * The footer with link columns.
 *
 * TOSYN-TODO(module: footer): plain TS for now. Replace it with the Tosyn footer or link-list
 * element.
 */
export function SiteFooter() {
  return (
    <footer className="footer container" {...plain('footer', 'Footer')}>
      <div className="footer-top">
        <div className="footer-about">
          <Logo height={30} />
          <p>An intent language for user interfaces, made for people and AI models.</p>
        </div>
        <div className="footer-cols">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="footer-legal">© 2026 Tosyn · MIT licence</p>
    </footer>
  );
}
