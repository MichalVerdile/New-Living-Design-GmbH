import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../utils/tracking';

/**
 * Meldet Seitenwechsel innerhalb der SPA an GA4 und Meta Pixel.
 * Der erste Aufruf wird ausgelassen: den meldet gtag('config') bzw. fbq('track','PageView') beim Laden.
 */
const RouteTracker = () => {
  const location = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => trackPageView(location.pathname + location.search), 200);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);

  return null;
};

export default RouteTracker;
