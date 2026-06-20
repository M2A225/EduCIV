import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development';

  if (!dsn) {
    console.warn('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    debug: environment !== 'production',
    initialScope: {
      tags: {
        component: 'backend',
        service: 'educiv-api',
      },
    },
  });

  console.log(`[Sentry] Initialized for environment: ${environment}`);
}