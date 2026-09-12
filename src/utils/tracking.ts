/**
 * Tracking nur mit Einwilligung.
 *
 * - Google Analytics 4 (Statistik)  -> Kategorie "analytics"
 * - Meta Pixel (Marketing)          -> Kategorie "marketing"
 *
 * Kein Script wird geladen, bevor der Besucher im Cookie-Banner oder in den
 * Cookie-Einstellungen zugestimmt hat. Die Einwilligung liegt im Cookie
 * "nldConsent" als JSON {"analytics":bool,"marketing":bool,"ts":ms}.
 * Das Cookie "newLivingDesignCookieConsent" (react-cookie-consent) steuert nur,
 * ob der Banner angezeigt wird.
 */
import { Cookies } from 'react-cookie-consent';
import { business } from '../config/business';

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
}

export const CONSENT_COOKIE = 'nldConsent';
export const BANNER_COOKIE = 'newLivingDesignCookieConsent';

type Fbq = ((...args: unknown[]) => void) & {
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: unknown;
  callMethod?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const GA_ID = business.ga4MeasurementId;
const PIXEL_ID = business.metaPixelId;

let gaLoaded = false;
let pixelLoaded = false;

export function readConsent(): ConsentState | null {
  const raw = Cookies.get(CONSENT_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return { analytics: !!parsed.analytics, marketing: !!parsed.marketing };
  } catch {
    return null;
  }
}

export function saveConsent(state: ConsentState): void {
  const secure = window.location.protocol === 'https:';
  Cookies.set(CONSENT_COOKIE, JSON.stringify({ ...state, ts: Date.now() }), {
    expires: 365,
    sameSite: 'lax',
    secure,
  });
  Cookies.set(BANNER_COOKIE, state.analytics || state.marketing ? 'true' : 'false', {
    expires: 365,
    sameSite: 'lax',
    secure,
  });
  applyConsent(state);
}

/** Lädt oder deaktiviert die Dienste gemäss Einwilligung. */
export function applyConsent(state: ConsentState): void {
  if (state.analytics) enableGoogleAnalytics();
  else disableGoogleAnalytics();

  if (state.marketing) enableMetaPixel();
  else disableMetaPixel();
}

/** Beim Laden der Seite aufrufen: stellt eine frühere Einwilligung wieder her. */
export function initTrackingFromConsent(): void {
  const state = readConsent();
  if (state) applyConsent(state);
}

/* ---------- Google Analytics 4 ---------- */

function enableGoogleAnalytics(): void {
  window[`ga-disable-${GA_ID}`] = false;
  if (gaLoaded) return;
  gaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  // gtag.js erkennt nur das echte `arguments`-Objekt als Befehl, kein Array.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

function disableGoogleAnalytics(): void {
  window[`ga-disable-${GA_ID}`] = true;
  const idSuffix = GA_ID.replace('G-', '');
  ['_ga', `_ga_${idSuffix}`, '_gid', '_gat', `_gat_gtag_${GA_ID.replace('-', '_')}`].forEach((name) => {
    removeCookieEverywhere(name);
  });
}

/* ---------- Meta Pixel ---------- */

function enableMetaPixel(): void {
  if (pixelLoaded) {
    window.fbq?.('consent', 'grant');
    return;
  }
  pixelLoaded = true;

  // Standard-Bootstrap des Meta Pixel (fbevents.js), ohne eval.
  if (!window.fbq) {
    const fn = function (...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod.apply(n, args);
      } else {
        n.queue.push(args);
      }
    };
    const n = Object.assign(fn, { queue: [] as unknown[][], loaded: true, version: '2.0', push: fn }) as Fbq;
    window.fbq = n;
    window._fbq = n;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
  const fbq = window.fbq as Fbq;
  fbq('consent', 'grant');
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
}

function disableMetaPixel(): void {
  if (pixelLoaded) window.fbq?.('consent', 'revoke');
  ['_fbp', '_fbc'].forEach(removeCookieEverywhere);
}

/** Meldet ein Ereignis an GA4 und Meta Pixel, nur wenn die Dienste geladen sind. */
export function trackLead(source: string): void {
  if (window.gtag && gaLoaded) {
    window.gtag('event', 'generate_lead', { source });
  }
  if (window.fbq && pixelLoaded) {
    window.fbq('track', 'Lead', { content_name: source });
  }
}

/**
 * Seitenwechsel in der SPA. GA4 erfasst Verlaufsänderungen selbst
 * ("Erweiterte Messung" im Datenstream), darum hier nur der Meta Pixel.
 */
export function trackPageView(_path: string): void {
  if (window.fbq && pixelLoaded) {
    window.fbq('track', 'PageView');
  }
}

function removeCookieEverywhere(name: string): void {
  const host = window.location.hostname;
  Cookies.remove(name, { path: '/' });
  Cookies.remove(name, { path: '/', domain: host });
  Cookies.remove(name, { path: '/', domain: `.${host}` });
  const parts = host.split('.');
  if (parts.length > 2) {
    Cookies.remove(name, { path: '/', domain: `.${parts.slice(-2).join('.')}` });
  }
}
