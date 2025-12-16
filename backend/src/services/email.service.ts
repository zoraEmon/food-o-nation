import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'foodonation.org@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_email_password_here', // Consider using environment variable for password
  },
});

// Admin email list (consider moving to environment variables or database)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@foodonation.org').split(',');

export class EmailService {
  async sendEmail(to: string, subject: string, htmlContent: string, attachments?: any[]): Promise<void> {
    const mailOptions: any = {
      from: '"Food-O-Nation" <foodonation.org@gmail.com>',
      to: to,
      subject: subject,
      html: htmlContent,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  async sendWelcomeNotification(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Food-O-Nation! Verify Your Account';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #004225;">Welcome, ${name}!</h2>
        <p>Thank you for registering with Food-O-Nation. We're excited to have you join our community.</p>
        <p>To get started, please log in to verify your account and explore how you can make a difference.</p>
        <p style="margin-top: 30px;">
          <a href="#" style="background-color: #ffb000; color: #000000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Log In to Your Account
          </a>
        </p>
        <p style="margin-top: 20px; font-size: 0.8em; color: #666;">If you have any questions, please don't hesitate to contact our support team.</p>
        <p style="font-size: 0.8em; color: #666;">Best regards,<br/>The Food-O-Nation Team</p>
      </div>
    `;
    await this.sendEmail(email, subject, htmlContent);
  }

  async sendOTP(email: string, otp: string): Promise<void> {
    const subject = 'Food-O-Nation: Your Verification Code';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #004225;">Verify Your Food-O-Nation Account</h2>
        <p>Please use the following One-Time Password (OTP) to verify your account:</p>
        <h1 style="color: #ffb000; font-size: 36px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This code is valid for 10 minutes.</p>
        <p style="margin-top: 20px; font-size: 0.8em; color: #666;">If you did not request this, please ignore this email.</p>
        <p style="font-size: 0.8em; color: #666;">Best regards,<br/>The Food-O-Nation Team</p>
      </div>
    `;
    await this.sendEmail(email, subject, htmlContent);
  }

  // ============================================
  // DONATION-SPECIFIC NOTIFICATIONS
  // ============================================

  /**
   * Notify donor about successful monetary donation
   */
  async sendMonetaryDonationConfirmation(
    donorEmail: string,
    donorName: string,
    amount: number,
    paymentReference: string,
    donationId: string,
    provider?: string,
    receiptUrl?: string
  ): Promise<void> {
    const subject = '✅ Monetary Donation Successful - Thank You!';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #004225;">Thank You for Your Generosity, ${donorName}!</h2>
        <p>Your monetary donation has been successfully processed. Here are the details:</p>
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Donation ID:</strong> ${donationId}</p>
          <p><strong>Amount:</strong> ₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          ${provider ? `<p><strong>Provider:</strong> ${provider}</p>` : ''}
          <p><strong>Payment Reference:</strong> ${paymentReference}</p>
          ${receiptUrl ? `<p><strong>Receipt:</strong> <a href="${receiptUrl}">View receipt</a></p>` : ''}
          <p><strong>Date:</strong> ${new Date().toLocaleString('en-PH')}</p>
          <p><strong>Status:</strong> <span style="color: #28a745;">COMPLETED</span></p>
        </div>
        <p>Your contribution will help us make a significant impact in our community. Every peso counts!</p>
        <p style="margin-top: 20px; font-size: 0.8em; color: #666;">You can view your donation history in your dashboard.</p>
        <p style="font-size: 0.8em; color: #666;">Best regards,<br/>The Food-O-Nation Team</p>
      </div>
    `;
    await this.sendEmail(donorEmail, subject, htmlContent);
  }

  /**
   * Notify donor about scheduled produce donation with QR code
   */
  async sendProduceDonationConfirmation(
    donorEmail: string,
    donorName: string,
    scheduledDate: Date,
    donationCenterName: string,
    donationCenterAddress: string,
    qrCodeDataUrl: string,
    donationId: string,
    items: Array<{ name: string; quantity: number; unit: string }>
  ): Promise<void> {
    const itemsList = items
      .map(item => `<li>${item.name} - ${item.quantity} ${item.unit}</li>`)
      .join('');
    
    const subject = '📦 Produce Donation Scheduled - Drop-off Details';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #004225;">Thank You for Scheduling Your Donation, ${donorName}!</h2>
        <p>Your produce donation has been successfully scheduled. Please find the details below:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Donation ID:</strong> ${donationId}</p>
          <p><strong>Scheduled Drop-off:</strong> ${scheduledDate.toLocaleString('en-PH')}</p>
          <p><strong>Drop-off Location:</strong> ${donationCenterName}</p>
          <p><strong>Address:</strong> ${donationCenterAddress}</p>
          <p><strong>Status:</strong> <span style="color: #ffc107;">SCHEDULED</span></p>
        </div>

        <h3 style="color: #004225;">Items to Donate:</h3>
        <ul style="background-color: #fff; padding: 15px 15px 15px 35px; border-radius: 8px;">
          ${itemsList}
        </ul>

        <h3 style="color: #004225;">Your QR Code for Drop-off:</h3>
        <p>Please present this QR code when you arrive at the donation center:</p>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${qrCodeDataUrl}" alt="Donation QR Code" style="max-width: 250px; border: 2px solid #004225; border-radius: 8px; padding: 10px; background: white;" />
        </div>
        
        <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
          <strong>Important:</strong> Please arrive during operating hours and have this QR code ready for scanning.
        </p>
        
        <p style="font-size: 0.8em; color: #666;">Best regards,<br/>The Food-O-Nation Team</p>
      </div>
    `;
    await this.sendEmail(donorEmail, subject, htmlContent);
  }

  /**
   * Notify all admins about a new monetary donation
   */
  async notifyAdminMonetaryDonation(
    donorEmail: string,
    donorName: string,
    amount: number,
    paymentReference: string,
    donationId: string
  ): Promise<void> {
    const subject = `💰 New Monetary Donation: ₱${amount.toLocaleString('en-PH')}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #004225;">New Monetary Donation Received</h2>
        <p>A new monetary donation has been successfully processed:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Donation ID:</strong> ${donationId}</p>
          <p><strong>Donor:</strong> ${donorName} (${donorEmail})</p>
          <p><strong>Amount:</strong> ₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          <p><strong>Payment Reference:</strong> ${paymentReference}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString('en-PH')}</p>
          <p><strong>Status:</strong> <span style="color: #28a745;">COMPLETED</span></p>
        </div>
        
        <p>Please review and update donation records as necessary.</p>
        <p style="font-size: 0.8em; color: #666;">This is an automated notification from Food-O-Nation system.</p>
      </div>
    `;
    
    // Send to all admin emails
    for (const adminEmail of ADMIN_EMAILS) {
      try {
        await this.sendEmail(adminEmail, subject, htmlContent);
      } catch (error) {
        console.error(`Failed to notify admin ${adminEmail}:`, error);
      }
    }
  }

  /**
   * Notify all admins about a new scheduled produce donation
   */
  async notifyAdminProduceDonation(
    donorEmail: string,
    donorName: string,
    scheduledDate: Date,
    donationCenterName: string,
    donationId: string,
    items: Array<{ name: string; quantity: number; unit: string }>
  ): Promise<void> {
    const itemsList = items
      .map(item => `<li>${item.name} - ${item.quantity} ${item.unit}</li>`)
      .join('');
    
    const subject = `📦 New Produce Donation Scheduled - ${donationCenterName}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #004225;">New Produce Donation Scheduled</h2>
        <p>A new produce donation has been scheduled for drop-off:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Donation ID:</strong> ${donationId}</p>
          <p><strong>Donor:</strong> ${donorName} (${donorEmail})</p>
          <p><strong>Scheduled Drop-off:</strong> ${scheduledDate.toLocaleString('en-PH')}</p>
          <p><strong>Drop-off Location:</strong> ${donationCenterName}</p>
          <p><strong>Status:</strong> <span style="color: #ffc107;">SCHEDULED</span></p>
        </div>

        <h3 style="color: #004225;">Items to be Donated:</h3>
        <ul style="background-color: #fff; padding: 15px 15px 15px 35px; border-radius: 8px;">
          ${itemsList}
        </ul>
        
        <p>Please ensure the donation center is prepared to receive this donation on the scheduled date.</p>
        <p style="font-size: 0.8em; color: #666;">This is an automated notification from Food-O-Nation system.</p>
      </div>
    `;
    
    // Send to all admin emails
    for (const adminEmail of ADMIN_EMAILS) {
      try {
        await this.sendEmail(adminEmail, subject, htmlContent);
      } catch (error) {
        console.error(`Failed to notify admin ${adminEmail}:`, error);
      }
    }
  }

  /**
   * Notify donor about failed payment
   */
  async sendPaymentFailureNotification(
    donorEmail: string,
    donorName: string,
    amount: number,
    reason?: string
  ): Promise<void> {
    const subject = '❌ Payment Unsuccessful - Action Required';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #dc3545;">Payment Unsuccessful</h2>
        <p>Dear ${donorName},</p>
        <p>We encountered an issue processing your monetary donation of ₱${amount.toLocaleString('en-PH')}.</p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        
        <p style="margin-top: 20px;">Please try again or contact our support team if the issue persists.</p>
        
        <p style="margin-top: 30px;">
          <a href="#" style="background-color: #ffb000; color: #000000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Try Again
          </a>
        </p>
        
        <p style="margin-top: 20px; font-size: 0.8em; color: #666;">If you have questions, please contact our support team.</p>
        <p style="font-size: 0.8em; color: #666;">Best regards,<br/>The Food-O-Nation Team</p>
      </div>
    `;
    await this.sendEmail(donorEmail, subject, htmlContent);
  }
}
