import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { BANNER_COOKIE, saveConsent } from '../../utils/tracking';
import './CookieBanner.css';

const CookieBanner: React.FC = () => {
    const handleAccept = () => {
        saveConsent({ analytics: true, marketing: true });
    };

    const handleDecline = () => {
        saveConsent({ analytics: false, marketing: false });
    };

    const handleSettings = () => {
        // Scroll to cookie settings on data protection page
        window.location.href = '/datenschutz#cookie-settings';
    };

    // ariaAcceptLabel und ariaDeclineLabel: ohne sie liest ein Screenreader die
    // englischen Vorgaben der Bibliothek ("Accept cookies") statt der Beschriftung.
    return (
        <CookieConsent
            location="bottom"
            buttonText="Alle Cookies akzeptieren"
            declineButtonText="Nur notwendige"
            ariaAcceptLabel="Alle Cookies akzeptieren"
            ariaDeclineLabel="Nur notwendige Cookies"
            enableDeclineButton
            onAccept={handleAccept}
            onDecline={handleDecline}
            cookieName={BANNER_COOKIE}
            style={{
                background: "linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(17, 17, 17, 0.98) 100%)",
                color: "#e5e7eb",
                fontSize: "14px",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.4), 0 -2px 8px rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(15px)",
                borderTop: "2px solid rgba(255, 255, 255, 0.15)",
                padding: "25px",
                zIndex: 999999
            }}
            buttonStyle={{
                background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                color: "#111",
                fontSize: "14px",
                fontWeight: "600",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(255, 255, 255, 0.2)",
                marginLeft: "15px"
            }}
            declineButtonStyle={{
                background: "transparent",
                color: "#9ca3af",
                fontSize: "14px",
                fontWeight: "500",
                border: "2px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "8px",
                padding: "10px 20px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginLeft: "10px"
            }}
            contentStyle={{
                flex: "1 1 300px",
                margin: "0",
                minWidth: "0",
                width: "100%",
                maxWidth: "none"
            }}
            containerClasses="cookie-banner-container"
            buttonClasses="cookie-banner-accept"
            declineButtonClasses="cookie-banner-decline"
        >
            <div className="cookie-banner-content">
                <div className="cookie-banner-text">
                    <h4>Cookies und Datenschutz</h4>
                    <p>
                        Wir verwenden Cookies, damit die Website funktioniert und um zu verstehen, wie sie genutzt wird.
                        Statistik (Google Analytics) und Marketing (Meta Pixel) laden wir nur mit Ihrer Zustimmung.
                        Sie können Ihre Wahl jederzeit in der <a href="/datenschutz#cookie-settings" style={{ color: "#ffffff", textDecoration: "underline" }}>Datenschutzerklärung</a> ändern.
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "10px" }}>
                        <strong style={{ color: "#ffffff" }}>Notwendig:</strong> immer aktiv ·{' '}
                        <strong style={{ color: "#ffffff" }}>Statistik:</strong> Google Analytics ·{' '}
                        <strong style={{ color: "#ffffff" }}>Marketing:</strong> Meta Pixel
                    </p>
                    <div className="cookie-banner-buttons">
                        <button
                            onClick={handleSettings}
                            className="cookie-banner-settings-btn"
                            type="button"
                        >
                            Einstellungen
                        </button>
                    </div>
                </div>
            </div>
        </CookieConsent>
    );
};

export default CookieBanner;
