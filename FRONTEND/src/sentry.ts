import * as Sentry from '@sentry/react';
import { browserTracingIntegration, replayIntegration } from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_NODE_ENV ?? import.meta.env.MODE ?? 'development';

  if (!dsn) {
    console.warn('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      browserTracingIntegration({
        routingInstrumentation: Sentry.reactRouterV7Instrumentation(
          undefined,
          { startTransactionOnLocationChange: true }
        ),
      }),
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    debug: environment !== 'production',
    initialScope: {
      tags: {
        component: 'frontend',
        service: 'educiv-web',
      },
    },
  });

  console.log(`[Sentry] Initialized for environment: ${environment}`);
}