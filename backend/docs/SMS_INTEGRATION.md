# SMS Integration (removed)

SMS-based notifications and dev OTP helpers have been removed from the codebase per project decision.

- OTP verification is delivered via email only.
- If you later want to re-enable SMS functionality, reintroduce an SMS provider in `src/services/sms.service.ts` and corresponding configuration in `.env`.

