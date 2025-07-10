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
    console.log("Sending email to:", to)
    console.log("Subject:", subject)

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
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
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 30px; text-align: center;">
        <h2 style="color: #1e293b; margin-bottom: 20px;">Verification Code</h2>
        <p style="color: #475569; margin-bottom: 30px;">
          Use this code to complete your registration:
        </p>
        
        <div style="background: white; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">
            ${otp}
          </span>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
          This code will expire in 10 minutes for security reasons.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px;">
          If you didn't request this code, please ignore this email.
        </p>
        <p style="color: #94a3b8; font-size: 12px;">
          © 2024 OC Exchange. All rights reserved.
        </p>
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
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 30px;">
        <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${name}!</h2>
        
        <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
          Thank you for joining OC Exchange, the professional cryptocurrency trading platform. 
          Your account has been successfully created and verified.
        </p>
        
        <div style="background: white; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">What you can do now:</h3>
          <ul style="color: #475569; line-height: 1.8;">
            <li>Trade cryptocurrencies with advanced tools</li>
            <li>Manage your digital wallet securely</li>
            <li>Access real-time market data and analytics</li>
            <li>Use our professional trading interface</li>
            <li>Set up advanced trading strategies</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://beautiful-mooncake-46997a.netlify.app/dashboard" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Get Started
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          If you have any questions, our support team is here to help 24/7.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px;">
          Happy trading!<br>
          <strong>The OC Exchange Team</strong>
        </p>
        <p style="color: #94a3b8; font-size: 12px;">
          © 2024 OC Exchange. All rights reserved.
        </p>
      </div>
    </div>
  `

  await sendEmail(email, subject, html)
}
