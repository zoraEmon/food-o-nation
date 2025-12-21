# Backend

## Maya Sandbox Setup

To enable Maya payments in sandbox:

- Set environment variables in your backend runtime:

```
MAYA_API_BASE=https://pg-sandbox.paymaya.com
MAYA_SECRET_KEY=sk-<your-sandbox-secret>
```

- The backend verifies payments via `PaymentGatewayService` using Maya Payments v2.
- If `MAYA_SECRET_KEY` is not set, we fall back to a basic reference check for development.

Usage:
- POST /api/donations/monetary with `paymentMethod: "Maya"` and a Maya payment/checkout id in `paymentReference`.


**SMS and dev OTP helpers have been removed.**

- OTP verification is delivered via email only.
- If you later decide to re-enable SMS functionality, reintroduce an SMS provider in `src/services/sms.service.ts` and add configuration to `.env`.
