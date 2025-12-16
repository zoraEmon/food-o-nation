import fetch from 'node-fetch';

/**
 * SMS Service for sending notifications
 * Using Semaphore API (free tier available for Philippines)
 * Alternative: Twilio, TextBelt, etc.
 */
export class SMSService {
  private apiKey: string | undefined;
  private senderName: string;

  constructor() {
    this.apiKey = process.env.SEMAPHORE_API_KEY;
    this.senderName = process.env.SMS_SENDER_NAME || 'FoodONation';
  }

  /**
   * Send SMS notification
   * @param phoneNumber - Recipient phone number (e.g., +639171234567 or 09171234567)
   * @param message - Message content (max 160 chars for single SMS)
   */
  async sendSMS(phoneNumber: string, message: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!this.apiKey) {
      console.warn('SMS service not configured: Missing SEMAPHORE_API_KEY');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      // Format phone number to international format
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+63' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+63' + formattedPhone;
      }

      // Semaphore API endpoint
      const url = 'https://api.semaphore.co/api/v4/messages';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apikey: this.apiKey,
          number: formattedPhone,
          message: message,
          sendername: this.senderName,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('SMS sending failed:', response.status, text);
        return { success: false, error: `SMS API error: ${response.status}` };
      }

      const result = await response.json();
      
      // Semaphore returns message_id on success
      if (result.message_id || result[0]?.message_id) {
        return {
          success: true,
          messageId: result.message_id || result[0]?.message_id,
        };
      }

      return { success: false, error: 'SMS sent but no message ID returned' };
    } catch (error: any) {
      console.error('SMS service error:', error);
      return { success: false, error: error?.message || 'Unknown SMS error' };
    }
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmation(
    phoneNumber: string,
    donorName: string,
    amount: number,
    reference: string
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${donorName}! Thank you for your donation of ₱${amount.toFixed(2)} to Food-O-Nation. Reference: ${reference}. Your generosity makes a difference!`;
    
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Send donation pickup reminder SMS
   */
  async sendPickupReminder(
    phoneNumber: string,
    donorName: string,
    scheduledDate: Date,
    donationCenter: string
  ): Promise<{ success: boolean; error?: string }> {
    const dateStr = scheduledDate.toLocaleDateString('en-PH', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const message = `Hi ${donorName}! Reminder: Your donation pickup is scheduled for ${dateStr} at ${donationCenter}. Thank you for your support!`;
    
    return this.sendSMS(phoneNumber, message);
  }
}
