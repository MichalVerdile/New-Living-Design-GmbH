import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { HeaderProps, NavigationItem } from '../../types';
import './Header.css';
import logo from '../../assets/S__2_-removebg-preview_edited.avif';

const Header: React.FC<HeaderProps> = ({ className = '', navigationItems }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const defaultNavigationItems: NavigationItem[] = [
    { name: 'Home', href: '/', active: true },
    { name: 'Produkte', href: '/produkte' },
    { name: 'Dienstleistungen', href: '/dienstleistungen' },
    { name: 'Unsere Partner', href: '/partner' },
    { name: 'Online Buchen', href: '/booking' },
    { name: 'Über uns', href: '/ueber-uns' },
    { name: 'Kontakt', href: '/kontakt' }
  ];

  const navItems = navigationItems || defaultNavigationItems;

  return (
    <header className={`header ${className}`}>
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <Link to="/">
              <img 
                src={logo} 
                alt="New Living Design Logo" 
                className="logo-image"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${location.pathname === item.href ? 'nav-link-active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="mobile-menu-button">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="menu-toggle"
            >
              <svg className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="nav-mobile">
          <div className="nav-mobile-content">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-mobile-link ${location.pathname === item.href ? 'nav-mobile-link-active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
