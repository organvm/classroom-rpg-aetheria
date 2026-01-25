import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import * as Sentry from '@sentry/react'
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { initErrorTracking } from './lib/error-tracker.ts'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Initialize error tracking
initErrorTracking()

// Track Web Vitals
function sendToAnalytics(metric: Metric) {
  // Log metrics in development
  if (import.meta.env.DEV) {
    console.log('Web Vital:', metric)
  }
  
  // Send to Sentry if available
  if (import.meta.env.VITE_SENTRY_DSN) {
    // CLS is unitless, others are in milliseconds
    const unit = metric.name === 'CLS' ? 'none' : 'millisecond'
    Sentry.metrics.distribution(metric.name, metric.value, {
      unit,
      tags: { rating: metric.rating }
    })
  }
}

onCLS(sendToAnalytics)
onINP(sendToAnalytics)
onFCP(sendToAnalytics)
onLCP(sendToAnalytics)
onTTFB(sendToAnalytics)

createRoot(document.getElementById('root')!).render(
  <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
    <App />
  </Sentry.ErrorBoundary>
)
