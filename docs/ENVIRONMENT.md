# Environment Variables

This document describes the environment variables used in Classroom RPG: Aetheria.

## Optional Configuration

### Sentry Error Tracking (Optional)

To enable error tracking and monitoring with Sentry:

1. Create a `.env.local` file in the root directory
2. Add your Sentry DSN:

```bash
VITE_SENTRY_DSN=your-sentry-dsn-here
```

If `VITE_SENTRY_DSN` is not set, the application will run normally without error tracking.

To get a Sentry DSN:
1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project
3. Copy the DSN from your project settings

### Example `.env.local`

```bash
# Optional: Sentry Error Tracking
VITE_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
```

## Notes

- `.env.local` is gitignored and should never be committed
- All environment variables for Vite must be prefixed with `VITE_`
- The application works without any environment variables configured
