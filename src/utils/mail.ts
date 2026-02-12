// import nodemailer from "nodemailer";
// import { env } from "../helpers";
// const transporter = nodemailer.createTransport({
//     host: env.mailHost,
//     port: env.mailPort,
//     secure: env.mailSecure,
//     auth: {
//         user: env.mailUser,
//         pass: env.mailPassword
//     }
// });

// export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
//     console.log("Sending mail to", to);
//     const mailOptions = {
//         from: `"Soul Shop" <${env.mailUser}>`,
//         to,
//         subject,
//         text,
//         ...(html && { html })
//     };
//     await transporter.sendMail(mailOptions);
// };

/**
 * Resend email service
 */
import { Resend } from 'resend';
import { env } from '../helpers';

const resend = new Resend(env.resendApiKey);

export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
  const emailOptions = {
    from: 'Soul Gaming <admin@test.abjshawty.dev>',
    to: [to],
    subject,
    text,
    ...(html && { html }),
  };

  const { data, error } = await resend.emails.send(emailOptions);

  if (error) {
    console.error({ error });
    throw error;
  }

  console.log({ data });
};