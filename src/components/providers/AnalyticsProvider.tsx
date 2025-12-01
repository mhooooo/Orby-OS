'use client';

import Script from 'next/script';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

/**
 * Analytics Provider
 *
 * Loads analytics scripts and tracks page views.
 * Supports Plausible (default) and PostHog.
 *
 * Environment variables:
 * - NEXT_PUBLIC_ANALYTICS_PROVIDER: 'plausible' | 'posthog' | 'none'
 * - NEXT_PUBLIC_PLAUSIBLE_DOMAIN: Your domain (e.g., 'golfokay.co')
 * - NEXT_PUBLIC_POSTHOG_KEY: Your PostHog project key
 * - NEXT_PUBLIC_POSTHOG_HOST: PostHog host (default: 'https://app.posthog.com')
 */

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  if (!domain) {
    console.warn('[Analytics] Plausible domain not configured. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN');
    return null;
  }

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
      onLoad={() => {
        console.log('[Analytics] Plausible loaded');
      }}
    />
  );
}

function PostHogScript() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    console.warn('[Analytics] PostHog key not configured. Set NEXT_PUBLIC_POSTHOG_KEY');
    return null;
  }

  return (
    <Script
      id="posthog-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('${apiKey}', {
            api_host: '${apiHost}',
            autocapture: true,
            capture_pageview: false, // We handle page views manually
            loaded: function(posthog) {
              console.log('[Analytics] PostHog loaded');
            }
          })
        `,
      }}
    />
  );
}

/**
 * Track page views on route changes
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'plausible';

  return (
    <>
      {provider === 'plausible' && <PlausibleScript />}
      {provider === 'posthog' && <PostHogScript />}
      {provider !== 'none' && (
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
      )}
      {children}
    </>
  );
}
