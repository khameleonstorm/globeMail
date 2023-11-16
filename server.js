const express = require('express');
const app = express();
const nodemailer = require('nodemailer');

const cors = require('cors');
require('dotenv').config();

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
});

const verifyTransporter = () => {
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve(success);
      }
    });
  });
};

const sendMail = (mailData) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailData, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });
};

app.listen(process.env.PORT || 5000, () => console.log(`Listening on port ${process.env.PORT || 5000}`));

app.get('/', (req, res) => res.send('API running 🥳'));

app.post('/send-email', async (req, res) => {
  const { amount, fullName, email, date, address, coinNetwork, coinName } = req.body;

  try {
    await verifyTransporter();

    const mailData = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: 'Withdrawal Message!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Withdrawal Message!</title>
        <style>
          body, table, td, div, p, a {
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 100%;
            font: inherit;
            vertical-align: baseline;
          }
      
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4 !important;
          }
      
          /* Add CSS styles inline */
          .header {
            background-color: #263238 !important;
            padding: 20px;
            text-align: center;
          }
      
          .logo {
            max-width: 150px;
            height: auto;
          }
              
          .greeting {
            font-size: 26px !important; 
            font-weight: 500 !important;
            letter-spacing: -1.5px !important;
            word-spacing: 3px !important;
            color: #333333;
            margin-bottom: 20px;
          }
      
          .content {
            background-color: #ffffff;
            padding: 40px 20px;
          }
      
          .message {
            margin-bottom: 20px;
            line-height: 1.5;
          }
      
          .footer {
            background-color: #263238 !important;
            padding: 20px;
            text-align: center;
          }
      
          .footer-logo {
            max-width: 100px;
            height: auto;
            margin-bottom: 10px;
          }
      
          .footer-message {
            font-size: 12px;
            color: #fafafa !important;
            margin-bottom: 10px;
          }
        </style>
      </head>
      
      <body>
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="header">
                    <img class="logo" src="https://www.globetraderz.com/static/media/GLOBE.9b228a70a07a918ae4690b6aa06752c4.svg" alt="Globetraderz">
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <h1 class="greeting">Contact Message!</h1>
                    <p class="message">Name: ${fullName}</p>
                    <p class="message">Email: ${email}</p>
                    <p class="message">Amount: $${amount}</p>
                    <p class="message">Coin Network: ${coinNetwork}</p>
                    <p class="message">Coin Name: ${coinName}</p>
                    <p class="message">Message: ${address}</p>
                    <p class="message">Title: Date ${date}</p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    <img class="footer-logo" src="https://www.globetraderz.com/static/media/GLOBE.9b228a70a07a918ae4690b6aa06752c4.svg" alt="Globetraderz">
                    <p class="footer-message">© 2015 Globetraderz | All Rights Reserved</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    // Send mail
    await sendMail(mailData);

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "An error occurred while sending the email" });
  }
});

