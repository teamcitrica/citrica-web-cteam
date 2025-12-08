"use client"
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, use } from 'react';

interface RedirectConfig {
  [key: string]: string;
}

// Configuración de redirecciones por campaña
const REDIRECT_URLS: RedirectConfig = {
  creddicalida: 'https://testflight.apple.com/join/9CW7yc6c',
  // Agrega más campañas aquí
};

function TrackAndRedirect({ campaign }: { campaign: string }) {
  const searchParams = useSearchParams();
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const trackVisit = async () => {
      if (isTracking) return;
      setIsTracking(true);

      const utm_source = searchParams.get('utm_source') || 'direct';
      const redirectUrl = REDIRECT_URLS[campaign] || '/';

      // Usar sendBeacon para garantizar que el request se envíe
      const data = JSON.stringify({ name: campaign, utm_source });
      const blob = new Blob([data], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/track-qr-visit', blob);

      if (!sent) {
        // Fallback a fetch si sendBeacon falla
        try {
          await fetch('/api/track-qr-visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true, // Importante: mantiene el request activo durante navegación
          });
        } catch (error) {
          console.error('Error tracking:', error);
        }
      }

      // Redirigir inmediatamente
      window.location.href = redirectUrl;
    };

    trackVisit();
  }, [campaign, searchParams, isTracking]);

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#000'
    }} />
  );
}

export default function CampaignRedirectPage({
  params
}: {
  params: Promise<{ campaign: string }>
}) {
  const { campaign } = use(params);

  return (
    <Suspense fallback={<div style={{ height: '100vh', backgroundColor: '#000' }} />}>
      <TrackAndRedirect campaign={campaign} />
    </Suspense>
  );
}
