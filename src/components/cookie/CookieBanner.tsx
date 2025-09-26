import React from 'react';
import CookieConsent, { Cookies } from 'react-cookie-consent';
import './CookieBanner.css';

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

const CookieBanner: React.FC = () => {
    const handleAccept = () => {
        enableGoogleAnalytics();
    };

    const handleDecline = () => {
        disableGoogleAnalytics();
    };

    const handleSettings = () => {
        // Scroll to cookie settings on data protection page
        window.location.href = '/datenschutz#cookie-settings';
    };

    return (
        <CookieConsent
            location="bottom"
            buttonText="Alle Cookies akzeptieren"
            declineButtonText="Nur notwendige"
            enableDeclineButton
            onAccept={handleAccept}
            onDecline={handleDecline}
            cookieName="newLivingDesignCookieConsent"
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
                flex: "1 0 300px",
                margin: "0",
                maxWidth: "none"
            }}
            containerClasses="cookie-banner-container"
            buttonClasses="cookie-banner-accept"
            declineButtonClasses="cookie-banner-decline"
        >
            <div className="cookie-banner-content">
                <div className="cookie-banner-icon">
                    🍪
                </div>
                <div className="cookie-banner-text">
                    <h4>Cookie-Einstellungen</h4>
                    <p>
                        Wir verwenden Cookies, um Ihnen die beste Erfahrung auf unserer Website zu bieten.
                        Analytische Cookies helfen uns, unsere Website zu verbessern. Sie können Ihre
                        Einstellungen jederzeit in der <a href="/datenschutz" style={{ color: "#ffffff", textDecoration: "underline" }}>Datenschutzerklärung</a> ändern.
                    </p>
                    <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "10px" }}>
                        🔒 <strong style={{ color: "#ffffff" }}>Notwendige Cookies:</strong> Immer aktiv ·
                    </p>
                    <p>
                        📊 <strong style={{ color: "#ffffff" }}>Analytische Cookies:</strong> Google Analytics für Website-Optimierung
                    </p>
                    <div className="cookie-banner-buttons">
                        <button
                            onClick={handleSettings}
                            className="cookie-banner-settings-btn"
                            type="button"
                        >
                            ⚙️ Einstellungen
                        </button>
                    </div>
                </div>
            </div>
        </CookieConsent>
    );
};

export default CookieBanner;