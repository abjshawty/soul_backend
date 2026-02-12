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

import { Resend } from 'resend';
import { env } from '../helpers';

const resend = new Resend(env.resendApiKey);

(async function () {
  const { data, error } = await resend.emails.send({
    from: 'Soul Gaming <onboarding@resend.dev>',
    to: ['delivered@resend.dev'],
    subject: 'Hello World',
    html: '<strong>It works!</strong>',
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
})();

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