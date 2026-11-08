import { Link } from 'react-router-dom';
import type { FooterProps } from '../../types';
import { business, localBusinessJsonLd } from '../../config/business';
import logo from '../../assets/S__2_-removebg-preview_edited.avif';
import './Footer.css';

const groups = [
  { title: 'New Living Design', links: [['Unternehmen', '/ueber-uns'], ['Unsere Leistungen', '/dienstleistungen'], ['Realisierte Projekte', '/referenzen'], ['Ausstellung & Termine', '/booking'], ['Kontakt', '/kontakt']] },
  { title: 'Ihr Vorhaben', links: [['Badumbau & Pakete', '/badumbau-zofingen'], ['Badplaner', '/badplaner'], ['Inspiration', '/produkte'], ['Marken & Partner', '/partner'], ['Ratgeber', '/blog']] },
  { title: 'Unsere Fachbereiche', links: [['Bad', '/produkte/bad'], ['Küchen', '/produkte/kuechen'], ['Platten', '/produkte/platten'], ['Wellness', '/produkte/wellness']] },
];
export default function Footer({ className = '' }: FooterProps) {
  return <footer className={`footer ${className}`}>
    <div className="nld-container">
      <div className="footer-top">
        <div className="footer-company"><img src={logo} alt="New Living Design" width="110" height="78" /><p>Persönlich beraten.<br />Durchdacht planen.<br />Gemeinsam umsetzen.</p></div>
        <div className="footer-address"><h2>Besuchen Sie uns in Zofingen.</h2><address>{business.address.street}<br />{business.address.zip} {business.address.city}</address><a href={business.mapsLink} target="_blank" rel="noopener noreferrer">Route zur Ausstellung →</a></div>
        <div className="footer-hours"><h2>Wir sind für Sie da.</h2>{business.openingHours.map(hours => <p key={hours.days}>{hours.days}<br /><strong>{hours.opens}–{hours.closes}</strong></p>)}<small>{business.openingHoursNote}</small></div>
      </div>
      <div className="footer-navigation">{groups.map(group => <nav key={group.title} aria-label={group.title}><h2>{group.title}</h2>{group.links.map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}</nav>)}<div><h2>Direkter Kontakt</h2><a href={`tel:${business.phone.e164}`}>{business.phone.display}</a><a href={`tel:${business.phoneSecondary.e164}`}>{business.phoneSecondary.display}</a><a href={`mailto:${business.email}`}>{business.email}</a><div className="footer-social">{Object.entries(business.social).map(([label, href]) => <a key={label} href={href}>{label === 'linkedin' ? 'LinkedIn' : label.charAt(0).toUpperCase() + label.slice(1)}</a>)}</div></div></div>
      <div className="footer-bottom"><p>© {new Date().getFullYear()} New Living Design GmbH</p><nav aria-label="Rechtliches"><Link to="/impressum">Impressum</Link><Link to="/datenschutz">Datenschutz</Link><Link to="/agb">AGB</Link><Link to="/datenschutz#cookie-settings">Cookie-Einstellungen</Link></nav></div>
    </div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
  </footer>;
}
