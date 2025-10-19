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

export const sendMail = async (to: string, subject: string, text: string) => {
    console.log("Sending mail to", to);
    const mailOptions = {
        from: `"Edengo", ${env.mailUser}`,
        to,
        subject,
        text
    };
    await transporter.sendMail(mailOptions);
};