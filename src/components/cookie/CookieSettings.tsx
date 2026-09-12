import React, { useState, useEffect } from 'react';
import './CookieSettings.css';
import { readConsent, saveConsent } from '../../utils/tracking';
import { business } from '../../config/business';

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
    necessary: true, // immer aktiv
    analytics: false,
    marketing: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Gespeicherte Einwilligung laden
  useEffect(() => {
    const consent = readConsent();
    if (consent) {
      setSettings({ necessary: true, analytics: consent.analytics, marketing: consent.marketing });
    }
  }, []);

  const handleToggle = (category: keyof CookieSettingsState) => {
    if (category === 'necessary') return;
    setSettings(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const persist = async (next: CookieSettingsState) => {
    setIsLoading(true);
    saveConsent({ analytics: next.analytics, marketing: next.marketing });
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsLoading(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
    if (onSettingsChange) onSettingsChange(next);
  };

  const saveSettings = () => persist(settings);

  const acceptAll = () => {
    const next = { necessary: true, analytics: true, marketing: true };
    setSettings(next);
    void persist(next);
  };

  const rejectAll = () => {
    const next = { necessary: true, analytics: false, marketing: false };
    setSettings(next);
    void persist(next);
  };

  return (
    <div className="cookie-settings">
      <div className="cookie-settings-header">
        <h3>Cookie-Einstellungen verwalten</h3>
        <p>
          Hier können Sie Ihre Cookie-Präferenzen anpassen. Notwendige Cookies sind immer aktiv,
          da sie für die Grundfunktionen der Website erforderlich sind. Statistik und Marketing
          laden wir erst nach Ihrer Zustimmung.
        </p>
      </div>

      <div className="cookie-categories">
        {/* Notwendig */}
        <div className="cookie-category">
          <div className="cookie-category-header">
            <div className="cookie-category-info">
              <h4>Notwendige Cookies</h4>
              <p>Diese Cookies sind für das Funktionieren der Website unerlässlich.</p>
            </div>
            <div className="cookie-toggle">
              <input
                type="checkbox"
                id="necessary"
                checked={settings.necessary}
                disabled={true}
                className="cookie-checkbox"
                readOnly
              />
              <label htmlFor="necessary" className="cookie-label disabled">
                <span className="cookie-slider"></span>
              </label>
              <span className="cookie-status">Immer aktiv</span>
            </div>
          </div>
          <div className="cookie-details">
            <p><strong>Zweck:</strong> Speichern Ihrer Cookie-Wahl, Sicherheit</p>
            <p><strong>Cookies:</strong> newLivingDesignCookieConsent, nldConsent</p>
            <p><strong>Dauer:</strong> 1 Jahr</p>
          </div>
        </div>

        {/* Statistik */}
        <div className="cookie-category">
          <div className="cookie-category-header">
            <div className="cookie-category-info">
              <h4>Statistik</h4>
              <p>Hilft uns zu verstehen, welche Seiten besucht werden und woher die Besucher kommen.</p>
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
            <p><strong>Anbieter:</strong> Google Analytics 4 (Google Ireland Ltd.), Mess-ID {business.ga4MeasurementId}</p>
            <p><strong>Zweck:</strong> Besucherstatistik, Website-Optimierung; IP-Adresse gekürzt</p>
            <p><strong>Cookies:</strong> _ga, _ga_*</p>
            <p><strong>Dauer:</strong> bis 2 Jahre</p>
          </div>
        </div>

        {/* Marketing */}
        <div className="cookie-category">
          <div className="cookie-category-header">
            <div className="cookie-category-info">
              <h4>Marketing</h4>
              <p>Meta Pixel: misst, ob unsere Anzeigen auf Facebook und Instagram zu Anfragen führen.</p>
            </div>
            <div className="cookie-toggle">
              <input
                type="checkbox"
                id="marketing"
                checked={settings.marketing}
                onChange={() => handleToggle('marketing')}
                className="cookie-checkbox"
              />
              <label htmlFor="marketing" className="cookie-label">
                <span className="cookie-slider"></span>
              </label>
              <span className="cookie-status">
                {settings.marketing ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
          </div>
          <div className="cookie-details">
            <p><strong>Anbieter:</strong> Meta Platforms Ireland Ltd., Pixel-ID {business.metaPixelId}</p>
            <p><strong>Zweck:</strong> Erfolgsmessung und Optimierung unserer Facebook-/Instagram-Anzeigen</p>
            <p><strong>Cookies:</strong> _fbp, _fbc</p>
            <p><strong>Dauer:</strong> 3 Monate</p>
          </div>
        </div>
      </div>

      <div className="cookie-settings-actions">
        <button
          className="cookie-btn cookie-btn-secondary"
          onClick={rejectAll}
          disabled={isLoading}
          type="button"
        >
          Alle ablehnen
        </button>
        <button
          className="cookie-btn cookie-btn-secondary"
          onClick={acceptAll}
          disabled={isLoading}
          type="button"
        >
          Alle akzeptieren
        </button>
        <button
          className="cookie-btn cookie-btn-primary"
          onClick={saveSettings}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? 'Speichern...' : 'Einstellungen speichern'}
        </button>
      </div>

      {savedMessage && (
        <div className="cookie-success-message">
          Ihre Cookie-Einstellungen wurden gespeichert.
        </div>
      )}
    </div>
  );
};

export default CookieSettings;
