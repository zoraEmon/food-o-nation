# SMS Integration Guide

## Overview
Food-O-Nation now supports SMS notifications for payment confirmations using Semaphore API.

## Setup Instructions

### 1. Sign up for Semaphore (Free Tier)
- Visit: https://semaphore.co/
- Sign up for a free account
- Free tier includes: 100 SMS credits for testing
- Philippine numbers only

### 2. Get API Key
1. Log in to Semaphore dashboard
2. Go to **API** section
3. Copy your **API Key**
4. Add to `.env` file:
   ```
   SEMAPHORE_API_KEY=your-api-key-here
   SMS_SENDER_NAME=FoodONation
   ```

### 3. How It Works
When a user completes a monetary donation:
1. System checks if donor has a phone number
2. Sends SMS confirmation with:
   - Donor name
   - Amount donated
   - Payment reference
   - Thank you message

Example SMS:
```
Hi John! Thank you for your donation of ₱500.00 to Food-O-Nation. 
Reference: PAYPAL-1234567890. Your generosity makes a difference!
```

## Alternative SMS Services (Free Options)

### Twilio
- **Free Trial**: $15 credit
- **Website**: https://www.twilio.com/
- **Supports**: Global numbers
- **Setup**: Update `sms.service.ts` to use Twilio API

### TextBelt
- **Free Tier**: 1 text per day
- **Website**: https://textbelt.com/
- **API Key**: Free tier doesn't require API key
- **Limitation**: Very limited for production

### Vonage (formerly Nexmo)
- **Free Credit**: €2 on signup
- **Website**: https://www.vonage.com/
- **Supports**: Global numbers

## Testing SMS

### Test with your phone number:
```bash
# In backend directory
npm run dev

# Make a donation with your phone number
# Check your phone for SMS confirmation
```

### Manual test via curl:
```bash
curl -X POST https://api.semaphore.co/api/v4/messages \
  -H "Content-Type: application/json" \
  -d '{
    "apikey": "YOUR_API_KEY",
    "number": "09171234567",
    "message": "Test message from Food-O-Nation",
    "sendername": "FoodONation"
  }'
```

## Phone Number Format
- Accepts: `09171234567` or `+639171234567`
- System auto-formats to international format

## Troubleshooting

### SMS not received?
1. Check if `SEMAPHORE_API_KEY` is set in `.env`
2. Verify phone number format
3. Check Semaphore dashboard for delivery status
4. Ensure you have SMS credits remaining

### SMS service not configured warning
- This is normal if you haven't set up Semaphore yet
- System will continue to work, just without SMS notifications
- Email notifications will still be sent

## Cost Estimates (After Free Tier)

### Semaphore Pricing (Philippines)
- **Single SMS**: ₱0.50 - ₱1.00 per SMS
- **Bulk**: Lower rates for volume
- **Best for**: Philippine users

### Twilio Pricing (Global)
- **SMS**: $0.0075 per SMS (Philippine numbers)
- **Best for**: International users

## Production Recommendations
1. Use Semaphore for Philippine users (most cost-effective)
2. Implement SMS only for opted-in users
3. Add SMS preferences in user profile
4. Monitor SMS credit usage
5. Set up alerts when credits are low
