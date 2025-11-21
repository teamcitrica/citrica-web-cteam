"use client"
import { redirect, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

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

      try {
        // Hacer el insert en la tabla qr_visits
        await fetch('/api/track-qr-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: campaign,
            utm_source,
          }),
        });
      } catch (error) {
        console.error('Error tracking visit:', error);
      } finally {
        // Redirigir al usuario independientemente del resultado
        const redirectUrl = REDIRECT_URLS[campaign] || '/';
        window.location.href = redirectUrl;
      }
    };

    trackVisit();
  }, [campaign, searchParams, isTracking]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <p>Redirigiendo...</p>
    </div>
  );
}

export default function CampaignRedirectPage({
  params
}: {
  params: { campaign: string }
}) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <TrackAndRedirect campaign={params.campaign} />
    </Suspense>
  );
}
