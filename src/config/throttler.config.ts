export const throttlerConfig = () => ({
  ttl:   60,
  limit: 100,
  auth: {
    ttl:   900,
    limit: 10,
  },
});