import mail from '@sendgrid/mail';
import twilio from 'twilio';
import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/client/client';
import smtpTransport from '@libs/server/email';

mail.setApiKey(process.env.SENDGRID_KEY!);

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
) {
  const { phone, email } = req.body;
  const user = phone ? { phone: Number(phone) } : email ? { email } : null;
  if (!user) return res.status(400).json({ ok: false });
  const payload = String(Math.floor(100000 + Math.random() * 900000));
  const token = await client.token.create({
    data: {
      payload,
      user: {
        connectOrCreate: {
          where: {
            ...user,
          },
          create: {
            name: 'Anonymous',
            ...user,
          },
        },
      },
    },
  });
  if (phone) {
    const message = await twilioClient.messages.create({
      messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICES_SID,
      to: process.env.PHONE_NUMBER!,
      body: `your login token is ${payload}`,
    });
    console.log(message);
  } else if (email) {
    const mailOptions = {
      from: process.env.MAIL_ID,
      to: email,
      subject: 'Your Carrot Market Verification Email',
      text: `Your token is ${payload}`,
      html: `<strong>Your token is ${payload}</strong>`,
    };

    // sendgrid 코드
    // const res = await mail.send({
    //   from: 'padd60@gmail.com',
    //   to: 'padd60@gmail.com',
    //   subject: 'Your Carrot Market Verification Email',
    //   text: `Your token is ${payload}`,
    //   html: `<strong>Your token is ${payload}</strong>`,
    // });

    // node mailer 코드
    await smtpTransport.sendMail(mailOptions, (error, responses) => {
      if (error) {
        console.log(error);
        return null;
      } else {
        console.log(responses);
        return null;
      }
    });
    smtpTransport.close();
  }
  return res.json({
    ok: true,
  });
}

export default withHandler('POST', handler);
