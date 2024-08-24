const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectDB = require('./db/mongooseConnect');
const registerUser = require('./db/registerUser');
const loginUser = require('./db/loginUser');
const tokenVerifier = require('./security/tokenVerifier');
const authUpdater = require('./db/updateAuth');
const User = require('./db/userModel');

app.use(express.json());
app.use(express.static('public'));

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d';

const main = async () => {
  await connectDB();
  app.listen(
    port,
    console.log(`Listening on port http://192.168.100.202:${port}`)
  );
};

app.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  const result = await registerUser(email, password, displayName);
  if (result.status !== 'success') {
    res.status(400).json(result);
    return;
  }

  const token = jwt.sign({ email, password }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.status(200).json({
    message: 'User registered successfully',
    token,
    status: 'success',
  });
});

app.get('/login', async (req, res) => {
  const { email, password } = req.query;
  const result = await loginUser(req, email, password);
  if (result.status !== 'success') {
    res.status(400).json(result);
    return;
  }
  const token = jwt.sign({ email, password }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.status(200).json({
    message: 'User logged in',
    status: 'success',
    twofa: result.twofa,
    ...(result.twofa === false && { token }),
  });
});

app.get('/authorize', tokenVerifier, (req, res) => {
  res.status(200).json({ message: 'User authorized', status: 'success' });
});

app.get('/updateAuthType', async (req, res) => {
  const { email, type } = req.query;
  const response = await authUpdater(email, type);
  if (response.status !== 'success') {
    res.status(400).json(result);
    return;
  }

  res.status(200).json({ message: 'Auth updated successfully' });
});

app.get('/authVerify/:id', async (req, res) => {
  const { id } = req.params;

  jwt.verify(id, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error('Invalid token:', err.message);
      return res.status(400).send('Invalid token');
    }

    try {
      const result = await User.findOneAndUpdate(
        { email: decoded.email, password: decoded.password },
        { $set: { 'twofa.status': 'verified' } },
        { new: true }
      );

      if (result) {
        return res.send(`<!DOCTYPE html>
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
      background-color: #101010;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #fff;
      width: 100vw;
      height: 100dvh;
      overflow: hidden;
      font-family: 'Satoshi', sans-serif;
    "
  >
    <h1 style="height: 0rem; font-weight: 600; display: flex; flex-direction: row; justify-content: center; align-items: center; gap: .5rem;">
      Verified
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_196_35)">
          <path
            d="M22 11.0801V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.584C12.7674 22.1954 10.5573 22.122 8.53447 21.3747C6.51168 20.6274 4.78465 19.2462 3.61096 17.4372C2.43727 15.6281 1.87979 13.4882 2.02168 11.3364C2.16356 9.18467 2.99721 7.13643 4.39828 5.49718C5.79935 3.85793 7.69279 2.71549 9.79619 2.24025C11.8996 1.76502 14.1003 1.98245 16.07 2.86011"
            stroke="white"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M22 4L12 14.01L9 11.01"
            stroke="white"
            stroke-width="2.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_196_35">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </h1>
    <p style="opacity: .3; margin-top: 0rem;">
      Email is verified successfully. You can<br />
      close this tab and proceed to the app.
    </p>
  </body>
</html>
`);
      } else {
        return res.status(404).send('User not found or password mismatch');
      }
    } catch (error) {
      return res.status(500).send('Error updating twofa status');
    }
  });
});

app.get('/checkAuth', async (req, res) => {
  try {
    let { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .send({ message: 'Email query parameter is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const password = user.password;

    const token = jwt.sign({ email, password }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const twofa = user.twofa;
    const conditionToken = user.twofa.status;
    res.send({
      twofa,
      message: 'User found',
      ...(conditionToken == 'verified' && { token }),
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send({ message: 'Internal server error.' });
  }
});

app.get('/userData', async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  await res.json(user);
});

app.get('/changeAccountPrivacy', async (req, res) => {
  const { privateAccount, email } = req.query;
  try {
    const result = await User.findOneAndUpdate(
      { email: email },
      { $set: { privateAccount: privateAccount } },
      { new: true }
    );

    if (result) {
      res.status(200).json({
        message: 'User account privacy updated',
        status: true,
        result,
      });
    } else {
      res.status(400).json({ message: 'User not found', status: false });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error updating account privacy', status: false });
  }
});

app.get('/twofaupdate', async (req, res) => {
  const { email, type } = req.query;
  try {
    const result = await User.findOneAndUpdate(
      { email: email },
      { $set: { 'twofa.type': type } },
      { new: true }
    );

    if (result) {
      res
        .status(200)
        .json({ message: 'User authentication updated', status: true, result });
    } else {
      res.status(400).json({ message: 'User not found', status: false });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error updating account privacy', status: false });
  }
});

app.get('/accountremoval', async (req, res) => {
  const { email, token } = req.query;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(404).json({ approved: false, msg: 'Invalid token' });
    }

    try {
      User.findOneAndDelete({ email: email })
        .exec()
        .then((deletedUser) => {
          if (deletedUser) {
            return res.status(200).json({ approved: true });
          } else {
            return res
              .status(404)
              .json({ approved: false, msg: 'No user found with that email.' });
          }
        })
        .catch((err) => {
          return res
            .status(404)
            .json({ approved: false, msg: 'Error deleting user.' });
        });
    } catch (error) {
      return res.status(500).send('Error updating twofa status');
    }
  });
});

app.get('/updateUsername', async (req, res) => {
  const { newDP, token } = req.query;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res
        .status(400)
        .json({ approved: false, msg: 'Invalid token', index: 0 });
    }

    try {
      const user = await User.findOne({ email: decoded.email });

      if (!user) {
        return res.status(404).json({
          approved: false,
          msg: 'User not found',
          index: 0,
        });
      }

      const dpInUse = await User.findOne({ displayName: newDP });

      if (dpInUse) {
        return res.status(400).json({
          approved: false,
          msg: 'Display name already in use',
          index: 0,
        });
      }

      user.displayName = newDP;
      await user.save();
      const result = await User.findOne({ email: decoded.email });

      return res.status(200).json({
        approved: true,
        msg: 'Display name updated',
        index: 0,
        result,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ approved: false, msg: 'An error occured', index: 0 });
    }
  });
});

app.get('/updateEmail', async (req, res) => {
  const { oldEmail, newEmail, token } = req.query;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res
        .status(400)
        .json({ approved: false, msg: 'Invalid token', index: 0 });
    }

    try {
      if (oldEmail !== decoded.email) {
        return res.status(400).json({
          approved: false,
          msg: 'Not expected email address',
          index: 0,
        });
      }

      const user = await User.findOne({ email: decoded.email });

      if (!user) {
        return res.status(404).json({
          approved: false,
          msg: 'User not found',
          index: 0,
        });
      }

      const emailInUse = await User.findOne({ email: newEmail });

      if (emailInUse) {
        return res.status(400).json({
          approved: false,
          msg: 'This email already in use',
          index: 1,
        });
      }

      user.email = newEmail;
      await user.save();
      const result = await User.findOne({ email: newEmail });
      const email = newEmail;
      const password = decoded.password;
      const token = jwt.sign({ email, password }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        approved: true,
        msg: 'Email successfully updated',
        index: 0,
        result,
        token,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ approved: false, msg: 'An error occured', index: 0 });
    }
  });
});

app.get('/updatePassword', async (req, res) => {
  const { oldPwd, newPwd, token } = req.query;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res
        .status(400)
        .json({ approved: false, msg: 'Invalid token', index: 0 });
    }

    try {
      if (oldPwd !== decoded.password) {
        return res.status(400).json({
          approved: false,
          msg: 'Wrong old password',
          index: 0,
        });
      }

      const user = await User.findOne({ email: decoded.email });

      if (!user) {
        return res.status(404).json({
          approved: false,
          msg: 'User not found',
          index: 2,
        });
      }

      const newHashedPassword = await bcrypt.hash(newPwd, 10);
      user.password = newHashedPassword;
      await user.save();
      const result = await User.findOne({ email: decoded.email });
      const email = result.email;
      const password = newPwd;
      const token = jwt.sign({ email, password }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        approved: true,
        msg: 'Password successfully updated',
        index: 2,
        result,
        token,
      });
    } catch (error) {
      console.log(error)
      return res
        .status(400)
        .json({ approved: false, msg: 'An error occured', index: 0 });
    }
  });
});

main();
