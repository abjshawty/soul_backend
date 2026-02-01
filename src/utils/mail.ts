import nodemailer from "nodemailer";
import { env } from "../helpers";
const transporter = nodemailer.createTransport({
    host: env.mailHost,
    port: env.mailPort,
    secure: env.mailSecure,
    auth: {
        user: env.mailUser,
        pass: env.mailPassword
    }
});

export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
    console.log("Sending mail to", to);
    const mailOptions = {
        from: `"Soul Shop" <${env.mailUser}>`,
        to,
        subject,
        text,
        ...(html && { html })
    };
    await transporter.sendMail(mailOptions);
};