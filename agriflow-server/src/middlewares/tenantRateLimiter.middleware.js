
import rateLimit from "express-rate-limit";



export const tenantRateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.tenantId,
});