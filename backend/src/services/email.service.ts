import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'foodonation.org@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_email_password_here', // Consider using environment variable for password
  },
});

export const sendWelcomeNotification = async (email: string, name: string) => {
  const mailOptions = {
    from: '"Food-O-Nation" <foodonation.org@gmail.com>',
    to: email,
    subject: 'Welcome to Food-O-Nation! Verify Your Account',
    html: `
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome notification sent to ${email}`);
  } catch (error) {
    console.error(`Error sending welcome notification to ${email}:`, error);
  }
};

export const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: '"Food-O-Nation" <foodonation.org@gmail.com>',
    to: email,
    subject: 'Food-O-Nation: Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #FAF7F0; color: #333;">
        <h2 style="color: #004225;">Verify Your Food-O-Nation Account</h2>
        <p>Please use the following One-Time Password (OTP) to verify your account:</p>
        <h1 style="color: #ffb000; font-size: 36px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This code is valid for 10 minutes.</p>
        <p style="margin-top: 20px; font-size: 0.8em; color: #666;">If you did not request this, please ignore this email.</p>
        <p style="font-size: 0.8em; color: #666;">Best regards,<br/>The Food-O-Nation Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Error sending OTP to ${email}:`, error);
  }
};
