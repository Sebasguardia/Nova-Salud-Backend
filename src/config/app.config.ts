export const appConfig = () => ({
  port:        parseInt(process.env.PORT ?? '4000', 10),
  environment: process.env.NODE_ENV ?? 'development',
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(','),
});