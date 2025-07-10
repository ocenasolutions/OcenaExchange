import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    })
    console.log("Email sent successfully to:", to)
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send email")
  }
}

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const subject = "Your OC Exchange Verification Code"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">OC Exchange</h1>
        <p style="color: #666; margin: 5px 0;">Professional Cryptocurrency Trading</p>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #1e293b; margin-bottom: 20px;">Verification Code</h2>
        <p style="color: #475569; margin-bottom: 30px;">
          Use this code to complete your registration:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">
            ${otp}
          </span>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
          This code will expire in 10 minutes for security reasons.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px;">
        <p>If you didn't request this code, please ignore this email.</p>
        <p>&copy; 2024 OC Exchange. All rights reserved.</p>
      </div>
    </div>
  `

  await sendEmail(email, subject, html)
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const subject = "Welcome to OC Exchange!"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">Welcome to OC Exchange!</h1>
        <p style="color: #666; margin: 5px 0;">Professional Cryptocurrency Trading Platform</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
        <h2 style="margin-bottom: 20px;">Hello ${name}! 👋</h2>
        <p style="margin-bottom: 20px; opacity: 0.9;">
          Thank you for joining OC Exchange. Your account has been successfully created and verified.
        </p>
      </div>
      
      <div style="padding: 30px 0;">
        <h3 style="color: #1e293b; margin-bottom: 20px;">What you can do now:</h3>
        <ul style="color: #475569; line-height: 1.8;">
          <li>🚀 Start trading cryptocurrencies with advanced tools</li>
          <li>💼 Manage your digital wallet securely</li>
          <li>📊 Access real-time market data and analytics</li>
          <li>🔒 Enable two-factor authentication for extra security</li>
          <li>📈 Use our professional trading interface</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://ocexchange.com/dashboard" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Get Started Now
        </a>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 14px;">
        <p>Need help? Contact our support team anytime.</p>
        <p><strong>Happy Trading!</strong></p>
        <p>The OC Exchange Team</p>
      </div>
    </div>
  `

  await sendEmail(email, subject, html)
}
