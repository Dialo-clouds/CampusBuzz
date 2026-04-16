import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

export async function checkRateLimit(identifier: string) {
  try {
    await rateLimiter.consume(identifier);
    return { success: true };
  } catch (error) {
    return { success: false, message: "Too many requests. Please try again later." };
  }
}