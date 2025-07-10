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
    console.log(`Email sent successfully to ${to}`)
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
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #64748b; margin: 20px 0;">
          Enter this code to complete your registration. This code will expire in 10 minutes.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0;">
          If you didn't request this code, please ignore this email.
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
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border-radius: 10px;">
        <h2 style="color: #1e293b;">Hello ${name}!</h2>
        <p style="color: #475569; line-height: 1.6;">
          Thank you for joining OC Exchange, the professional cryptocurrency trading platform.
        </p>
        <p style="color: #475569; line-height: 1.6;">
          Your account has been successfully created and verified. You can now:
        </p>
        <ul style="color: #475569; line-height: 1.8;">
          <li>Trade cryptocurrencies with advanced tools</li>
          <li>Manage your digital wallet</li>
          <li>Access real-time market data</li>
          <li>Use our professional trading interface</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://beautiful-mooncake-46997a.netlify.app/auth/login" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px;">
          If you have any questions, our support team is here to help.
        </p>
        <p style="color: #2563eb; font-weight: bold;">The OC Exchange Team</p>
      </div>
    </div>
  `

  await sendEmail(email, subject, html)
}
