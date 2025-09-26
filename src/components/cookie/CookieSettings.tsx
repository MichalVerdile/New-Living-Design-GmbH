import React, { useState, useEffect } from 'react';
import { Cookies } from 'react-cookie-consent';
import './CookieSettings.css';

// Function to enable Google Analytics
const enableGoogleAnalytics = () => {
  // Create and load Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-KX239CT54D';
  document.head.appendChild(script1);

  // Initialize Google Analytics
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-KX239CT54D');
  `;
  document.head.appendChild(script2);
};

// Function to disable Google Analytics
const disableGoogleAnalytics = () => {
  // Set Google Analytics opt-out
  (window as any)['ga-disable-G-KX239CT54D'] = true;
  
  // Remove existing Google Analytics cookies
  const cookies = ['_ga', '_ga_G-KX239CT54D', '_gid', '_gat_gtag_G-KX239CT54D'];
  cookies.forEach(cookie => {
    Cookies.remove(cookie, { path: '/' });
    Cookies.remove(cookie, { path: '/', domain: window.location.hostname });
    Cookies.remove(cookie, { path: '/', domain: '.' + window.location.hostname });
  });
};

interface CookieSettingsProps {
  onSettingsChange?: (settings: CookieSettingsState) => void;
}

interface CookieSettingsState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieSettings: React.FC<CookieSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<CookieSettingsState>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Load current settings from cookies
  useEffect(() => {
    const consent = Cookies.get('newLivingDesignCookieConsent');
    if (consent === 'true') {
      setSettings(prev => ({
        ...prev,
        analytics: true
      }));
    }
  }, []);

  const handleToggle = (category: keyof CookieSettingsState) => {
    if (category === 'necessary') return; // Cannot disable necessary cookies
    
    setSettings(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    
    // Save settings to cookies
    if (settings.analytics) {
      Cookies.set('newLivingDesignCookieConsent', 'true', { expires: 365 });
      enableGoogleAnalytics();
    } else {
      Cookies.set('newLivingDesignCookieConsent', 'false', { expires: 365 });
      disableGoogleAnalytics();
    }

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsLoading(false);
    setSavedMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setSavedMessage(false), 3000);
    
    // Notify parent component
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  const acceptAll = () => {
    setSettings({
      necessary: true,
      analytics: true,
      marketing: false // Not implemented yet
    });
  };

  const rejectAll = () => {
    setSettings({
      necessary: true,
      analytics: false,
      marketing: false
    });
  };

  return (
    <div className="cookie-settings">
      <div className="cookie-settings-header">
        <h3>🍪 Cookie-Einstellungen verwalten</h3>
        <p>
          Hier können Sie Ihre Cookie-Präferenzen anpassen. Notwendige Cookies sind immer aktiv, 
          da sie für die Grundfunktionen der Website erforderlich sind.
        </p>
      </div>

      <div className="cookie-categories">
        {/* Necessary Cookies */}
        <div className="cookie-category">
          <div className="cookie-category-header">
            <div className="cookie-category-info">
              <h4>🔒 Notwendige Cookies</h4>
              <p>Diese Cookies sind für das Funktionieren der Website unerlässlich.</p>
            </div>
            <div className="cookie-toggle">
              <input
                type="checkbox"
                id="necessary"
                checked={settings.necessary}
                disabled={true}
                className="cookie-checkbox"
              />
              <label htmlFor="necessary" className="cookie-label disabled">
                <span className="cookie-slider"></span>
              </label>
              <span className="cookie-status">Immer aktiv</span>
            </div>
          </div>
          <div className="cookie-details">
            <p><strong>Zweck:</strong> Session-Management, Sicherheit, Cookie-Präferenzen</p>
            <p><strong>Dauer:</strong> Session oder 1 Jahr</p>
          </div>
        </div>

        {/* Analytics Cookies */}
        <div className="cookie-category">
          <div className="cookie-category-header">
            <div className="cookie-category-info">
              <h4>📊 Analytische Cookies</h4>
              <p>Helfen uns zu verstehen, wie Besucher mit der Website interagieren.</p>
            </div>
            <div className="cookie-toggle">
              <input
                type="checkbox"
                id="analytics"
                checked={settings.analytics}
                onChange={() => handleToggle('analytics')}
                className="cookie-checkbox"
              />
              <label htmlFor="analytics" className="cookie-label">
                <span className="cookie-slider"></span>
              </label>
              <span className="cookie-status">
                {settings.analytics ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
          </div>
          <div className="cookie-details">
            <p><strong>Anbieter:</strong> Google Analytics</p>
            <p><strong>Zweck:</strong> Website-Optimierung, Besucherstatistiken</p>
            <p><strong>Cookies:</strong> _ga, _ga_*, _gid</p>
            <p><strong>Dauer:</strong> 2 Jahre (_ga), 24 Stunden (_gid)</p>
          </div>
        </div>

        {/* Marketing Cookies - Future implementation */}
        <div className="cookie-category disabled">
          <div className="cookie-category-header">
            <div className="cookie-category-info">
              <h4>🎯 Marketing Cookies</h4>
              <p>Werden für zielgerichtete Werbung verwendet. (Derzeit nicht implementiert)</p>
            </div>
            <div className="cookie-toggle">
              <input
                type="checkbox"
                id="marketing"
                checked={settings.marketing}
                disabled={true}
                className="cookie-checkbox"
              />
              <label htmlFor="marketing" className="cookie-label disabled">
                <span className="cookie-slider"></span>
              </label>
              <span className="cookie-status">Nicht verfügbar</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cookie-settings-actions">
        <button 
          className="cookie-btn cookie-btn-secondary"
          onClick={rejectAll}
          disabled={isLoading}
        >
          Alle ablehnen
        </button>
        <button 
          className="cookie-btn cookie-btn-secondary"
          onClick={acceptAll}
          disabled={isLoading}
        >
          Alle akzeptieren
        </button>
        <button 
          className="cookie-btn cookie-btn-primary"
          onClick={saveSettings}
          disabled={isLoading}
        >
          {isLoading ? 'Speichern...' : 'Einstellungen speichern'}
        </button>
      </div>

      {savedMessage && (
        <div className="cookie-success-message">
          ✅ Cookie-Einstellungen wurden erfolgreich gespeichert!
        </div>
      )}
    </div>
  );
};

export default CookieSettings;