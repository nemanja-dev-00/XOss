const bcrypt = require('bcrypt');
const User = require('./userModel');
const nodemailer = require('nodemailer');
const signToken = require('../security/twoFAauth');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

const loginUser = async (req, email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { status: 'failed', message: 'Email not found', index: 0 };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      if (user.twofa.type) {
        user.twofa.status = 'pending';
        const tokenLink = await signToken(user.email, user.password);
        await user.save();
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'xosappgame@gmail.com',
            pass: process.env.MAILER_KEY,
          },
        });

        const mailOptions = {
          from: `xosapp`,
          to: `${user.email}`,
          subject: 'Code authentication',
          html: `
          <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <link
      href="https://api.fontshare.com/v2/css?f[]=satoshi@1,2&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      display: block;
      width: 100vw;
      height: 100dvh;
      background-color: #101010;
      font-family: 'Satoshi', sans-serif;
      padding: 1rem 2rem;
    "
  >
    <h1 style="color: #fff; font-size: 28px; text-align: left">
      Identity confirmation
    </h1>
    <p
      style="
        color: #fff;
        font-size: 16px;
        text-align: left;
        opacity: 0.3;
        width: 100%;
        max-width: 30rem;
        padding-bottom: 1.5rem;
      "
    >
      With 2FA enabled, your account is now more secure. Each time you log in,
      you'll be prompted to confirm your identity via mail. This extra step
      ensures that only you can access your account.<br /><br />
      If you didn't tried to sign in this time don't proceed by clicking on
      button.
    </p>
    <a
      href="${req.protocol}://${req.get('host')}/authVerify/${tokenLink}"
      style="
        color: #101010;
        text-decoration: none;
        font-size: 24px;
        background: #6B8F00;
        padding: 1rem 2rem;
        border-radius: 10rem;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
        margin-top: 1rem;
      "
      >Confirm</a
    >
  </body>
</html>

          `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          }
        });
      }
      return {
        status: 'success',
        message: 'User logged in',
        index: 0,
        twofa: user.twofa.type,
      };
    } else {
      return { status: 'failed', message: 'Incorrect password', index: 1 };
    }
  } catch (error) {
    console.log(error);
    return { status: 'failed', message: 'Error logging in', index: 1 };
  }
};

module.exports = loginUser;
