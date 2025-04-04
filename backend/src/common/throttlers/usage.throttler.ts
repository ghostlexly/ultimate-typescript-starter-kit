import rateLimit from "express-rate-limit";
import { Request } from "express";

export const usageThrottler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // Limit each IP to X requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use both IP address and user email as the key
    const ip = req.clientIp;
    let email = "unknown";

    if (req.context?.account?.customer?.email) {
      email = req.context.account.customer.email;
    }

    return `${ip}-${email}`;
  },
  skip: (req: Request) => {
    // -- Skip rate limiting in test mode
    if (
      process.env.NODE_ENV === "test" &&
      req.headers["x-throttler-test-mode"]
    ) {
      return true;
    }

    return false;
  },
  message: {
    message:
      "You have reached the maximum number of requests for your plan. Please try again later or contact support if you believe this is an error.",
  },
});
