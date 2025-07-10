import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
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
  } catch (error) {
    console.error("Email sending error:", error)
    throw new Error("Failed to send email")
  }
}

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const subject = "Your OC Exchange Verification Code"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">OC Exchange</h1>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: #1e293b; margin-bottom: 20px;">Verification Code</h2>
        <p style="color: #64748b; margin-bottom: 30px;">
          Enter this code to complete your registration:
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">
            ${otp}
          </span>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
          This code will expire in 10 minutes.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
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
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
        <h2 style="color: #1e293b;">Hello ${name}!</h2>
        <p style="color: #64748b; line-height: 1.6;">
          Thank you for joining OC Exchange, the professional cryptocurrency trading platform.
        </p>
        
        <p style="color: #64748b; line-height: 1.6;">
          Your account has been successfully created and verified. You can now:
        </p>
        
        <ul style="color: #64748b; line-height: 1.8;">
          <li>Trade cryptocurrencies with advanced tools</li>
          <li>Manage your digital wallet</li>
          <li>Access real-time market data</li>
          <li>Use our professional trading interface</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://ocexchange.com/dashboard" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Get Started
          </a>
        </div>
        
        <p style="color: #64748b; line-height: 1.6;">
          If you have any questions, our support team is here to help.
        </p>
        
        <p style="color: #64748b; line-height: 1.6;">
          Happy trading!<br>
          <strong>The OC Exchange Team</strong>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
        <p>&copy; 2024 OC Exchange. All rights reserved.</p>
      </div>
    </div>
  `

  await sendEmail(email, subject, html)
}
