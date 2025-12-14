import fetch from 'node-fetch';

export type PaymentVerification = {
  success: boolean;
  provider: string;
  transactionId?: string;
  receiptUrl?: string;
  verifiedAt?: Date;
  failureReason?: string;
  raw?: unknown;
};

export class PaymentGatewayService {
  async verifyPayment(method: string, amount: number, reference: string): Promise<PaymentVerification> {
    const normalized = method.toLowerCase();

    if (normalized === 'paypal') {
      return this.verifyPayPalOrder(reference, amount);
    }

    if (['credit card', 'debit card', 'mastercard', 'visa', 'stripe'].includes(normalized)) {
      return this.verifyStripePaymentIntent(reference, amount);
    }

    if (['gcash', 'bank transfer'].includes(normalized)) {
      return this.basicReferenceCheck(reference);
    }

    return { success: false, provider: method, failureReason: `Unsupported payment method: ${method}` };
  }

  private async verifyPayPalOrder(orderId: string, amount: number): Promise<PaymentVerification> {
    const base = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, provider: 'PayPal', failureReason: 'Missing PayPal credentials' };
    }

    const creds = `${clientId}:${clientSecret}`;
    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(creds).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) {
      return { success: false, provider: 'PayPal', failureReason: 'Unable to authenticate with PayPal' };
    }

    const { access_token: token } = (await tokenRes.json()) as { access_token: string };

    const orderRes = await fetch(`${base}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!orderRes.ok) {
      return { success: false, provider: 'PayPal', failureReason: 'Order not found or unauthorized' };
    }

    const order = await orderRes.json();
    const statusOk = order.status === 'COMPLETED';
    const orderAmount = parseFloat(order.purchase_units?.[0]?.amount?.value || '0');
    const amountOk = orderAmount >= amount;

    if (statusOk && amountOk) {
      const receiptUrl = order.links?.find((link: any) => link.rel === 'self')?.href;
      return {
        success: true,
        provider: 'PayPal',
        transactionId: order.id,
        receiptUrl,
        verifiedAt: new Date(),
        raw: order,
      };
    }

    return {
      success: false,
      provider: 'PayPal',
      failureReason: 'Payment not completed or amount mismatch',
      raw: order,
    };
  }

  private async verifyStripePaymentIntent(intentId: string, amount: number): Promise<PaymentVerification> {
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      return { success: false, provider: 'Stripe', failureReason: 'Missing STRIPE_SECRET_KEY' };
    }

    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${intentId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!res.ok) {
      return { success: false, provider: 'Stripe', failureReason: 'PaymentIntent not found or unauthorized' };
    }

    const intent = await res.json();
    const statusOk = intent.status === 'succeeded';
    const amountOk = intent.amount_received >= Math.round(amount * 100);
    const charge = intent.charges?.data?.[0];

    if (statusOk && amountOk) {
      return {
        success: true,
        provider: 'Stripe',
        transactionId: intent.id,
        receiptUrl: charge?.receipt_url,
        verifiedAt: new Date(),
        raw: intent,
      };
    }

    return {
      success: false,
      provider: 'Stripe',
      failureReason: 'Payment not succeeded or amount mismatch',
      raw: intent,
    };
  }

  private async basicReferenceCheck(reference: string): Promise<PaymentVerification> {
    const ok = reference && reference.length >= 5;

    if (ok) {
      return {
        success: true,
        provider: 'Reference',
        transactionId: reference,
        verifiedAt: new Date(),
      };
    }

    return { success: false, provider: 'Reference', failureReason: 'Reference too short' };
  }
}
