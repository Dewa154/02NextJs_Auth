import User from '@/models/userModel.model';
import nodemailer from 'nodemailer'
import bcryptjs from 'bcryptjs'

export const sendEmail = async({email, emailType, userId}:any) => {
    try {
      const hashedToken = await bcryptjs.hash(userId.toString(), 10)

      if (emailType === "VERIFY") {
       await User.findByIdAndUpdate(userId, {
          $set: {
            verifyToken: hashedToken, 
            verifyTokenExpiry: new Date(Date.now() + 3600000)
          }});   // 60 minutes
      } else if (emailType === "RESET") {
        await User.findByIdAndDelete(userId, { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000})  // 60 minutes
      }

       // Looking to send emails in production? Check out our Email API/SMTP product!
        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "8288ead162c8f3",   // ❌
              pass: "7980c9d9dfaff6"    // ❌
            }
          });

       const verifyHtml =  `<p>Dear User,</p>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">Verify Email</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The Dewa Team</p>
      `
      
      const resetHtml = `<p>Dear User,</p>
        <p>You have requested to reset your password. Please click the link below to reset your password:</p>
        <p><a href="${process.env.DOMAIN}/resetpassword?token=${hashedToken}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The Dewa Team</p>
      `

          const mailOptions = {
                from: 'dewa@dewa.ai', // sender address
                to: email, // list of receivers
                subject: emailType === 'VERIFY' ? "Verify your email" : "Reset Your Password" , // Subject line

                // text: "Hello world?", // plain text body
                /* html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "Reset your password"} or copy and paste the link below in your browser. <br>
                ${process.env.DOMAIN}/verifyemail?token=${hashedToken} </p>`,  */

                html: emailType === 'VERIFY' ? verifyHtml : resetHtml
          }

          const mailResponse = await transport.sendMail(mailOptions)
          return mailResponse

    } catch (error:any) {
        throw new Error(error.message)
    }
}